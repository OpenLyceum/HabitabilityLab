/**
 * escape.ts
 *
 * Thermal (Jeans) escape and the cosmic shoreline (doc/model.md §5): molecular
 * speeds from the Maxwell–Boltzmann distribution, the Jeans parameter, the
 * fraction of molecules faster than the escape speed, the "v_esc > 6 v_rms"
 * retention rule, and the empirical line S ∝ v_esc⁴ of Zahnle & Catling (2017).
 */

import {
  ATOMIC_MASS_UNIT_KG,
  BOLTZMANN,
  RETENTION_RATIO,
  SHORELINE_SPEED_AT_EARTH_KM_S,
} from "../../HabitabilityLabConstants.js";

/** Most probable speed √(2kT/m), m/s, for a molecule of mass `massAmu` (u) at T (K). */
export const mostProbableSpeed = (temperature: number, massAmu: number): number =>
  Math.sqrt((2 * BOLTZMANN * temperature) / (massAmu * ATOMIC_MASS_UNIT_KG));

/** Root-mean-square speed √(3kT/m), m/s. */
export const rmsSpeed = (temperature: number, massAmu: number): number =>
  Math.sqrt((3 * BOLTZMANN * temperature) / (massAmu * ATOMIC_MASS_UNIT_KG));

/** Jeans parameter λ = (v_esc / v_p)², the escape energy over kT. */
export const jeansParameter = (escapeSpeed: number, temperature: number, massAmu: number): number =>
  (escapeSpeed / mostProbableSpeed(temperature, massAmu)) ** 2;

/**
 * Complementary error function, to about 1e-7 relative accuracy (Numerical Recipes erfcc,
 * Chebyshev fit), accurate in the far tail where 1 − erf would round to zero.
 */
export function erfc(x: number): number {
  const z = Math.abs(x);
  const t = 1 / (1 + 0.5 * z);
  const r =
    t *
    Math.exp(
      -z * z -
        1.26551223 +
        t *
          (1.00002368 +
            t *
              (0.37409196 +
                t *
                  (0.09678418 +
                    t *
                      (-0.18628806 +
                        t *
                          (0.27886807 + t * (-1.13520398 + t * (1.48851587 + t * (-0.82215223 + t * 0.17087277)))))))),
    );
  return x >= 0 ? r : 2 - r;
}

/** Fraction of a Maxwell–Boltzmann gas faster than v_esc: erfc(√λ) + 2√(λ/π) e^(−λ). */
export function fractionFasterThan(escapeSpeed: number, temperature: number, massAmu: number): number {
  const lambda = jeansParameter(escapeSpeed, temperature, massAmu);
  return erfc(Math.sqrt(lambda)) + 2 * Math.sqrt(lambda / Math.PI) * Math.exp(-lambda);
}

/** log₁₀ of that fraction, valid far into the tail where the fraction underflows. */
export function log10FractionFasterThan(escapeSpeed: number, temperature: number, massAmu: number): number {
  const lambda = jeansParameter(escapeSpeed, temperature, massAmu);
  if (lambda < 600) {
    return Math.log10(fractionFasterThan(escapeSpeed, temperature, massAmu));
  }
  // Asymptotically the fraction is 2√(λ/π) e^(−λ) (1 + 1/(2λ)).
  return (Math.log(2 * Math.sqrt(lambda / Math.PI) * (1 + 1 / (2 * lambda))) - lambda) / Math.LN10;
}

/** Maxwell–Boltzmann speed distribution f(v), per (m/s): (4/√π) v²/v_p³ e^(−v²/v_p²). */
export function speedDistribution(speed: number, temperature: number, massAmu: number): number {
  const vp = mostProbableSpeed(temperature, massAmu);
  const x = speed / vp;
  return ((4 / Math.sqrt(Math.PI)) * x * x * Math.exp(-x * x)) / vp;
}

/** Whether the rule of thumb says the gas stays for billions of years: v_esc > 6 v_rms. */
export const isRetained = (escapeSpeed: number, temperature: number, massAmu: number): boolean =>
  escapeSpeed > RETENTION_RATIO * rmsSpeed(temperature, massAmu);

/** Starlight on the cosmic shoreline for an escape speed in km/s, S⊕: (v_esc / 6.5 km/s)⁴. */
export const shorelineStarlight = (escapeSpeedKmS: number): number =>
  (escapeSpeedKmS / SHORELINE_SPEED_AT_EARTH_KM_S) ** 4;

/** Escape speed on the shoreline for a starlight in S⊕, km/s. */
export const shorelineEscapeSpeed = (starlightEarth: number): number =>
  SHORELINE_SPEED_AT_EARTH_KM_S * starlightEarth ** 0.25;
