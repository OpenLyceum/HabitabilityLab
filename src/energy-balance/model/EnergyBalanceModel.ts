/**
 * EnergyBalanceModel.ts
 *
 * A bare planet warming or cooling towards equilibrium (doc/model.md §1). The
 * student sets the star's luminosity, the planet's distance and albedo, and how
 * the heat spreads; the temperature follows C dT/dt = S(1 − A)/f − σT⁴ with a
 * clock in years. Choosing a Solar System planet sets distance and albedo and
 * shows its measured surface temperature for comparison.
 */

import {
  DerivedProperty,
  Emitter,
  EnumerationProperty,
  NumberProperty,
  Property,
  StringUnionProperty,
  type TReadOnlyProperty,
} from "scenerystack/axon";
import type { TModel } from "scenerystack/joist";
import { TimeSpeed } from "scenerystack/scenery-phet";
import {
  absorbedFlux,
  emittedFlux,
  equilibriumTemperature,
  type HeatSpread,
  starlight,
  stepTemperature,
} from "../../common/model/climate.js";
import { type BodyKey, SOLAR_PLANETS, solarPlanet } from "../../common/model/planets.js";
import { TimeModel } from "../../common/TimeModel.js";
import {
  ALBEDO_RANGE,
  ENERGY_DISTANCE_RANGE,
  FAST_SPEED_FACTOR,
  HISTORY_YEARS,
  INITIAL_PLANET_TEMPERATURE_K,
  LUMINOSITY_RANGE,
  SLOW_SPEED_FACTOR,
  YEARS_PER_SECOND,
} from "../../HabitabilityLabConstants.js";

/** A preset choice: one of the Solar System planets, or custom values. */
export type EnergyPreset = BodyKey | "custom";

export const ENERGY_PRESETS: readonly EnergyPreset[] = [...SOLAR_PLANETS.map((planet) => planet.key), "custom"];

/** Relative difference below which absorbed and emitted count as balanced. */
const BALANCE_TOLERANCE = 0.01;

export type Trend = "warming" | "cooling" | "balanced";

export class EnergyBalanceModel implements TModel {
  public readonly presetProperty = new Property<EnergyPreset>("earth");
  public readonly luminosityProperty = new NumberProperty(1, { range: LUMINOSITY_RANGE });
  public readonly distanceProperty = new NumberProperty(1, { range: ENERGY_DISTANCE_RANGE });
  public readonly albedoProperty = new NumberProperty(solarPlanet("earth").albedo, { range: ALBEDO_RANGE });
  public readonly heatSpreadProperty = new StringUnionProperty<HeatSpread>("wholePlanet", {
    validValues: ["wholePlanet", "daySide"],
  });

  /** The planet's current temperature, K. */
  public readonly temperatureProperty = new NumberProperty(INITIAL_PLANET_TEMPERATURE_K);

  public readonly timer = new TimeModel(true);
  public readonly timeSpeedProperty = new EnumerationProperty(TimeSpeed.NORMAL);

  /** Elapsed simulated time, years. */
  public readonly yearsProperty = new NumberProperty(0);

  /** (years, kelvin) samples of the recent temperature history. */
  public readonly history: [number, number][] = [];
  public readonly historyChangedEmitter = new Emitter();

  public readonly starlightProperty: TReadOnlyProperty<number>;
  public readonly absorbedProperty: TReadOnlyProperty<number>;
  public readonly emittedProperty: TReadOnlyProperty<number>;
  public readonly equilibriumTemperatureProperty: TReadOnlyProperty<number>;
  public readonly trendProperty: TReadOnlyProperty<Trend>;

  /** The preset planet's measured mean surface temperature, K, or null for custom values. */
  public readonly measuredTemperatureProperty: TReadOnlyProperty<number | null>;

  private applyingPreset = false;

  public constructor() {
    this.starlightProperty = new DerivedProperty(
      [this.luminosityProperty, this.distanceProperty],
      (luminosity, distance) => starlight(luminosity, distance),
    );
    this.absorbedProperty = new DerivedProperty(
      [this.starlightProperty, this.albedoProperty, this.heatSpreadProperty],
      (s, albedo, spread) => absorbedFlux(s, albedo, spread),
    );
    this.emittedProperty = new DerivedProperty([this.temperatureProperty], (t) => emittedFlux(t));
    this.equilibriumTemperatureProperty = new DerivedProperty(
      [this.starlightProperty, this.albedoProperty, this.heatSpreadProperty],
      (s, albedo, spread) => equilibriumTemperature(s, albedo, spread),
    );
    this.trendProperty = new DerivedProperty([this.absorbedProperty, this.emittedProperty], (absorbed, emitted) => {
      const scale = Math.max(absorbed, emitted, 1e-9);
      return Math.abs(absorbed - emitted) / scale < BALANCE_TOLERANCE
        ? "balanced"
        : absorbed > emitted
          ? "warming"
          : "cooling";
    });
    this.measuredTemperatureProperty = new DerivedProperty([this.presetProperty], (preset) =>
      preset === "custom" ? null : solarPlanet(preset).surfaceTemperature,
    );

    this.presetProperty.lazyLink((preset) => {
      if (preset !== "custom") {
        const planet = solarPlanet(preset);
        this.applyingPreset = true;
        this.luminosityProperty.value = 1;
        this.distanceProperty.value = planet.distance;
        this.albedoProperty.value = planet.albedo;
        this.applyingPreset = false;
      }
    });
    // Moving a slider away from the preset's values makes the choice "custom".
    const markCustom = (): void => {
      if (!this.applyingPreset) {
        this.presetProperty.value = "custom";
      }
    };
    this.luminosityProperty.lazyLink(markCustom);
    this.distanceProperty.lazyLink(markCustom);
    this.albedoProperty.lazyLink(markCustom);

    this.recordHistory();
  }

  /** Advances the planet by `years` of simulated time. */
  public advance(years: number): void {
    this.temperatureProperty.value = stepTemperature(
      this.temperatureProperty.value,
      this.absorbedProperty.value,
      years,
    );
    this.yearsProperty.value += years;
    this.recordHistory();
  }

  /** Sets the temperature straight to equilibrium. */
  public jumpToEquilibrium(): void {
    this.temperatureProperty.value = this.equilibriumTemperatureProperty.value;
    this.recordHistory();
  }

  private recordHistory(): void {
    const now = this.yearsProperty.value;
    this.history.push([now, this.temperatureProperty.value]);
    while (this.history.length > 2 && (this.history[1]?.[0] ?? now) < now - HISTORY_YEARS) {
      this.history.shift();
    }
    this.historyChangedEmitter.emit();
  }

  public reset(): void {
    this.presetProperty.reset();
    this.applyingPreset = true;
    this.luminosityProperty.reset();
    this.distanceProperty.reset();
    this.albedoProperty.reset();
    this.applyingPreset = false;
    this.heatSpreadProperty.reset();
    this.temperatureProperty.reset();
    this.timer.reset();
    this.timeSpeedProperty.reset();
    this.yearsProperty.reset();
    this.history.length = 0;
    this.recordHistory();
  }

  public step(dt: number): void {
    if (this.timer.isPlayingProperty.value) {
      const speed = this.timeSpeedProperty.value;
      const factor = speed === TimeSpeed.SLOW ? SLOW_SPEED_FACTOR : speed === TimeSpeed.FAST ? FAST_SPEED_FACTOR : 1;
      // Cap dt so a backgrounded tab does not jump decades at once.
      this.advance(Math.min(dt, 0.1) * YEARS_PER_SECOND * factor);
    }
  }
}
