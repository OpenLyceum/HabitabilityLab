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
  ROCK_RIGIDITY,
  SUN_MASS_KG,
  TIDAL_LOCK_PREFACTOR_YEARS,
} from "../../HabitabilityLabConstants.js";

/** Factor such that t_lock (years) = factor × a⁶ (a in AU) / M★ (M☉). */
const LOCK_FACTOR =
  (TIDAL_LOCK_PREFACTOR_YEARS * AU_M ** 6 * EARTH_RADIUS_M * ROCK_RIGIDITY) / (SUN_MASS_KG * EARTH_MASS_KG ** 2);

/** Years for an Earth-like planet at `distanceAU` from a star of `starMass` (M☉) to become tidally locked. */
export const tidalLockYears = (distanceAU: number, starMass: number): number =>
  (LOCK_FACTOR * distanceAU ** 6) / starMass;

/** Distance, AU, inside which an Earth-like planet is locked after `years`. */
export const tidalLockDistance = (years: number, starMass: number): number =>
  ((Math.max(years, 0) * starMass) / LOCK_FACTOR) ** (1 / 6);
