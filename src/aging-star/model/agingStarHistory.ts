/**
 * agingStarHistory.ts
 *
 * Pure history math for the Aging Star screen: zone-edge crossings along a
 * stellar track, engulfment and tidal-lock ages, cumulative time in the
 * conservative zone, and the continuously habitable zone over a past interval.
 * See doc/model.md §4. Properties that drive the UI live on AgingStarModel.
 */

import type { StarRecord } from "../../common/model/data/shzStars.js";
import {
  edgeStarlight,
  type ZoneDistances,
  type ZoneEdge,
  type ZoneStatus,
  zoneDistances,
  zoneStatus,
} from "../../common/model/habitableZone.js";
import { type StarState, sampleTrack, trackStates } from "../../common/model/stellarTracks.js";
import { tidalLockYears } from "../../common/model/tidalLock.js";
import { AGING_STAR_MODEL_SETTINGS, AU_M, SUN_RADIUS_M } from "../../HabitabilityLabConstants.js";

/** The planet's situation at a tabulated age or a resolved zone crossing. */
export type HistoryRow = {
  readonly star: StarState;
  /** Planet's orbit, AU. */
  readonly distance: number;
  readonly zone: ZoneDistances;
  /** Status during the interval from this row to the next (right-hand limit at a crossing). */
  readonly status: ZoneStatus;
};

/** Everything that depends only on the track and the starting distance, computed once per change. */
export type PlanetHistory = {
  readonly rows: readonly HistoryRow[];
  /** Age at which the star swallows the planet, Myr (Infinity if never). */
  readonly engulfAge: number;
  /** Age at which an Earth-like planet here becomes tidally locked, Myr (Infinity if never). */
  readonly lockAge: number;
  /** Cumulative time in the conservative zone at each row, Myr. */
  readonly timeInZone: readonly number[];
};

const MYR_PER_YEAR: number = AGING_STAR_MODEL_SETTINGS.MYR_PER_YEAR;
const AU_PER_SUN_RADIUS = SUN_RADIUS_M / AU_M;

/** Bracket crossings within each interpolated track interval, including nonmonotonic intervals. */
const CROSSING_SUBDIVISIONS: number = AGING_STAR_MODEL_SETTINGS.CROSSING_SUBDIVISIONS;
const CROSSING_BISECTIONS: number = AGING_STAR_MODEL_SETTINGS.CROSSING_BISECTIONS;
const ZONE_EDGES: readonly ZoneEdge[] = ["recentVenus", "runawayGreenhouse", "maximumGreenhouse", "earlyMars"];

/** Resolve a bracketed edge crossing on the same interpolated track used by the live readouts. */
function crossingAge(lowAge: number, highAge: number, offsetAt: (age: number) => number): number | null {
  const lowOffset = offsetAt(lowAge);
  const highOffset = offsetAt(highAge);
  if (lowOffset === 0) {
    return lowAge;
  }
  if (highOffset === 0) {
    return highAge;
  }
  if (Math.sign(lowOffset) === Math.sign(highOffset)) {
    return null;
  }
  let low = lowAge;
  let high = highAge;
  for (let i = 0; i < CROSSING_BISECTIONS; i++) {
    const mid = (low + high) / 2;
    if (Math.sign(offsetAt(mid)) === Math.sign(lowOffset)) {
      low = mid;
    } else {
      high = mid;
    }
  }
  return (low + high) / 2;
}

/** Track samples plus edge crossings, so every history interval has a single zone status. */
function zoneHistoryRows(track: StarRecord, startDistance: number): HistoryRow[] {
  const orbitAt = (star: StarState): number => (startDistance * track.mass) / star.mass;
  const edgeOffset = (star: StarState, edge: ZoneEdge): number =>
    star.luminosity / orbitAt(star) ** 2 - edgeStarlight(edge, star.temperature);
  const samples = trackStates(track);
  const ages = samples.map((star) => star.ageMyr);
  for (let i = 1; i < samples.length; i++) {
    const start = samples[i - 1] as StarState;
    const end = samples[i] as StarState;
    let before = start;
    for (let j = 1; j <= CROSSING_SUBDIVISIONS; j++) {
      const after = sampleTrack(track, start.ageMyr + ((end.ageMyr - start.ageMyr) * j) / CROSSING_SUBDIVISIONS);
      for (const edge of ZONE_EDGES) {
        const crossing = crossingAge(before.ageMyr, after.ageMyr, (age) => edgeOffset(sampleTrack(track, age), edge));
        if (crossing !== null) {
          ages.push(crossing);
        }
      }
      before = after;
    }
  }
  const sortedAges = [...new Set(ages)].sort((a, b) => a - b);
  return sortedAges.map((age, i) => {
    const star = sampleTrack(track, age);
    // Equality at an edge is sensitive to rounding. Classify the interval at its midpoint.
    const intervalStar = sampleTrack(track, (age + (sortedAges[i + 1] ?? age)) / 2);
    return {
      star,
      distance: orbitAt(star),
      zone: zoneDistances(star.luminosity, star.temperature),
      status: zoneStatus(intervalStar.luminosity / orbitAt(intervalStar) ** 2, intervalStar.temperature),
    };
  });
}

/** History of zone status, engulfment, locking, and time in the conservative zone. */
export function computeHistory(track: StarRecord, startDistance: number): PlanetHistory {
  const startMass = track.mass;
  let engulfAge = Number.POSITIVE_INFINITY;
  let lockAge = Number.POSITIVE_INFINITY;
  const rows = zoneHistoryRows(track, startDistance);
  const timeInZone: number[] = [];
  let cumulative = 0;
  let previous: HistoryRow | null = null;
  for (const row of rows) {
    const { star, distance } = row;
    if (engulfAge === Number.POSITIVE_INFINITY && star.radius * AU_PER_SUN_RADIUS >= distance) {
      engulfAge = star.ageMyr;
    }
    if (lockAge === Number.POSITIVE_INFINITY && star.ageMyr >= tidalLockYears(distance, star.mass) * MYR_PER_YEAR) {
      // A red dwarf's first track interval can span Gyr, while locking takes only Myr.
      let low = previous?.star.ageMyr ?? 0;
      let high = star.ageMyr;
      for (let i = 0; i < AGING_STAR_MODEL_SETTINGS.CONTINUOUS_ZONE_ITERATIONS; i++) {
        const age = (low + high) / 2;
        const state = sampleTrack(track, age);
        const orbit = (startDistance * startMass) / state.mass;
        if (age >= tidalLockYears(orbit, state.mass) * MYR_PER_YEAR) {
          high = age;
        } else {
          low = age;
        }
      }
      lockAge = high;
    }
    if (previous && previous.status === "conservative" && previous.star.ageMyr < engulfAge) {
      cumulative += star.ageMyr - previous.star.ageMyr;
    }
    timeInZone.push(cumulative);
    previous = row;
  }
  return { rows, engulfAge, lockAge, timeInZone };
}

/** Index of the last row at or before `age` (0 before the first). */
export function rowIndexAt(rows: readonly HistoryRow[], age: number): number {
  let low = 0;
  let high = rows.length - 1;
  if (age >= (rows[high]?.star.ageMyr ?? 0)) {
    return high;
  }
  while (high - low > 1) {
    const mid = (low + high) >> 1;
    if ((rows[mid] as HistoryRow).star.ageMyr <= age) {
      low = mid;
    } else {
      high = mid;
    }
  }
  return low;
}

/**
 * The continuously habitable zone over [age − duration, age], AU, or null when empty or too young.
 */
export function continuouslyHabitableZone(
  history: PlanetHistory,
  track: StarRecord,
  age: number,
  duration: number,
): { inner: number; outer: number } | null {
  const start = age - duration;
  if (start < 0) {
    return null;
  }
  const atStart = sampleTrack(track, start);
  const atAge = sampleTrack(track, age);
  const startZone = zoneDistances(atStart.luminosity, atStart.temperature);
  const ageZone = zoneDistances(atAge.luminosity, atAge.temperature);
  let inner = Math.max(startZone.runawayGreenhouse, ageZone.runawayGreenhouse);
  let outer = Math.min(startZone.maximumGreenhouse, ageZone.maximumGreenhouse);
  for (let i = rowIndexAt(history.rows, start) + 1; i < history.rows.length; i++) {
    const row = history.rows[i] as HistoryRow;
    if (row.star.ageMyr > age) {
      break;
    }
    inner = Math.max(inner, row.zone.runawayGreenhouse);
    outer = Math.min(outer, row.zone.maximumGreenhouse);
  }
  return inner < outer ? { inner, outer } : null;
}
