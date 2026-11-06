/**
 * EscapeModel.ts
 *
 * Can a body keep its air? (doc/model.md §5)
 *
 * Molecules view: a gas of one kind at the temperature of the upper atmosphere,
 * on a body with a given escape speed. Readouts give the typical speed, the
 * Jeans parameter, the share of molecules faster than the escape speed, and the
 * "v_esc > 6 v_rms" verdict for every gas. A swarm of molecules leaves the
 * surface with Maxwell–Boltzmann speeds and moves radially in the body's
 * gravity, in units of the body's radius and escape speed (r'' = −1/(2r²));
 * slow ones fall back and are re-launched, fast ones leave and are counted.
 *
 * Cosmic-shoreline view: Solar System bodies and exoplanets on escape speed
 * against starlight, with the line S = (v_esc / 6.5 km/s)⁴.
 */

import {
  BooleanProperty,
  DerivedProperty,
  Emitter,
  NumberProperty,
  Property,
  StringUnionProperty,
  type TReadOnlyProperty,
} from "scenerystack/axon";
import { dotRandom } from "scenerystack/dot";
import type { TModel } from "scenerystack/joist";
import {
  isRetained,
  jeansParameter,
  log10FractionFasterThan,
  mostProbableSpeed,
  rmsSpeed,
} from "../../common/model/escape.js";
import type { BodyKey } from "../../common/model/planets.js";
import { ESCAPE_SPEED_RANGE, GAS_TEMPERATURE_RANGE, MOLECULE_COUNT } from "../../HabitabilityLabConstants.js";

export type GasKey = "h2" | "he" | "h2o" | "n2" | "o2" | "co2";

/** Molecular masses, u. */
export const GAS_MASSES: Record<GasKey, number> = {
  h2: 2.016,
  he: 4.003,
  h2o: 18.015,
  n2: 28.014,
  o2: 31.998,
  co2: 44.01,
};

export const GASES: readonly GasKey[] = ["h2", "he", "h2o", "n2", "o2", "co2"];

export type EscapeBodyKey = Extract<BodyKey, "moon" | "mercury" | "mars" | "venus" | "earth" | "titan" | "jupiter">;
export type EscapePreset = EscapeBodyKey | "custom";

/** Escape speed (km/s) and the temperature where escape happens (K), doc/model.md §5. */
export const ESCAPE_BODIES: Record<EscapeBodyKey, { escapeSpeed: number; temperature: number }> = {
  moon: { escapeSpeed: 2.38, temperature: 250 },
  mercury: { escapeSpeed: 4.25, temperature: 700 },
  mars: { escapeSpeed: 5.03, temperature: 250 },
  venus: { escapeSpeed: 10.36, temperature: 300 },
  earth: { escapeSpeed: 11.19, temperature: 1000 },
  titan: { escapeSpeed: 2.64, temperature: 150 },
  jupiter: { escapeSpeed: 59.5, temperature: 1000 },
};

export const ESCAPE_PRESETS: readonly EscapePreset[] = [
  "moon",
  "mercury",
  "mars",
  "venus",
  "earth",
  "titan",
  "jupiter",
  "custom",
];

export type EscapeView = "molecules" | "shoreline";

/** Height of the top of the animation, in body radii from the centre. */
export const TOP_RADIUS = 3;

/** Wall-clock seconds for a typical hop (a molecule at the most probable speed going up and down). */
const HOP_SECONDS = 1.6;

/** Largest integration step, as a fraction of a typical hop time. */
const MAX_STEP_FRACTION = 0.01;

/** One molecule: distance from the centre (body radii), radial speed (escape speeds), horizontal place (0–1). */
export type Molecule = { r: number; v: number; x: number; escaping: boolean };

export class EscapeModel implements TModel {
  public readonly viewProperty = new StringUnionProperty<EscapeView>("molecules", {
    validValues: ["molecules", "shoreline"],
  });
  public readonly presetProperty = new Property<EscapePreset>("earth");
  public readonly gasProperty = new Property<GasKey>("n2", { validValues: [...GASES] });

  /** Escape speed, km/s. */
  public readonly escapeSpeedProperty = new NumberProperty(ESCAPE_BODIES.earth.escapeSpeed, {
    range: ESCAPE_SPEED_RANGE,
  });

  /** Gas temperature, K. */
  public readonly temperatureProperty = new NumberProperty(ESCAPE_BODIES.earth.temperature, {
    range: GAS_TEMPERATURE_RANGE,
  });
  public readonly showExoplanetsProperty = new BooleanProperty(true);

  /** Typical speeds of the chosen gas, km/s. */
  public readonly mostProbableSpeedProperty: TReadOnlyProperty<number>;
  public readonly rmsSpeedProperty: TReadOnlyProperty<number>;
  public readonly jeansParameterProperty: TReadOnlyProperty<number>;
  /** log₁₀ of the share of molecules faster than the escape speed. */
  public readonly log10EscapingFractionProperty: TReadOnlyProperty<number>;
  public readonly retainedProperty: TReadOnlyProperty<boolean>;
  /** Which gases the rule of thumb keeps, at this escape speed and temperature. */
  public readonly retainedGasesProperty: TReadOnlyProperty<readonly GasKey[]>;

  public readonly molecules: Molecule[] = [];
  public readonly escapedCountProperty = new NumberProperty(0);
  public readonly moleculesMovedEmitter = new Emitter();

  private applyingPreset = false;

  public constructor() {
    this.mostProbableSpeedProperty = new DerivedProperty(
      [this.temperatureProperty, this.gasProperty],
      (t, gas) => mostProbableSpeed(t, GAS_MASSES[gas]) / 1000,
    );
    this.rmsSpeedProperty = new DerivedProperty(
      [this.temperatureProperty, this.gasProperty],
      (t, gas) => rmsSpeed(t, GAS_MASSES[gas]) / 1000,
    );
    this.jeansParameterProperty = new DerivedProperty(
      [this.escapeSpeedProperty, this.temperatureProperty, this.gasProperty],
      (v, t, gas) => jeansParameter(v * 1000, t, GAS_MASSES[gas]),
    );
    this.log10EscapingFractionProperty = new DerivedProperty(
      [this.escapeSpeedProperty, this.temperatureProperty, this.gasProperty],
      (v, t, gas) => log10FractionFasterThan(v * 1000, t, GAS_MASSES[gas]),
    );
    this.retainedProperty = new DerivedProperty(
      [this.escapeSpeedProperty, this.temperatureProperty, this.gasProperty],
      (v, t, gas) => isRetained(v * 1000, t, GAS_MASSES[gas]),
    );
    this.retainedGasesProperty = new DerivedProperty([this.escapeSpeedProperty, this.temperatureProperty], (v, t) =>
      GASES.filter((gas) => isRetained(v * 1000, t, GAS_MASSES[gas])),
    );

    this.presetProperty.lazyLink((preset) => {
      if (preset !== "custom") {
        this.applyingPreset = true;
        this.escapeSpeedProperty.value = ESCAPE_BODIES[preset].escapeSpeed;
        this.temperatureProperty.value = ESCAPE_BODIES[preset].temperature;
        this.applyingPreset = false;
      }
    });
    const markCustom = (): void => {
      if (!this.applyingPreset) {
        this.presetProperty.value = "custom";
      }
    };
    this.escapeSpeedProperty.lazyLink(markCustom);
    this.temperatureProperty.lazyLink(markCustom);

    // A new gas or body starts a fresh swarm.
    const restart = (): void => this.restartMolecules();
    this.gasProperty.lazyLink(restart);
    this.escapeSpeedProperty.lazyLink(restart);
    this.temperatureProperty.lazyLink(restart);
    this.restartMolecules();
  }

  /** Most probable speed in escape-speed units. */
  private relativeSpeed(): number {
    return this.mostProbableSpeedProperty.value / this.escapeSpeedProperty.value;
  }

  /** A launch speed from the 3-D Maxwell–Boltzmann distribution, in escape speeds. */
  private sampleSpeed(): number {
    const sigma = this.relativeSpeed() / Math.SQRT2;
    const a = dotRandom.nextGaussian() * sigma;
    const b = dotRandom.nextGaussian() * sigma;
    const c = dotRandom.nextGaussian() * sigma;
    return Math.sqrt(a * a + b * b + c * c);
  }

  private launch(molecule: Molecule): void {
    molecule.r = 1;
    molecule.v = this.sampleSpeed();
    molecule.x = dotRandom.nextDouble();
    molecule.escaping = molecule.v >= 1;
  }

  /** Fills the swarm with molecules caught at random points of their flights. */
  public restartMolecules(): void {
    this.molecules.length = 0;
    for (let i = 0; i < MOLECULE_COUNT; i++) {
      const molecule: Molecule = { r: 1, v: 0, x: 0, escaping: false };
      this.launch(molecule);
      // Energy per unit mass in these units: E = v²/2 − 1/(2r).
      const energy = molecule.v ** 2 / 2 - 0.5;
      const apex = energy < 0 ? Math.min(TOP_RADIUS, -0.5 / energy) : TOP_RADIUS;
      molecule.r = 1 + dotRandom.nextDouble() * (apex - 1);
      const speed = Math.sqrt(Math.max(0, 2 * energy + 1 / molecule.r));
      molecule.v = dotRandom.nextDouble() < 0.5 || molecule.escaping ? speed : -speed;
      this.molecules.push(molecule);
    }
    this.escapedCountProperty.value = 0;
    this.moleculesMovedEmitter.emit();
  }

  /** Advances the swarm by `seconds` of wall-clock time. */
  public advance(seconds: number): void {
    const relative = this.relativeSpeed();
    // A typical hop (up and down at speed v_p) takes 4 v_p in these units; play it in HOP_SECONDS.
    const simTime = (seconds * 4 * relative) / HOP_SECONDS;
    const maxStep = MAX_STEP_FRACTION * 4 * relative;
    const steps = Math.max(1, Math.ceil(simTime / maxStep));
    const dt = simTime / steps;
    for (const molecule of this.molecules) {
      for (let i = 0; i < steps; i++) {
        // Velocity Verlet in r'' = −1/(2r²).
        const a0 = -0.5 / molecule.r ** 2;
        molecule.r += molecule.v * dt + 0.5 * a0 * dt * dt;
        const a1 = -0.5 / Math.max(molecule.r, 1e-6) ** 2;
        molecule.v += 0.5 * (a0 + a1) * dt;
        if (molecule.r <= 1 && molecule.v < 0) {
          this.launch(molecule);
          break;
        }
        if (molecule.r >= TOP_RADIUS && molecule.escaping) {
          this.escapedCountProperty.value++;
          this.launch(molecule);
          break;
        }
      }
    }
    this.moleculesMovedEmitter.emit();
  }

  public reset(): void {
    this.viewProperty.reset();
    this.applyingPreset = true;
    this.presetProperty.reset();
    this.gasProperty.reset();
    this.escapeSpeedProperty.reset();
    this.temperatureProperty.reset();
    this.applyingPreset = false;
    this.showExoplanetsProperty.reset();
    this.restartMolecules();
  }

  public step(dt: number): void {
    if (this.viewProperty.value === "molecules") {
      this.advance(Math.min(dt, 0.1));
    }
  }
}
