/**
 * ZoneEdgesModel.ts
 *
 * Habitable-zone edges for a chosen star (doc/model.md §3): either a real host
 * star from the archive with its planets, the Sun with its rocky planets, or any
 * main-sequence star picked by temperature. The selected planet's starlight and
 * the star's temperature place it on the zone diagram.
 */

import { BooleanProperty, DerivedProperty, NumberProperty, Property, type TReadOnlyProperty } from "scenerystack/axon";
import type { TModel } from "scenerystack/joist";
import {
  dwarfStar,
  type ZoneDistances,
  type ZoneStatus,
  zoneDistances,
  zoneStatus,
} from "../../common/model/habitableZone.js";
import {
  type BodyKey,
  CURATED_HOSTS,
  CURATED_PLANETS,
  planetsOfHost,
  solarPlanet,
} from "../../common/model/planets.js";
import { KOPPARAPU_TEMPERATURE_RANGE, PLANET_MASS_CHOICES, SUN_TEMPERATURE_K } from "../../HabitabilityLabConstants.js";

/** A planet on the zone screen: a real exoplanet or a Solar System planet. */
export type ZonePlanet = {
  /** Archive name; empty for a Solar System planet (named by `bodyKey`). */
  readonly name: string;
  readonly bodyKey: BodyKey | null;
  /** Starlight received, S⊕. */
  readonly insolation: number;
  /** Orbit semi-major axis, AU. */
  readonly distance: number;
  readonly radius: number;
  readonly mass: number | null;
  readonly massMeasured: boolean;
  readonly massIsMinimum: boolean;
  readonly massLimit: number;
  readonly radiusLimit: number;
};

/** A star choice: a real system, the Sun, or a main-sequence star set by temperature ("custom"). */
export type ZoneSystem = {
  readonly key: string;
  readonly luminosity: number;
  readonly temperature: number;
  readonly planets: readonly ZonePlanet[];
};

/** Solar System planets inside the diagram's starlight range: radius (R⊕) and mass (M⊕). */
const SOLAR_ZONE_PLANETS: readonly { key: BodyKey; radius: number; mass: number }[] = [
  { key: "mercury", radius: 0.383, mass: 0.055 },
  { key: "venus", radius: 0.949, mass: 0.815 },
  { key: "earth", radius: 1, mass: 1 },
  { key: "mars", radius: 0.532, mass: 0.107 },
];

export const SOLAR_SYSTEM: ZoneSystem = {
  key: "sun",
  luminosity: 1,
  temperature: SUN_TEMPERATURE_K,
  planets: SOLAR_ZONE_PLANETS.map(({ key, radius, mass }) => {
    const distance = solarPlanet(key).distance;
    return {
      name: "",
      bodyKey: key,
      insolation: 1 / distance ** 2,
      distance: distance,
      radius: radius,
      mass: mass,
      massMeasured: true,
      massIsMinimum: false,
      massLimit: 0,
      radiusLimit: 0,
    };
  }),
};

/** A real host with its curated planets. Its luminosity is L = S a² from a planet's starlight and orbit. */
function realSystem(host: string): ZoneSystem {
  const planets = planetsOfHost(host);
  const reference = planets.find((p) => p.semiMajorAxis !== null && p.insolation > 0) ?? planets[0];
  const luminosity = reference ? reference.insolation * (reference.semiMajorAxis ?? 1) ** 2 : 1;
  return {
    key: host,
    luminosity: luminosity,
    temperature: reference?.starTemperature ?? SUN_TEMPERATURE_K,
    planets: planets.map((p) => ({
      name: p.name,
      bodyKey: null,
      insolation: p.insolation,
      distance: p.semiMajorAxis ?? Math.sqrt(luminosity / p.insolation),
      radius: p.radius,
      mass: p.mass,
      massMeasured: p.massMeasured,
      massIsMinimum: p.massIsMinimum,
      massLimit: p.massLimit,
      radiusLimit: p.radiusLimit,
    })),
  };
}

/** The "any main-sequence star" choice; its values come from the temperature slider. */
export const CUSTOM_SYSTEM_KEY = "custom";

export const ZONE_SYSTEMS: readonly ZoneSystem[] = [
  SOLAR_SYSTEM,
  ...CURATED_HOSTS.map(realSystem),
  { key: CUSTOM_SYSTEM_KEY, luminosity: 1, temperature: SUN_TEMPERATURE_K, planets: [] },
];

/** The default selection: TRAPPIST-1 e, the archetypal temperate red-dwarf planet. */
const DEFAULT_SYSTEM = ZONE_SYSTEMS.find((s) => s.key === "TRAPPIST-1") ?? SOLAR_SYSTEM;
const DEFAULT_PLANET = DEFAULT_SYSTEM.planets.find((p) => p.name === "TRAPPIST-1 e") ?? null;

export class ZoneEdgesModel implements TModel {
  public readonly systemProperty = new Property<ZoneSystem>(DEFAULT_SYSTEM);
  public readonly selectedPlanetProperty = new Property<ZonePlanet | null>(DEFAULT_PLANET);

  /** Temperature of the "any main-sequence star" choice, K. */
  public readonly customTemperatureProperty = new NumberProperty(SUN_TEMPERATURE_K, {
    range: KOPPARAPU_TEMPERATURE_RANGE,
  });

  /** Planet mass (M⊕) used for the runaway-greenhouse edge. */
  public readonly planetMassProperty = new Property<number>(1, { validValues: [...PLANET_MASS_CHOICES] });
  public readonly showArchiveProperty = new BooleanProperty(false);

  /** The star actually drawn: the chosen system, or the slider's main-sequence star. */
  public readonly starTemperatureProperty: TReadOnlyProperty<number>;
  public readonly starLuminosityProperty: TReadOnlyProperty<number>;
  public readonly spectralTypeProperty: TReadOnlyProperty<string>;
  public readonly isCustomProperty: TReadOnlyProperty<boolean>;
  public readonly distancesProperty: TReadOnlyProperty<ZoneDistances>;

  /** Zone status of the selected planet, or null with nothing selected. */
  public readonly selectedStatusProperty: TReadOnlyProperty<ZoneStatus | null>;

  public constructor() {
    this.isCustomProperty = new DerivedProperty([this.systemProperty], (system) => system.key === CUSTOM_SYSTEM_KEY);
    this.starTemperatureProperty = new DerivedProperty(
      [this.systemProperty, this.customTemperatureProperty],
      (system, custom) => (system.key === CUSTOM_SYSTEM_KEY ? custom : system.temperature),
    );
    this.starLuminosityProperty = new DerivedProperty(
      [this.systemProperty, this.customTemperatureProperty],
      (system, custom) => (system.key === CUSTOM_SYSTEM_KEY ? dwarfStar(custom).luminosity : system.luminosity),
    );
    this.spectralTypeProperty = new DerivedProperty([this.starTemperatureProperty], (t) => dwarfStar(t).spectralType);
    this.distancesProperty = new DerivedProperty(
      [this.starLuminosityProperty, this.starTemperatureProperty, this.planetMassProperty],
      (luminosity, temperature, mass) => zoneDistances(luminosity, temperature, mass),
    );
    this.selectedStatusProperty = new DerivedProperty(
      [this.selectedPlanetProperty, this.starTemperatureProperty, this.planetMassProperty],
      (planet, temperature, mass) => (planet ? zoneStatus(planet.insolation, temperature, mass) : null),
    );

    // A new star selects its planet nearest the middle of the zone (Earth for the Sun).
    this.systemProperty.lazyLink((system) => {
      this.selectedPlanetProperty.value = ZoneEdgesModel.middlePlanet(system);
    });
  }

  /** The planet whose starlight is closest (in log) to Earth's, or null. */
  private static middlePlanet(system: ZoneSystem): ZonePlanet | null {
    let best: ZonePlanet | null = null;
    for (const planet of system.planets) {
      if (!best || Math.abs(Math.log(planet.insolation)) < Math.abs(Math.log(best.insolation))) {
        best = planet;
      }
    }
    return best;
  }

  /** The system a curated planet belongs to. */
  public static systemOf(planetName: string): ZoneSystem | undefined {
    const host = CURATED_PLANETS.find((p) => p.name === planetName)?.host;
    return ZONE_SYSTEMS.find((s) => s.key === host);
  }

  /** Selects a planet by archive name, switching to its star. */
  public selectByName(planetName: string): void {
    const system = ZoneEdgesModel.systemOf(planetName);
    if (system) {
      this.systemProperty.value = system;
      this.selectedPlanetProperty.value = system.planets.find((p) => p.name === planetName) ?? null;
    }
  }

  public reset(): void {
    this.systemProperty.reset();
    this.selectedPlanetProperty.reset();
    this.customTemperatureProperty.reset();
    this.planetMassProperty.reset();
    this.showArchiveProperty.reset();
  }

  public step(_dt: number): void {
    // Nothing evolves in time on this screen.
  }
}
