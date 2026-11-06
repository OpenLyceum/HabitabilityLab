/**
 * climate.ts
 *
 * Energy balance of a planet (screens 1, 2 and 4): the starlight it receives,
 * its bare-rock equilibrium temperature, how its temperature relaxes towards
 * equilibrium, and the surface temperature under a grey greenhouse atmosphere.
 * See doc/model.md §1–2.
 */

import { MIXED_LAYER_HEAT_CAPACITY, SOLAR_CONSTANT, STEFAN_BOLTZMANN, YEAR_S } from "../../HabitabilityLabConstants.js";

/**
 * How a planet spreads absorbed starlight: over its whole surface (it spins or its winds carry
 * heat round, factor 4) or over its day side only (no heat transport, factor 2).
 */
export type HeatSpread = "wholePlanet" | "daySide";

/** Ratio of the emitting area to the absorbing cross-section. */
export const heatSpreadFactor = (spread: HeatSpread): number => (spread === "wholePlanet" ? 4 : 2);

/** Starlight received, in S⊕ (Earth = 1), from a luminosity in L☉ and a distance in AU. */
export const starlight = (luminositySun: number, distanceAU: number): number => luminositySun / distanceAU ** 2;

/** Starlight absorbed per square metre of emitting surface, W m⁻². */
export const absorbedFlux = (starlightEarth: number, albedo: number, spread: HeatSpread = "wholePlanet"): number =>
  (starlightEarth * SOLAR_CONSTANT * (1 - albedo)) / heatSpreadFactor(spread);

/** Infrared emitted per square metre by a surface at temperature T (K), W m⁻². */
export const emittedFlux = (temperature: number): number => STEFAN_BOLTZMANN * temperature ** 4;

/** Bare-rock equilibrium temperature, K: absorbed starlight equals emitted infrared. */
export const equilibriumTemperature = (
  starlightEarth: number,
  albedo: number,
  spread: HeatSpread = "wholePlanet",
): number => (absorbedFlux(starlightEarth, albedo, spread) / STEFAN_BOLTZMANN) ** 0.25;

/** e-folding time, years, of a small temperature disturbance near T: C / (4σT³). */
export const relaxationTimeYears = (temperature: number): number =>
  MIXED_LAYER_HEAT_CAPACITY / (4 * STEFAN_BOLTZMANN * Math.max(temperature, 1) ** 3) / YEAR_S;

/**
 * Advances the planet's temperature by `years` under C dT/dt = absorbed − σT⁴, sub-stepping so
 * every step is under a fifth of the local relaxation time (the equation is stiff when hot).
 */
export function stepTemperature(temperature: number, absorbed: number, years: number): number {
  let remaining = years;
  let current = temperature;
  while (remaining > 0) {
    const dt = Math.min(remaining, 0.2 * relaxationTimeYears(Math.max(current, absorbedTemperature(absorbed))));
    const rate = ((absorbed - emittedFlux(current)) * YEAR_S) / MIXED_LAYER_HEAT_CAPACITY;
    current = Math.max(0, current + rate * dt);
    remaining -= dt;
  }
  return current;
}

/** The temperature at which σT⁴ equals the absorbed flux, K. */
const absorbedTemperature = (absorbed: number): number => (Math.max(absorbed, 0) / STEFAN_BOLTZMANN) ** 0.25;

/**
 * Surface temperature under a grey atmosphere of infrared optical depth τ (Eddington
 * approximation): T_s⁴ = T_eq⁴ (1 + ¾τ).
 */
export const greenhouseSurfaceTemperature = (equilibrium: number, opticalDepth: number): number =>
  equilibrium * (1 + 0.75 * Math.max(opticalDepth, 0)) ** 0.25;

/** Optical depth that gives a surface temperature `surface` over a bare-rock temperature `equilibrium`. */
export const opticalDepthFor = (surface: number, equilibrium: number): number =>
  Math.max(0, ((surface / equilibrium) ** 4 - 1) / 0.75);

/** Kelvin to degrees Celsius. */
export const toCelsius = (kelvin: number): number => kelvin - 273.15;
