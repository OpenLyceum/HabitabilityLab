/**
 * HabitabilityLabConstants.ts
 *
 * Every named numeric constant used across the simulation: physical constants
 * (SI unless the name says otherwise), parameter ranges, and layout values in
 * screen pixels. Colours live in HabitabilityLabColors.ts. The physics behind
 * them is described in doc/model.md.
 */

import { Range } from "scenerystack/dot";
import { PhetFont } from "scenerystack/scenery-phet";
import HabitabilityLabNamespace from "./HabitabilityLabNamespace.js";

// ── Physical constants (SI) ───────────────────────────────────────────────────

/** Stefan–Boltzmann constant, W m⁻² K⁻⁴. */
export const STEFAN_BOLTZMANN = 5.670374419e-8;

/** Boltzmann constant, J K⁻¹. */
export const BOLTZMANN = 1.380649e-23;

/** Atomic mass unit, kg. */
export const ATOMIC_MASS_UNIT_KG = 1.66053907e-27;

/** Newtonian gravitational constant, m³ kg⁻¹ s⁻². */
export const G_SI = 6.674e-11;

/** Starlight Earth receives (the solar "constant"), W m⁻². */
export const SOLAR_CONSTANT = 1361;

/** Solar effective temperature, K (IAU 2015). */
export const SUN_TEMPERATURE_K = 5772;

/** Reference temperature of the Kopparapu et al. habitable-zone fits, K. */
export const KOPPARAPU_REFERENCE_TEMPERATURE_K = 5780;

/** Range of star temperatures over which the Kopparapu fits are valid, K. */
export const KOPPARAPU_TEMPERATURE_RANGE = new Range(2600, 7200);

/** Solar mass, kg. */
export const SUN_MASS_KG = 1.989e30;

/** Solar radius (nominal, IAU 2015), m. */
export const SUN_RADIUS_M = 6.957e8;

/** Earth mass, kg. */
export const EARTH_MASS_KG = 5.972e24;

/** Earth mean radius, m. */
export const EARTH_RADIUS_M = 6.371e6;

/** Astronomical unit, m. */
export const AU_M = 1.496e11;

/** Seconds in a (Julian) year. */
export const YEAR_S = 3.15576e7;

/** Zero on the Celsius scale, K. */
export const CELSIUS_ZERO_K = 273.15;

/** Pascals per bar. */
export const PA_PER_BAR = 1e5;

// ── Energy Balance ────────────────────────────────────────────────────────────

/**
 * Heat capacity per square metre of a 100 m ocean mixed layer, J m⁻² K⁻¹. Near Earth's
 * equilibrium it sets a relaxation time C / (4σT³) of about 3.4 years.
 */
export const MIXED_LAYER_HEAT_CAPACITY = 4e8;

/** Simulated years per wall-clock second at normal speed. */
export const YEARS_PER_SECOND = 1;

/** Speed multipliers of the time control. */
export const SLOW_SPEED_FACTOR = 0.25;
export const FAST_SPEED_FACTOR = 4;

/** Star luminosity, L☉. */
export const LUMINOSITY_RANGE = new Range(0.001, 10);

/** Star–planet distance on the Energy Balance screen, AU. */
export const ENERGY_DISTANCE_RANGE = new Range(0.1, 5);

/** Bond albedo. */
export const ALBEDO_RANGE = new Range(0, 0.95);

/** Temperature range of the Energy Balance thermometer and graph, K. */
export const TEMPERATURE_DISPLAY_RANGE = new Range(0, 800);

/** Planet temperature at reset, K: a cold start, so the planet is seen warming to equilibrium. */
export const INITIAL_PLANET_TEMPERATURE_K = 150;

/** Years shown on the temperature-history graph. */
export const HISTORY_YEARS = 30;

// ── Greenhouse ────────────────────────────────────────────────────────────────

/** Starlight received, S⊕. */
export const STARLIGHT_RANGE = new Range(0.1, 10);

/** Infrared optical depth of the grey atmosphere (log slider; 0 handled by a "none" floor). */
export const OPTICAL_DEPTH_RANGE = new Range(0.01, 300);

/** Optical depth below which the slider reads as "no greenhouse". */
export const OPTICAL_DEPTH_NONE = 0.01;

/** Surface pressure, bar. */
export const PRESSURE_RANGE = new Range(1e-4, 200);

// ── Water (IAPWS) ─────────────────────────────────────────────────────────────

/** Triple point of water. */
export const WATER_TRIPLE_POINT_K = 273.16;
export const WATER_TRIPLE_POINT_PA = 611.657;

/** Critical point of water. */
export const WATER_CRITICAL_POINT_K = 647.096;
export const WATER_CRITICAL_POINT_PA = 22.064e6;

// ── Zone Edges ────────────────────────────────────────────────────────────────

/** Starlight axis of the habitable-zone diagram, S⊕ (log). */
export const ZONE_STARLIGHT_RANGE = new Range(0.1, 5);

/** Planet masses offered for the runaway-greenhouse edge, M⊕. */
export const PLANET_MASS_CHOICES = [0.1, 1, 5] as const;

// ── Aging Star ────────────────────────────────────────────────────────────────

/** Planet starting distance, AU. */
export const AGING_DISTANCE_RANGE = new Range(0.02, 30);

/** Albedo used for the bare-rock temperature on Aging Star. */
export const AGING_PLANET_ALBEDO = 0.3;

/** Present age of the Sun and of the universe, Myr. */
export const SUN_AGE_MYR = 4600;
export const UNIVERSE_AGE_MYR = 13800;

/** Wall-clock seconds to play a star's whole life at normal speed. */
export const SECONDS_PER_LIFETIME = 40;

/** Choices for the continuously-habitable-zone duration, Myr. */
export const CHZ_DURATIONS_MYR = [1000, 2000, 4000] as const;

// ── Tidal locking (Gladman et al. 1996, Earth-like planet) ────────────────────

/** Rigidity of rock, N m⁻². */
export const ROCK_RIGIDITY = 3e10;

/** Prefactor of the simplified tidal-locking time, years (initial spin 12 h, Q = 100). */
export const TIDAL_LOCK_PREFACTOR_YEARS = 6e10;

// ── Escape ────────────────────────────────────────────────────────────────────

/** Gas temperature, K (log slider). */
export const GAS_TEMPERATURE_RANGE = new Range(50, 3000);

/** Escape speed, km/s (log slider). */
export const ESCAPE_SPEED_RANGE = new Range(0.5, 60);

/** Retention rule of thumb: a gas stays for billions of years when v_esc > 6 v_rms. */
export const RETENTION_RATIO = 6;

/** Escape speed at which the cosmic shoreline crosses Earth's starlight, km/s (see doc/model.md). */
export const SHORELINE_SPEED_AT_EARTH_KM_S = 6.5;

/** Number of molecules in the escape animation. */
export const MOLECULE_COUNT = 160;

// ── Layout / chrome (screen pixels) ───────────────────────────────────────────

/** Margin between the screen edge and edge-anchored controls (e.g. Reset All). */
export const SCREEN_VIEW_MARGIN = 15;

/** Corner radius shared by control panels and dialogs. */
export const PANEL_CORNER_RADIUS = 6;

/** Width of the right-hand control panels. */
export const CONTROL_PANEL_WIDTH = 230;

/** Shared fonts. */
export const FONTS = {
  TITLE: new PhetFont({ size: 15, weight: "bold" }),
  LABEL: new PhetFont(13),
  SMALL: new PhetFont(11),
  READOUT: new PhetFont(13),
  BIG_READOUT: new PhetFont({ size: 18, weight: "bold" }),
  AXIS_LABEL: new PhetFont(13),
  TICK_LABEL: new PhetFont(11),
  EXPLANATION: new PhetFont(15),
} as const;

HabitabilityLabNamespace.register("HabitabilityLabConstants", {
  STEFAN_BOLTZMANN,
  SCREEN_VIEW_MARGIN,
  PANEL_CORNER_RADIUS,
});
