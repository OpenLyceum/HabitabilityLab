/**
 * tidalLock.ts
 *
 * Order-of-magnitude tidal-locking time for an Earth-like planet (Gladman et al.
 * 1996, initial spin 12 h, Q = 100, rigidity 3 × 10¹⁰ N m⁻²), and its inverse:
 * the distance inside which such a planet is already locked at a given age.
 * The uncertainty is at least a factor of 10 (doc/model.md §4).
 */

import {
  AU_M,
  EARTH_MASS_KG,
  EARTH_RADIUS_M,
  G_SI,
  ROCK_RIGIDITY,
  SUN_MASS_KG,
  TIDAL_DISSIPATION_FACTOR,
  TIDAL_INITIAL_SPIN_PERIOD_S,
  YEAR_S,
} from "../../HabitabilityLabConstants.js";

const DENSITY = EARTH_MASS_KG / ((4 / 3) * Math.PI * EARTH_RADIUS_M ** 3);
const GRAVITY = (G_SI * EARTH_MASS_KG) / EARTH_RADIUS_M ** 2;
const LOVE_NUMBER = 1.5 / (1 + (19 * ROCK_RIGIDITY) / (2 * DENSITY * GRAVITY * EARTH_RADIUS_M));
const MOMENT_OF_INERTIA = 0.4 * EARTH_MASS_KG * EARTH_RADIUS_M ** 2;

/**
 * Gladman's full despinning estimate: ω a⁶ I Q / (3 G M★² k₂ R⁵).
 * Keep the full Love number: the small-k₂ approximation is poor for an Earth-sized body.
 * Factor such that t_lock (years) = factor × a⁶ (a in AU) / M★² (M☉).
 */
const LOCK_FACTOR =
  (((2 * Math.PI) / TIDAL_INITIAL_SPIN_PERIOD_S) * AU_M ** 6 * MOMENT_OF_INERTIA * TIDAL_DISSIPATION_FACTOR) /
  (3 * G_SI * SUN_MASS_KG ** 2 * LOVE_NUMBER * EARTH_RADIUS_M ** 5 * YEAR_S);

/** Years for an Earth-like planet at `distanceAU` from a star of `starMass` (M☉) to become tidally locked. */
export const tidalLockYears = (distanceAU: number, starMass: number): number =>
  (LOCK_FACTOR * distanceAU ** 6) / starMass ** 2;

/** Distance, AU, inside which an Earth-like planet is locked after `years`. */
export const tidalLockDistance = (years: number, starMass: number): number =>
  ((Math.max(years, 0) * starMass ** 2) / LOCK_FACTOR) ** (1 / 6);
