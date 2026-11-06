/**
 * habitableZone.ts
 *
 * Habitable-zone edges of Kopparapu et al. (2013, ApJ 765, 131) with the
 * coefficients of Kopparapu et al. (2014, ApJL 787, L29), and a table of
 * main-sequence dwarf stars (Pecaut & Mamajek 2013, approximate) that turns a
 * star temperature into a luminosity and mass. See doc/model.md §3.
 */

import { KOPPARAPU_REFERENCE_TEMPERATURE_K, KOPPARAPU_TEMPERATURE_RANGE } from "../../HabitabilityLabConstants.js";

/** The four edges drawn on the screens. */
export type ZoneEdge = "recentVenus" | "runawayGreenhouse" | "maximumGreenhouse" | "earlyMars";

type Fit = readonly [sEffSun: number, a: number, b: number, c: number, d: number];

/** Kopparapu et al. 2014, Table 1. */
const FITS: Record<ZoneEdge, Fit> = {
  recentVenus: [1.776, 2.136e-4, 2.533e-8, -1.332e-11, -3.097e-15],
  runawayGreenhouse: [1.107, 1.332e-4, 1.58e-8, -8.308e-12, -1.931e-15],
  maximumGreenhouse: [0.356, 6.171e-5, 1.698e-9, -3.198e-12, -5.575e-16],
  earlyMars: [0.32, 5.547e-5, 1.526e-9, -2.874e-12, -5.011e-16],
};

/** Runaway-greenhouse fits for other planet masses (M⊕). */
const RUNAWAY_BY_MASS: ReadonlyMap<number, Fit> = new Map<number, Fit>([
  [0.1, [0.99, 1.209e-4, 1.404e-8, -7.418e-12, -1.713e-15]],
  [1, FITS.runawayGreenhouse],
  [5, [1.188, 1.433e-4, 1.707e-8, -8.968e-12, -2.084e-15]],
]);

/** The star temperature kept inside the range of the fits, K. */
export const clampToFitRange = (temperature: number): number => KOPPARAPU_TEMPERATURE_RANGE.constrainValue(temperature);

/**
 * Critical starlight S_eff (S⊕) of an edge for a star at temperature T★ (K; clamped to
 * 2600–7200 K). `planetMass` (0.1, 1 or 5 M⊕) affects only the runaway-greenhouse edge.
 */
export function edgeStarlight(edge: ZoneEdge, starTemperature: number, planetMass = 1): number {
  const fit = edge === "runawayGreenhouse" ? (RUNAWAY_BY_MASS.get(planetMass) ?? FITS.runawayGreenhouse) : FITS[edge];
  const t = clampToFitRange(starTemperature) - KOPPARAPU_REFERENCE_TEMPERATURE_K;
  const [s, a, b, c, d] = fit;
  return s + a * t + b * t ** 2 + c * t ** 3 + d * t ** 4;
}

/** Distance of an edge, AU, for a star of luminosity L (L☉) and temperature T★ (K). */
export const edgeDistance = (edge: ZoneEdge, luminosity: number, starTemperature: number, planetMass = 1): number =>
  Math.sqrt(luminosity / edgeStarlight(edge, starTemperature, planetMass));

/** All four edge distances, AU, inner to outer. */
export type ZoneDistances = {
  readonly recentVenus: number;
  readonly runawayGreenhouse: number;
  readonly maximumGreenhouse: number;
  readonly earlyMars: number;
};

export const zoneDistances = (luminosity: number, starTemperature: number, planetMass = 1): ZoneDistances => ({
  recentVenus: edgeDistance("recentVenus", luminosity, starTemperature, planetMass),
  runawayGreenhouse: edgeDistance("runawayGreenhouse", luminosity, starTemperature, planetMass),
  maximumGreenhouse: edgeDistance("maximumGreenhouse", luminosity, starTemperature, planetMass),
  earlyMars: edgeDistance("earlyMars", luminosity, starTemperature, planetMass),
});

/** Where a planet receiving `starlightEarth` sits relative to the zone. */
export type ZoneStatus = "tooHot" | "optimisticInner" | "conservative" | "optimisticOuter" | "tooCold";

export function zoneStatus(starlightEarth: number, starTemperature: number, planetMass = 1): ZoneStatus {
  if (starlightEarth > edgeStarlight("recentVenus", starTemperature)) {
    return "tooHot";
  }
  if (starlightEarth > edgeStarlight("runawayGreenhouse", starTemperature, planetMass)) {
    return "optimisticInner";
  }
  if (starlightEarth >= edgeStarlight("maximumGreenhouse", starTemperature)) {
    return "conservative";
  }
  if (starlightEarth >= edgeStarlight("earlyMars", starTemperature)) {
    return "optimisticOuter";
  }
  return "tooCold";
}

/** Whether a status lies inside the optimistic zone (which contains the conservative one). */
export const isInOptimisticZone = (status: ZoneStatus): boolean => status !== "tooHot" && status !== "tooCold";

// ── Main-sequence dwarfs ──────────────────────────────────────────────────────

export type DwarfStar = {
  readonly spectralType: string;
  readonly temperature: number;
  readonly luminosity: number;
  readonly mass: number;
};

/** Pecaut & Mamajek (2013) dwarf sequence, approximate values; sorted by temperature. */
export const DWARF_TABLE: readonly DwarfStar[] = [
  { spectralType: "M8 V", temperature: 2600, luminosity: 0.0005, mass: 0.09 },
  { spectralType: "M5 V", temperature: 3060, luminosity: 0.0036, mass: 0.16 },
  { spectralType: "M3 V", temperature: 3400, luminosity: 0.014, mass: 0.3 },
  { spectralType: "M0 V", temperature: 3850, luminosity: 0.07, mass: 0.57 },
  { spectralType: "K5 V", temperature: 4440, luminosity: 0.16, mass: 0.7 },
  { spectralType: "K0 V", temperature: 5270, luminosity: 0.46, mass: 0.88 },
  { spectralType: "G2 V", temperature: 5770, luminosity: 1, mass: 1 },
  { spectralType: "F5 V", temperature: 6550, luminosity: 3.2, mass: 1.33 },
  { spectralType: "F0 V", temperature: 7200, luminosity: 6.5, mass: 1.6 },
];

/** A main-sequence star of the given temperature, interpolated in log L and log M. */
export function dwarfStar(temperature: number): { luminosity: number; mass: number; spectralType: string } {
  const t = clampToFitRange(temperature);
  let i = 0;
  while (i < DWARF_TABLE.length - 2 && t > (DWARF_TABLE[i + 1]?.temperature ?? 0)) {
    i++;
  }
  const lower = DWARF_TABLE[i] as DwarfStar;
  const upper = DWARF_TABLE[i + 1] as DwarfStar;
  const f = (t - lower.temperature) / (upper.temperature - lower.temperature);
  const nearest = f < 0.5 ? lower : upper;
  return {
    luminosity: lower.luminosity * (upper.luminosity / lower.luminosity) ** f,
    mass: lower.mass * (upper.mass / lower.mass) ** f,
    spectralType: nearest.spectralType,
  };
}

/** Star radius, R☉, from luminosity (L☉) and temperature (K): L = R² (T/T☉)⁴. */
export const starRadius = (luminosity: number, temperature: number): number =>
  Math.sqrt(luminosity) / (temperature / 5772) ** 2;
