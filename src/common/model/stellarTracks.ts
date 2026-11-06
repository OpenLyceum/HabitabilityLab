/**
 * stellarTracks.ts
 *
 * Sampling the 17 tabulated evolutionary tracks (shzStars.ts) at any age, and
 * the milestones the Aging Star screen marks: end of the main sequence and the
 * star's final remnant. Times are in Myr since the zero-age main sequence.
 */

import { SHZ_STARS, type StarDataPoint, type StarRecord } from "./data/shzStars.js";

/** A star's state at one age, in solar units and kelvin. */
export type StarState = {
  readonly ageMyr: number;
  readonly mass: number;
  readonly luminosity: number;
  readonly radius: number;
  readonly temperature: number;
};

/** The catalog, lightest star first. */
export const STELLAR_TRACKS: readonly StarRecord[] = SHZ_STARS;

/** Catalog masses, M☉. */
export const TRACK_MASSES: readonly number[] = STELLAR_TRACKS.map((track) => track.mass);

/** The catalog track whose mass is closest to `mass` (M☉). */
export function nearestTrack(mass: number): StarRecord {
  let best = STELLAR_TRACKS[0] as StarRecord;
  for (const track of STELLAR_TRACKS) {
    if (Math.abs(Math.log(track.mass / mass)) < Math.abs(Math.log(best.mass / mass))) {
      best = track;
    }
  }
  return best;
}

const toState = (ageMyr: number, point: StarDataPoint): StarState => ({
  ageMyr: ageMyr,
  mass: point.mass,
  luminosity: 10 ** point.logLum,
  radius: 10 ** point.logRadius,
  temperature: 10 ** point.logTemp,
});

/** The star at `ageMyr`, linearly interpolated between table rows and clamped to the track. */
export function sampleTrack(track: StarRecord, ageMyr: number): StarState {
  const table = track.dataTable;
  const first = table[0] as StarDataPoint;
  const last = table[table.length - 1] as StarDataPoint;
  if (ageMyr <= first.time) {
    return toState(ageMyr, first);
  }
  if (ageMyr >= last.time) {
    return toState(ageMyr, last);
  }
  let low = 0;
  let high = table.length - 1;
  while (high - low > 1) {
    const mid = (low + high) >> 1;
    if ((table[mid] as StarDataPoint).time <= ageMyr) {
      low = mid;
    } else {
      high = mid;
    }
  }
  const a = table[low] as StarDataPoint;
  const b = table[high] as StarDataPoint;
  const f = b.time === a.time ? 0 : (ageMyr - a.time) / (b.time - a.time);
  const mix = (x: number, y: number): number => x + f * (y - x);
  return {
    ageMyr: ageMyr,
    mass: mix(a.mass, b.mass),
    luminosity: 10 ** mix(a.logLum, b.logLum),
    radius: 10 ** mix(a.logRadius, b.logRadius),
    temperature: 10 ** mix(a.logTemp, b.logTemp),
  };
}

/** Age at which the star leaves the main sequence (its second epoch), Myr. */
export const mainSequenceEndMyr = (track: StarRecord): number =>
  track.epochsList[1]?.time ?? track.dataTable[track.dataTable.length - 1]?.time ?? 0;

/** Age at which the star becomes its final remnant, Myr. */
export const remnantAgeMyr = (track: StarRecord): number => track.epochsList[track.epochsList.length - 1]?.time ?? 0;

/** The remnant the star leaves, from the Hurley–Pols–Tout type code of its last epoch. */
export type Remnant = "whiteDwarf" | "neutronStar" | "blackHole";

export function remnantOf(track: StarRecord): Remnant {
  const type = track.epochsList[track.epochsList.length - 1]?.type ?? 11;
  return type === 13 ? "neutronStar" : type === 14 ? "blackHole" : "whiteDwarf";
}

/** Last tabulated age, Myr. */
export const trackEndMyr = (track: StarRecord): number => track.dataTable[track.dataTable.length - 1]?.time ?? 0;

/** Every table row as a state (for drawing the HR-diagram track and the luminosity timeline). */
export const trackStates = (track: StarRecord): StarState[] => track.dataTable.map((row) => toState(row.time, row));
