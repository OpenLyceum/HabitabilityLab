/**
 * AgingStarModel.ts
 *
 * A planet around an evolving star (doc/model.md §4). The star follows one of
 * the 17 tabulated tracks; at each age the Kopparapu edges are recomputed from
 * its luminosity and temperature. The planet's orbit widens as the star loses
 * mass (a·M constant); it is engulfed when the star's radius reaches it, and an
 * Earth-like planet there is tidally locked once the age passes its locking
 * time. The continuously habitable zone is the range of distances inside the
 * conservative zone over the whole of the last Δt.
 */

import {
  BooleanProperty,
  DerivedProperty,
  EnumerationProperty,
  NumberProperty,
  Property,
  type TReadOnlyProperty,
} from "scenerystack/axon";
import { Range } from "scenerystack/dot";
import type { TModel } from "scenerystack/joist";
import { TimeSpeed } from "scenerystack/scenery-phet";
import { equilibriumTemperature } from "../../common/model/climate.js";
import type { StarRecord } from "../../common/model/data/shzStars.js";
import { type ZoneDistances, type ZoneStatus, zoneDistances, zoneStatus } from "../../common/model/habitableZone.js";
import {
  mainSequenceEndMyr,
  nearestTrack,
  remnantAgeMyr,
  type StarState,
  sampleTrack,
  TRACK_MASSES,
  trackEndMyr,
  trackStates,
} from "../../common/model/stellarTracks.js";
import { tidalLockDistance, tidalLockYears } from "../../common/model/tidalLock.js";
import { TimeModel } from "../../common/TimeModel.js";
import {
  AGING_DISTANCE_RANGE,
  AGING_PLANET_ALBEDO,
  AU_M,
  CHZ_DURATIONS_MYR,
  FAST_SPEED_FACTOR,
  KOPPARAPU_TEMPERATURE_RANGE,
  SECONDS_PER_LIFETIME,
  SLOW_SPEED_FACTOR,
  SUN_RADIUS_M,
} from "../../HabitabilityLabConstants.js";

export type AgingPreset =
  | "sunVenus"
  | "sunEarth"
  | "sunMars"
  | "redDwarf"
  | "kepler442"
  | "kepler452"
  | "aStar"
  | "custom";

/** Star mass (M☉, snapped to the catalog) and the planet's starting distance (AU) of each preset. */
export const AGING_PRESET_VALUES: Record<Exclude<AgingPreset, "custom">, { mass: number; distance: number }> = {
  sunVenus: { mass: 1, distance: 0.723 },
  sunEarth: { mass: 1, distance: 1 },
  sunMars: { mass: 1, distance: 1.524 },
  redDwarf: { mass: 0.3, distance: 0.16 },
  kepler442: { mass: 0.6, distance: 0.409 },
  kepler452: { mass: 1, distance: 1.046 },
  aStar: { mass: 2, distance: 5 },
};

export const AGING_PRESETS: readonly AgingPreset[] = [
  "sunVenus",
  "sunEarth",
  "sunMars",
  "redDwarf",
  "kepler442",
  "kepler452",
  "aStar",
  "custom",
];

/** Evolutionary stage, from the Hurley–Pols–Tout type code. */
export type Stage =
  | "mainSequence"
  | "subgiant"
  | "redGiant"
  | "heliumBurning"
  | "asymptoticGiant"
  | "heliumStar"
  | "whiteDwarf"
  | "neutronStar"
  | "blackHole";

export function stageOfType(type: number): Stage {
  if (type <= 1) {
    return "mainSequence";
  }
  if (type === 2) {
    return "subgiant";
  }
  if (type === 3) {
    return "redGiant";
  }
  if (type === 4) {
    return "heliumBurning";
  }
  if (type <= 6) {
    return "asymptoticGiant";
  }
  if (type <= 9) {
    return "heliumStar";
  }
  if (type === 13) {
    return "neutronStar";
  }
  if (type === 14) {
    return "blackHole";
  }
  return "whiteDwarf";
}

/** The planet's situation at one tabulated age. */
export type HistoryRow = {
  readonly star: StarState;
  /** Planet's orbit, AU. */
  readonly distance: number;
  readonly zone: ZoneDistances;
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

const MYR_PER_YEAR = 1e-6;
const AU_PER_SUN_RADIUS = SUN_RADIUS_M / AU_M;

export function computeHistory(track: StarRecord, startDistance: number): PlanetHistory {
  const startMass = track.mass;
  let engulfAge = Number.POSITIVE_INFINITY;
  let lockAge = Number.POSITIVE_INFINITY;
  const rows: HistoryRow[] = [];
  const timeInZone: number[] = [];
  let cumulative = 0;
  let previous: HistoryRow | null = null;
  for (const star of trackStates(track)) {
    const distance = (startDistance * startMass) / star.mass;
    const zone = zoneDistances(star.luminosity, star.temperature);
    const status = zoneStatus(star.luminosity / distance ** 2, star.temperature);
    const row = { star, distance, zone, status };
    if (engulfAge === Number.POSITIVE_INFINITY && star.radius * AU_PER_SUN_RADIUS >= distance) {
      engulfAge = star.ageMyr;
    }
    if (lockAge === Number.POSITIVE_INFINITY && star.ageMyr >= tidalLockYears(distance, star.mass) * MYR_PER_YEAR) {
      lockAge = star.ageMyr;
    }
    if (previous && previous.status === "conservative" && previous.star.ageMyr < engulfAge) {
      cumulative += star.ageMyr - previous.star.ageMyr;
    }
    rows.push(row);
    timeInZone.push(cumulative);
    previous = row;
  }
  return { rows, engulfAge, lockAge, timeInZone };
}

/** Index of the last row at or before `age` (0 before the first). */
function rowIndexAt(rows: readonly HistoryRow[], age: number): number {
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

/** The continuously habitable zone over [age − duration, age], AU, or null when empty or too young. */
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

export class AgingStarModel implements TModel {
  public readonly presetProperty = new Property<AgingPreset>("sunEarth");
  public readonly trackMassProperty = new Property<number>(1, { validValues: [...TRACK_MASSES] });
  public readonly distanceProperty = new NumberProperty(1, { range: AGING_DISTANCE_RANGE });

  /** Star's age since the zero-age main sequence, Myr. */
  public readonly ageProperty = new NumberProperty(0);
  public readonly chzDurationProperty = new Property<number>(CHZ_DURATIONS_MYR[2], {
    validValues: [...CHZ_DURATIONS_MYR],
  });
  public readonly zoomLateProperty = new BooleanProperty(false);

  public readonly timer = new TimeModel(false);
  public readonly timeSpeedProperty = new EnumerationProperty(TimeSpeed.NORMAL);

  public readonly trackProperty: TReadOnlyProperty<StarRecord>;
  public readonly historyProperty: TReadOnlyProperty<PlanetHistory>;

  /** Ages shown on the timeline (and played through), Myr. */
  public readonly windowProperty: TReadOnlyProperty<Range>;

  public readonly starProperty: TReadOnlyProperty<StarState>;
  public readonly zoneProperty: TReadOnlyProperty<ZoneDistances>;
  public readonly planetDistanceProperty: TReadOnlyProperty<number>;
  public readonly starlightProperty: TReadOnlyProperty<number>;
  public readonly bareRockTemperatureProperty: TReadOnlyProperty<number>;
  public readonly statusProperty: TReadOnlyProperty<ZoneStatus>;
  public readonly engulfedProperty: TReadOnlyProperty<boolean>;
  public readonly lockedProperty: TReadOnlyProperty<boolean>;
  public readonly lockDistanceProperty: TReadOnlyProperty<number>;
  public readonly timeInZoneProperty: TReadOnlyProperty<number>;
  public readonly chzProperty: TReadOnlyProperty<{ inner: number; outer: number } | null>;
  public readonly stageProperty: TReadOnlyProperty<Stage>;
  public readonly extrapolatedProperty: TReadOnlyProperty<boolean>;

  private applyingPreset = false;

  public constructor() {
    this.trackProperty = new DerivedProperty([this.trackMassProperty], (mass) => nearestTrack(mass));
    this.historyProperty = new DerivedProperty([this.trackProperty, this.distanceProperty], (track, d) =>
      computeHistory(track, d),
    );
    this.windowProperty = new DerivedProperty([this.trackProperty, this.zoomLateProperty], (track, zoom) => {
      const end = Math.min(trackEndMyr(track), remnantAgeMyr(track) * 1.05);
      return zoom ? new Range(mainSequenceEndMyr(track) * 0.9, end) : new Range(0, end);
    });
    this.starProperty = new DerivedProperty([this.trackProperty, this.ageProperty], (track, age) =>
      sampleTrack(track, age),
    );
    this.zoneProperty = new DerivedProperty([this.starProperty], (star) =>
      zoneDistances(star.luminosity, star.temperature),
    );
    this.planetDistanceProperty = new DerivedProperty(
      [this.starProperty, this.trackProperty, this.distanceProperty],
      (star, track, d) => (d * track.mass) / star.mass,
    );
    this.starlightProperty = new DerivedProperty(
      [this.starProperty, this.planetDistanceProperty],
      (star, d) => star.luminosity / d ** 2,
    );
    this.bareRockTemperatureProperty = new DerivedProperty([this.starlightProperty], (s) =>
      equilibriumTemperature(s, AGING_PLANET_ALBEDO),
    );
    this.statusProperty = new DerivedProperty([this.starlightProperty, this.starProperty], (s, star) =>
      zoneStatus(s, star.temperature),
    );
    this.engulfedProperty = new DerivedProperty(
      [this.historyProperty, this.ageProperty],
      (history, age) => age >= history.engulfAge,
    );
    this.lockedProperty = new DerivedProperty(
      [this.historyProperty, this.ageProperty],
      (history, age) => age >= history.lockAge,
    );
    this.lockDistanceProperty = new DerivedProperty([this.starProperty, this.ageProperty], (star, age) =>
      tidalLockDistance(age / MYR_PER_YEAR, star.mass),
    );
    this.timeInZoneProperty = new DerivedProperty([this.historyProperty, this.ageProperty], (history, age) => {
      const i = rowIndexAt(history.rows, age);
      const row = history.rows[i] as HistoryRow;
      const extra = row.status === "conservative" && age < history.engulfAge ? Math.max(0, age - row.star.ageMyr) : 0;
      const next = history.timeInZone[i + 1];
      const base = history.timeInZone[i] ?? 0;
      return next === undefined ? base : Math.min(base + extra, next);
    });
    this.chzProperty = new DerivedProperty(
      [this.historyProperty, this.trackProperty, this.ageProperty, this.chzDurationProperty],
      (history, track, age, duration) => continuouslyHabitableZone(history, track, age, duration),
    );
    this.stageProperty = new DerivedProperty([this.trackProperty, this.ageProperty], (track, age) => {
      let type = track.epochsList[0]?.type ?? 1;
      for (const epoch of track.epochsList) {
        if (epoch.time <= age) {
          type = epoch.type;
        }
      }
      return stageOfType(type);
    });
    this.extrapolatedProperty = new DerivedProperty(
      [this.starProperty],
      (star) => !KOPPARAPU_TEMPERATURE_RANGE.contains(star.temperature),
    );

    this.presetProperty.lazyLink((preset) => {
      if (preset !== "custom") {
        const values = AGING_PRESET_VALUES[preset];
        this.applyingPreset = true;
        this.trackMassProperty.value = values.mass;
        this.distanceProperty.value = values.distance;
        this.applyingPreset = false;
      }
    });
    this.trackMassProperty.lazyLink(() => {
      this.ageProperty.value = 0;
      this.timer.isPlayingProperty.value = false;
      if (!this.applyingPreset) {
        this.presetProperty.value = "custom";
      }
    });
    this.distanceProperty.lazyLink(() => {
      if (!this.applyingPreset) {
        this.presetProperty.value = "custom";
      }
    });
    // Keep the age inside the window when zooming in.
    this.windowProperty.lazyLink((window) => {
      this.ageProperty.value = window.constrainValue(this.ageProperty.value);
    });
  }

  /** Sets the age, kept inside the timeline window. */
  public setAge(age: number): void {
    this.ageProperty.value = this.windowProperty.value.constrainValue(age);
  }

  /** Advances the age by `seconds` of playback. */
  public advance(seconds: number): void {
    const window = this.windowProperty.value;
    const rate = window.getLength() / SECONDS_PER_LIFETIME;
    const age = this.ageProperty.value + rate * seconds;
    if (age >= window.max) {
      this.ageProperty.value = window.max;
      this.timer.isPlayingProperty.value = false;
    } else {
      this.ageProperty.value = age;
    }
  }

  public reset(): void {
    this.applyingPreset = true;
    this.presetProperty.reset();
    this.trackMassProperty.reset();
    this.distanceProperty.reset();
    this.applyingPreset = false;
    this.chzDurationProperty.reset();
    this.zoomLateProperty.reset();
    this.ageProperty.reset();
    this.timer.reset();
    this.timeSpeedProperty.reset();
  }

  public step(dt: number): void {
    if (this.timer.isPlayingProperty.value) {
      // Pressing play at the end of the window starts again from its beginning.
      if (this.ageProperty.value >= this.windowProperty.value.max) {
        this.ageProperty.value = this.windowProperty.value.min;
      }
      const speed = this.timeSpeedProperty.value;
      const factor = speed === TimeSpeed.SLOW ? SLOW_SPEED_FACTOR : speed === TimeSpeed.FAST ? FAST_SPEED_FACTOR : 1;
      this.advance(Math.min(dt, 0.1) * factor);
    }
  }
}
