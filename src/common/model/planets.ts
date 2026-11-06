/**
 * planets.ts
 *
 * Real planets from the NASA Exoplanet Archive snapshot (planets.json, built by
 * scripts/extract-planets.ts) and Solar System reference bodies used across the
 * screens. Solar System values: NASA planetary fact sheets.
 */

import planetData from "./data/planets.json";

/** A named exoplanet with the values its info card shows (null where the archive has none). */
export type CuratedPlanet = {
  readonly name: string;
  readonly host: string;
  readonly insolation: number;
  readonly starTemperature: number;
  readonly radius: number;
  readonly mass: number | null;
  /** True when a paper measured the mass (or minimum mass), false when the archive estimated it from the radius. */
  readonly massMeasured: boolean;
  /** True when the mass is a minimum mass, M sin i, from radial velocities alone. */
  readonly massIsMinimum: boolean;
  readonly massLimit: number;
  readonly radiusLimit: number;
  readonly semiMajorAxis: number | null;
  readonly eccentricity: number | null;
  readonly starMass: number | null;
  readonly starRadius: number | null;
};

/** A planet with a measured mass and radius on the cosmic-shoreline plot. */
export type ShorelinePlanet = {
  readonly name: string;
  readonly escapeSpeed: number;
  readonly insolation: number;
  readonly starTemperature: number;
};

export const ARCHIVE_RETRIEVED: string = planetData.retrieved;

export const CURATED_PLANETS: readonly CuratedPlanet[] = planetData.curated.map((p) => ({
  name: p.name,
  host: p.host,
  insolation: p.insolation ?? Number.NaN,
  starTemperature: p.starTemperature ?? Number.NaN,
  radius: p.radius ?? Number.NaN,
  mass: p.mass,
  massMeasured: p.massMeasured,
  massIsMinimum: p.massIsMinimum,
  massLimit: p.massLimit,
  radiusLimit: p.radiusLimit,
  semiMajorAxis: p.semiMajorAxis,
  eccentricity: p.eccentricity,
  starMass: p.starMass,
  starRadius: p.starRadius,
}));

/** [starlight S⊕, star temperature K] of every archive planet smaller than 2 R⊕. */
export const SMALL_PLANETS: readonly (readonly [number, number])[] = planetData.small as [number, number][];

export const SHORELINE_PLANETS: readonly ShorelinePlanet[] = (
  planetData.shoreline as [string, number, number, number][]
).map(([name, escapeSpeed, insolation, starTemperature]) => ({ name, escapeSpeed, insolation, starTemperature }));

/** Names labelled on the shoreline plot. */
export const SHORELINE_HIGHLIGHTS: readonly string[] = planetData.shorelineHighlights;

/** The planets of one host star, in list order. */
export const planetsOfHost = (host: string): CuratedPlanet[] => CURATED_PLANETS.filter((p) => p.host === host);

/** Host stars in list order, each once. */
export const CURATED_HOSTS: readonly string[] = [...new Set(CURATED_PLANETS.map((p) => p.host))];

// ── Solar System ──────────────────────────────────────────────────────────────

/** Keys of Solar System bodies, used for localized names. */
export type BodyKey =
  | "mercury"
  | "venus"
  | "earth"
  | "moon"
  | "mars"
  | "jupiter"
  | "io"
  | "europa"
  | "ganymede"
  | "callisto"
  | "saturn"
  | "titan"
  | "uranus"
  | "neptune"
  | "triton"
  | "pluto";

/** A Solar System planet on the energy-balance and zone screens. */
export type SolarPlanet = {
  readonly key: BodyKey;
  /** Mean distance from the Sun, AU. */
  readonly distance: number;
  /** Bond albedo. */
  readonly albedo: number;
  /** Measured mean surface temperature, K. */
  readonly surfaceTemperature: number;
  /** Mean surface pressure, bar. */
  readonly surfacePressure: number;
};

export const SOLAR_PLANETS: readonly SolarPlanet[] = [
  { key: "mercury", distance: 0.387, albedo: 0.088, surfaceTemperature: 440, surfacePressure: 0 },
  { key: "venus", distance: 0.723, albedo: 0.76, surfaceTemperature: 737, surfacePressure: 92 },
  { key: "earth", distance: 1, albedo: 0.3, surfaceTemperature: 288, surfacePressure: 1.013 },
  { key: "mars", distance: 1.524, albedo: 0.25, surfaceTemperature: 210, surfacePressure: 0.006 },
];

export const solarPlanet = (key: BodyKey): SolarPlanet => {
  const planet = SOLAR_PLANETS.find((p) => p.key === key);
  if (!planet) {
    throw new Error(`No Solar System planet ${key}`);
  }
  return planet;
};

/** A Solar System body on the cosmic-shoreline plot (Zahnle & Catling 2017 classification of atmospheres). */
export type ShorelineBody = {
  readonly key: BodyKey;
  /** Escape speed, km/s. */
  readonly escapeSpeed: number;
  /** Sunlight received, S⊕. */
  readonly insolation: number;
  readonly hasAtmosphere: boolean;
};

export const SHORELINE_BODIES: readonly ShorelineBody[] = [
  { key: "mercury", escapeSpeed: 4.25, insolation: 6.67, hasAtmosphere: false },
  { key: "venus", escapeSpeed: 10.36, insolation: 1.91, hasAtmosphere: true },
  { key: "earth", escapeSpeed: 11.19, insolation: 1, hasAtmosphere: true },
  { key: "moon", escapeSpeed: 2.38, insolation: 1, hasAtmosphere: false },
  { key: "mars", escapeSpeed: 5.03, insolation: 0.431, hasAtmosphere: true },
  { key: "jupiter", escapeSpeed: 59.5, insolation: 0.037, hasAtmosphere: true },
  { key: "io", escapeSpeed: 2.56, insolation: 0.037, hasAtmosphere: false },
  { key: "europa", escapeSpeed: 2.03, insolation: 0.037, hasAtmosphere: false },
  { key: "ganymede", escapeSpeed: 2.74, insolation: 0.037, hasAtmosphere: false },
  { key: "callisto", escapeSpeed: 2.44, insolation: 0.037, hasAtmosphere: false },
  { key: "saturn", escapeSpeed: 35.5, insolation: 0.011, hasAtmosphere: true },
  { key: "titan", escapeSpeed: 2.64, insolation: 0.011, hasAtmosphere: true },
  { key: "uranus", escapeSpeed: 21.3, insolation: 0.0027, hasAtmosphere: true },
  { key: "neptune", escapeSpeed: 23.5, insolation: 0.0011, hasAtmosphere: true },
  { key: "triton", escapeSpeed: 1.46, insolation: 0.0011, hasAtmosphere: true },
  { key: "pluto", escapeSpeed: 1.21, insolation: 0.00064, hasAtmosphere: true },
];
