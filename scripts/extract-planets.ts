/**
 * extract-planets.ts
 *
 * Builds src/common/model/data/planets.json from ExoplanetsDatabase's frozen snapshot of the
 * NASA Exoplanet Archive (pscomppars). Run from the sim folder with ExoplanetsDatabase checked
 * out beside it:
 *
 *   node scripts/extract-planets.ts [path/to/pscomppars.json]
 *
 * Three groups come out:
 *  - `curated`: named planets for the Zone Edges screen (and highlighted on Escape), with the
 *    values their info cards show;
 *  - `small`: every planet under 2 Earth radii with a known starlight and star temperature, as
 *    [S, T★] pairs (the faint background population on Zone Edges);
 *  - `shoreline`: planets under 4 Earth radii whose mass AND radius were measured (not calculated by
 *    the archive, mass not a minimum M sin i), as [name, escape speed km/s, S, T★].
 */

import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const DEFAULT_SOURCE = "../ExoplanetsDatabase/src/common/model/data/pscomppars.json";
const OUTPUT = "src/common/model/data/planets.json";

/** Named planets shown and labelled on Zone Edges (order = list order in the sim). */
const CURATED = [
  "TRAPPIST-1 b",
  "TRAPPIST-1 c",
  "TRAPPIST-1 d",
  "TRAPPIST-1 e",
  "TRAPPIST-1 f",
  "TRAPPIST-1 g",
  "TRAPPIST-1 h",
  "Proxima Cen b",
  "Teegarden's Star b",
  "Teegarden's Star c",
  "Teegarden's Star d",
  "TOI-700 b",
  "TOI-700 c",
  "TOI-700 d",
  "TOI-700 e",
  "LHS 1140 b",
  "Ross 128 b",
  "Wolf 1069 b",
  "Gliese 12 b",
  "TOI-715 b",
  "Kepler-1649 c",
  "GJ 667 C c",
  "Kepler-186 f",
  "Kepler-442 b",
  "Kepler-62 e",
  "Kepler-62 f",
  "Kepler-452 b",
  "K2-18 b",
] as const;

/** Planets highlighted (labelled) on the cosmic-shoreline plot; must have measured masses. */
const SHORELINE_HIGHLIGHTS = [
  "TRAPPIST-1 b",
  "TRAPPIST-1 c",
  "TRAPPIST-1 e",
  "LHS 3844 b",
  "GJ 1132 b",
  "GJ 486 b",
  "55 Cnc e",
  "LHS 1140 b",
  "K2-18 b",
] as const;

const G = 6.674e-11;
const EARTH_MASS_KG = 5.972e24;
const EARTH_RADIUS_M = 6.371e6;

type Snapshot = {
  retrieved: string;
  calculableColumns: string[];
  categories: Record<string, string[]>;
  columns: Record<string, (number | string | null)[]>;
};

const source = resolve(process.argv[2] ?? DEFAULT_SOURCE);
const snapshot = JSON.parse(readFileSync(source, "utf8")) as Snapshot;
const columns = snapshot.columns;
const names = columns["pl_name"] as string[];
const num = (column: string, i: number): number => {
  const value = columns[column]?.[i];
  return typeof value === "number" ? value : Number.NaN;
};
const calculatedBit = (column: string): number => snapshot.calculableColumns.indexOf(column);
const isCalculated = (column: string, i: number): boolean =>
  ((num("calculated", i) | 0) & (1 << calculatedBit(column))) !== 0;
const massProvenance = (i: number): string => {
  const index = columns["pl_bmassprov"]?.[i];
  return typeof index === "number" ? (snapshot.categories["pl_bmassprov"]?.[index] ?? "") : "";
};
/** A true mass that a paper measured (transit + radial velocity, timing variations, …). */
const hasMeasuredTrueMass = (i: number): boolean =>
  Number.isFinite(num("pl_bmasse", i)) && !isCalculated("pl_bmasse", i) && massProvenance(i) === "Mass";
const escapeSpeedKmS = (i: number): number =>
  Math.sqrt((2 * G * num("pl_bmasse", i) * EARTH_MASS_KG) / (num("pl_rade", i) * EARTH_RADIUS_M)) / 1000;
/** Keeps 4 significant figures. */
const sig = (value: number): number | null => (Number.isFinite(value) ? Number(value.toPrecision(4)) : null);

const curated = CURATED.map((name) => {
  const i = names.indexOf(name);
  if (i < 0) {
    throw new Error(`${name} is not in the snapshot`);
  }
  return {
    name: name,
    host: columns["hostname"]?.[i],
    insolation: sig(num("pl_insol", i)),
    starTemperature: sig(num("st_teff", i)),
    radius: sig(num("pl_rade", i)),
    mass: sig(num("pl_bmasse", i)),
    massMeasured: hasMeasuredTrueMass(i) || massProvenance(i) === "Msini",
    massIsMinimum: massProvenance(i) === "Msini",
    semiMajorAxis: sig(num("pl_orbsmax", i)),
    eccentricity: sig(num("pl_orbeccen", i)),
    starMass: sig(num("st_mass", i)),
    starRadius: sig(num("st_rad", i)),
  };
});

const small: [number, number][] = [];
const shoreline: [string, number, number, number][] = [];
for (let i = 0; i < names.length; i++) {
  const radius = num("pl_rade", i);
  const insolation = num("pl_insol", i);
  const teff = num("st_teff", i);
  if (!(Number.isFinite(radius) && Number.isFinite(insolation))) {
    continue;
  }
  if (radius < 2 && Number.isFinite(teff)) {
    small.push([sig(insolation) ?? 0, sig(teff) ?? 0]);
  }
  if (radius < 4 && !isCalculated("pl_rade", i) && hasMeasuredTrueMass(i)) {
    shoreline.push([names[i] ?? "", sig(escapeSpeedKmS(i)) ?? 0, sig(insolation) ?? 0, sig(teff) ?? 0]);
  }
}
for (const name of SHORELINE_HIGHLIGHTS) {
  if (!shoreline.some((row) => row[0] === name)) {
    throw new Error(`${name} has no measured mass and radius in the snapshot`);
  }
}

const output = {
  source: "NASA Exoplanet Archive, Planetary Systems Composite Parameters (pscomppars), via ExoplanetsDatabase",
  retrieved: snapshot.retrieved,
  curated: curated,
  shorelineHighlights: SHORELINE_HIGHLIGHTS,
  small: small,
  shoreline: shoreline,
};
writeFileSync(resolve(OUTPUT), `${JSON.stringify(output)}\n`);
console.log(
  `Wrote ${OUTPUT}: ${curated.length} curated, ${small.length} small planets, ${shoreline.length} shoreline planets (retrieved ${snapshot.retrieved}).`,
);
