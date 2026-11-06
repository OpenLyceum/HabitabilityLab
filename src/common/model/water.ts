/**
 * water.ts
 *
 * The phase diagram of water from the IAPWS formulations (doc/model.md §2):
 * the boiling (liquid–vapour) curve of Wagner & Pruss (1993), the sublimation
 * curve and the ice Ih melting curve (IAPWS R14-08, 2011), and the phase of
 * water at a given surface temperature and pressure.
 */

import {
  WATER_CRITICAL_POINT_K,
  WATER_CRITICAL_POINT_PA,
  WATER_TRIPLE_POINT_K,
  WATER_TRIPLE_POINT_PA,
} from "../../HabitabilityLabConstants.js";

/** The state water would take at a planet's surface. */
export type WaterPhase = "ice" | "liquid" | "vapour" | "supercritical";

const SATURATION_COEFFICIENTS = [-7.85951783, 1.84408259, -11.7866497, 22.6807411, -15.9618719, 1.80122502] as const;

/** Vapour pressure over liquid water, Pa, for 273.16 K ≤ T ≤ 647.096 K (Wagner & Pruss 1993). */
export function saturationPressure(temperature: number): number {
  const t = Math.min(Math.max(temperature, WATER_TRIPLE_POINT_K), WATER_CRITICAL_POINT_K);
  const theta = 1 - t / WATER_CRITICAL_POINT_K;
  const [a1, a2, a3, a4, a5, a6] = SATURATION_COEFFICIENTS;
  const sum =
    a1 * theta + a2 * theta ** 1.5 + a3 * theta ** 3 + a4 * theta ** 3.5 + a5 * theta ** 4 + a6 * theta ** 7.5;
  return WATER_CRITICAL_POINT_PA * Math.exp((WATER_CRITICAL_POINT_K / t) * sum);
}

const SUBLIMATION_A = [-21.2144006, 27.3203819, -6.1059813] as const;
const SUBLIMATION_B = [0.00333333333, 1.20666667, 1.70333333] as const;

/** Vapour pressure over ice, Pa, for T ≤ 273.16 K (IAPWS 2011). */
export function sublimationPressure(temperature: number): number {
  const theta = Math.min(Math.max(temperature, 1), WATER_TRIPLE_POINT_K) / WATER_TRIPLE_POINT_K;
  let sum = 0;
  for (let i = 0; i < 3; i++) {
    sum += (SUBLIMATION_A[i] ?? 0) * theta ** (SUBLIMATION_B[i] ?? 0);
  }
  return WATER_TRIPLE_POINT_PA * Math.exp(sum / theta);
}

const MELTING_A = [0.119539337e7, 0.808183159e5, 0.33382686e4] as const;
const MELTING_B = [3, 25.75, 103.75] as const;

/** Melting pressure of ice Ih at temperature T ≤ 273.16 K, Pa (IAPWS R14-08). */
export function meltingPressure(temperature: number): number {
  const theta = temperature / WATER_TRIPLE_POINT_K;
  let sum = 1;
  for (let i = 0; i < 3; i++) {
    sum += (MELTING_A[i] ?? 0) * (1 - theta ** (MELTING_B[i] ?? 0));
  }
  return WATER_TRIPLE_POINT_PA * sum;
}

/**
 * Melting temperature of ice at pressure P ≥ the triple-point pressure, K, by bisection on the
 * melting curve (it falls about 0.0074 K per bar; 1.5 K lower at 200 bar).
 */
export function meltingTemperature(pressure: number): number {
  if (pressure <= WATER_TRIPLE_POINT_PA) {
    return WATER_TRIPLE_POINT_K;
  }
  let low = 251.165;
  let high = WATER_TRIPLE_POINT_K;
  for (let i = 0; i < 50; i++) {
    const mid = 0.5 * (low + high);
    if (meltingPressure(mid) > pressure) {
      low = mid;
    } else {
      high = mid;
    }
  }
  return 0.5 * (low + high);
}

/** Phase of water at temperature T (K) under pressure P (Pa). */
export function waterPhase(temperature: number, pressure: number): WaterPhase {
  if (temperature >= WATER_CRITICAL_POINT_K) {
    return pressure >= WATER_CRITICAL_POINT_PA ? "supercritical" : "vapour";
  }
  if (pressure < WATER_TRIPLE_POINT_PA) {
    // Below the triple point there is no liquid: ice if the air presses harder than ice evaporates.
    return temperature < WATER_TRIPLE_POINT_K && pressure >= sublimationPressure(temperature) ? "ice" : "vapour";
  }
  if (temperature < meltingTemperature(pressure)) {
    return "ice";
  }
  return pressure >= saturationPressure(temperature) ? "liquid" : "vapour";
}
