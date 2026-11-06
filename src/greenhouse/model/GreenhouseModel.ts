/**
 * GreenhouseModel.ts
 *
 * A grey greenhouse atmosphere over a planet (doc/model.md §2): starlight and
 * albedo set the bare-rock temperature, the infrared optical depth τ warms the
 * surface (T_s⁴ = T_eq⁴ (1 + ¾τ)), and the surface pressure decides, with the
 * temperature, whether water at the surface is ice, liquid or vapour.
 * Presets reproduce Venus, Earth and Mars from their measured temperatures,
 * plus an "early Mars" with a thicker CO₂ atmosphere under the faint young Sun.
 */

import { DerivedProperty, NumberProperty, Property, type TReadOnlyProperty } from "scenerystack/axon";
import type { TModel } from "scenerystack/joist";
import {
  absorbedFlux,
  emittedFlux,
  equilibriumTemperature,
  greenhouseSurfaceTemperature,
  opticalDepthFor,
  starlight,
} from "../../common/model/climate.js";
import { solarPlanet } from "../../common/model/planets.js";
import { type WaterPhase, waterPhase } from "../../common/model/water.js";
import {
  ALBEDO_RANGE,
  OPTICAL_DEPTH_RANGE,
  PA_PER_BAR,
  PRESSURE_RANGE,
  STARLIGHT_RANGE,
} from "../../HabitabilityLabConstants.js";

export type GreenhousePreset = "venus" | "earth" | "mars" | "earlyMars" | "custom";

export const GREENHOUSE_PRESETS: readonly GreenhousePreset[] = ["venus", "earth", "mars", "earlyMars", "custom"];

type PresetValues = {
  readonly starlight: number;
  readonly albedo: number;
  readonly opticalDepth: number;
  readonly pressure: number;
};

/** The Sun's luminosity 3.8 billion years ago, L☉ (the faint young Sun, ~75 % of today). */
const EARLY_SUN_LUMINOSITY = 0.75;

/** A thick early-Mars CO₂ atmosphere: about 1 bar, τ ≈ 1.5 (still below freezing in this model). */
const EARLY_MARS_OPTICAL_DEPTH = 1.5;
const EARLY_MARS_PRESSURE_BAR = 1;

/** A Solar System planet as it is today: τ chosen to give its measured surface temperature. */
function presentDay(key: "venus" | "earth" | "mars"): PresetValues {
  const planet = solarPlanet(key);
  const s = starlight(1, planet.distance);
  const opticalDepth = opticalDepthFor(planet.surfaceTemperature, equilibriumTemperature(s, planet.albedo));
  return {
    starlight: s,
    albedo: planet.albedo,
    opticalDepth: OPTICAL_DEPTH_RANGE.constrainValue(opticalDepth),
    pressure: planet.surfacePressure,
  };
}

export const PRESET_VALUES: Record<Exclude<GreenhousePreset, "custom">, PresetValues> = {
  venus: presentDay("venus"),
  earth: presentDay("earth"),
  mars: presentDay("mars"),
  earlyMars: {
    starlight: starlight(EARLY_SUN_LUMINOSITY, solarPlanet("mars").distance),
    albedo: solarPlanet("mars").albedo,
    opticalDepth: EARLY_MARS_OPTICAL_DEPTH,
    pressure: EARLY_MARS_PRESSURE_BAR,
  },
};

export class GreenhouseModel implements TModel {
  public readonly presetProperty = new Property<GreenhousePreset>("earth");
  public readonly starlightProperty = new NumberProperty(PRESET_VALUES.earth.starlight, { range: STARLIGHT_RANGE });
  public readonly albedoProperty = new NumberProperty(PRESET_VALUES.earth.albedo, { range: ALBEDO_RANGE });
  public readonly opticalDepthProperty = new NumberProperty(PRESET_VALUES.earth.opticalDepth, {
    range: OPTICAL_DEPTH_RANGE,
  });

  /** Surface pressure, bar. */
  public readonly pressureProperty = new NumberProperty(PRESET_VALUES.earth.pressure, { range: PRESSURE_RANGE });

  public readonly equilibriumTemperatureProperty: TReadOnlyProperty<number>;
  public readonly surfaceTemperatureProperty: TReadOnlyProperty<number>;
  public readonly phaseProperty: TReadOnlyProperty<WaterPhase>;

  /** Sunlight absorbed, infrared from the surface, and infrared the atmosphere sends back down, W/m². */
  public readonly absorbedProperty: TReadOnlyProperty<number>;
  public readonly surfaceInfraredProperty: TReadOnlyProperty<number>;
  public readonly backRadiationProperty: TReadOnlyProperty<number>;

  private applyingPreset = false;

  public constructor() {
    this.equilibriumTemperatureProperty = new DerivedProperty(
      [this.starlightProperty, this.albedoProperty],
      (s, albedo) => equilibriumTemperature(s, albedo),
    );
    this.surfaceTemperatureProperty = new DerivedProperty(
      [this.equilibriumTemperatureProperty, this.opticalDepthProperty],
      (equilibrium, tau) => greenhouseSurfaceTemperature(equilibrium, tau),
    );
    this.phaseProperty = new DerivedProperty([this.surfaceTemperatureProperty, this.pressureProperty], (t, bar) =>
      waterPhase(t, bar * PA_PER_BAR),
    );
    this.absorbedProperty = new DerivedProperty([this.starlightProperty, this.albedoProperty], (s, albedo) =>
      absorbedFlux(s, albedo),
    );
    this.surfaceInfraredProperty = new DerivedProperty([this.surfaceTemperatureProperty], (t) => emittedFlux(t));
    this.backRadiationProperty = new DerivedProperty(
      [this.surfaceInfraredProperty, this.absorbedProperty],
      (up, absorbed) => Math.max(0, up - absorbed),
    );

    this.presetProperty.lazyLink((preset) => {
      if (preset !== "custom") {
        this.applyPreset(PRESET_VALUES[preset]);
      }
    });
    const markCustom = (): void => {
      if (!this.applyingPreset) {
        this.presetProperty.value = "custom";
      }
    };
    this.starlightProperty.lazyLink(markCustom);
    this.albedoProperty.lazyLink(markCustom);
    this.opticalDepthProperty.lazyLink(markCustom);
    this.pressureProperty.lazyLink(markCustom);
  }

  private applyPreset(values: PresetValues): void {
    this.applyingPreset = true;
    this.starlightProperty.value = values.starlight;
    this.albedoProperty.value = values.albedo;
    this.opticalDepthProperty.value = values.opticalDepth;
    this.pressureProperty.value = values.pressure;
    this.applyingPreset = false;
  }

  public reset(): void {
    this.presetProperty.reset();
    this.applyPreset(PRESET_VALUES.earth);
  }

  public step(_dt: number): void {
    // The greenhouse screen shows equilibrium states; nothing evolves in time.
  }
}
