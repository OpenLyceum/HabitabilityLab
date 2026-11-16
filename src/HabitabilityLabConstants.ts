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

/** Thermometer range, K; covers the hottest allowed day-side equilibrium (about 1861 K). */
export const TEMPERATURE_DISPLAY_RANGE = new Range(0, 2000);

/** Planet temperature at reset, K: a cold start, so the planet is seen warming to equilibrium. */
export const INITIAL_PLANET_TEMPERATURE_K = 150;

/** Years shown on the temperature-history graph. */
export const HISTORY_YEARS = 30;

// ── Greenhouse ────────────────────────────────────────────────────────────────

/** Starlight received, S⊕. */
export const STARLIGHT_RANGE = new Range(0.1, 10);

/** Infrared optical depth of the grey atmosphere (log slider; 0 handled by a "none" floor). */
export const OPTICAL_DEPTH_RANGE = new Range(0.01, 300);

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

/** Initial rotation period of the Earth-like planet, seconds. */
export const TIDAL_INITIAL_SPIN_PERIOD_S = 12 * 3600;
/** Planet's tidal dissipation factor Q; this estimate is uncertain by orders of magnitude. */
export const TIDAL_DISSIPATION_FACTOR = 100;

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

/** Settings for aging-star/model/AgingStarModel.ts. */
export const AGING_STAR_MODEL_SETTINGS = {
  /** Headroom beyond remnant formation in the age range (dimensionless). */
  AGE_RANGE_HEADROOM: 1.05,
  /** Late-stage zoom starts at this fraction of the main-sequence lifetime. */
  LATE_ZOOM_START_FACTOR: 0.9,
  /** Bisection iterations for a continuously habitable-zone boundary (count). */
  CONTINUOUS_ZONE_ITERATIONS: 48,
  /** Maximum wall-clock interval advanced per rendered frame (s). */
  MAX_FRAME_DT: 0.1,
  /** Cumulative time in the conservative zone at each row, Myr. */
  MYR_PER_YEAR: 1e-6,
  /** Bracket crossings within each interpolated track interval, including nonmonotonic intervals. */
  CROSSING_SUBDIVISIONS: 16,
  /** Bracket crossings within each interpolated track interval, including nonmonotonic intervals. */
  CROSSING_BISECTIONS: 48,
} as const;

/** Settings for aging-star/view/AgingStarScreenView.ts. Layout lengths are in px; counts and ratios are dimensionless. */
export const AGING_STAR_SCREEN_VIEW_SETTINGS = {
  LEGEND_ITEM_HEIGHT_SEGMENT_2: 9, // px
  LUMINOSITY_FORMAT_SIGNIFICANT_DIGITS: 3, // digits
  RADIUS_FORMAT_SIGNIFICANT_DIGITS: 3, // digits

  CONSTRUCTOR_CONTROL_PANEL_SPACING: 8, // px
  CONTROL_PANEL_MIN_WIDTH_OFFSET: 24, // px
  CONTROL_PANEL_MAX_WIDTH_OFFSET: 24, // px
  CONSTRUCTOR_LEGEND_SPACING: 10, // px
  CONSTRUCTOR_TOP_OFFSET: 4, // px
  CONSTRUCTOR_LEFT_OFFSET: 62, // px
  CONSTRUCTOR_BOTTOM_OFFSET: 32, // px
  CONSTRUCTOR_RIGHT_OFFSET: 20, // px

  SYSTEM_SIZE: 290,
  HR_WIDTH: 250,
  HR_HEIGHT: 135,
  TIMELINE_HEIGHT: 95,
  READOUT_WIDTH: 330,
  /** Seconds advanced by one press of the step button (a two-hundredth of the window). */
  STEP_SECONDS: 0.2,
  MASS_COMBO_BOX_Y_MARGIN: 3,
  /** Distance control significant figures (dimensionless). */
  DISTANCE_CONTROL_SIGNIFICANT_FIGURES: 3,
  CHZ_RADIOS_SPACING: 6,
  CONTROL_PANEL_SPACING: 6,
  CONTROL_PANEL_MAX_WIDTH: 100,
  LEGEND_ITEM_SPACING: 4,
  LEGEND_ITEM_WIDTH: 14,
  LEGEND_ITEM_HEIGHT: 3,
  LEGEND_ITEM_MAX_WIDTH: 120,
  LEGEND_SPACING: 2,
  READOUTS_SPACING: 2,
} as const;

/** Settings for aging-star/view/AgingSystemViewNode.ts. Layout lengths are in px; counts and ratios are dimensionless. */
export const AGING_SYSTEM_VIEW_NODE_SETTINGS = {
  ENGULFED_MARK_X_SEGMENT_2: 5, // px
  ENGULFED_MARK_Y_SEGMENT_2: 5, // px
  ENGULFED_MARK_X_MOVE_TO_Y: 5, // px

  CHZ_RING_LINE_DASH_DASH: 3, // px
  LOCK_CIRCLE_LINE_DASH_DASH: 5, // px
  REDRAW_BOTTOM_OFFSET: 16, // px

  /** How fast the scale catches up with its target, per second. */
  SCALE_RATE: 3,
  /** Chz ring opacity (dimensionless). */
  CHZ_RING_OPACITY: 0.85,
  LOCK_CIRCLE_LINE_WIDTH: 1.5,
  PLANET_RADIUS: 5,
  ENGULFED_MARK_X: -5,
  ENGULFED_MARK_Y: -5,
  ENGULFED_MARK_LINE_WIDTH: 2.5,
  SCALE_BAR_LINE_WIDTH: 2,
  BACKGROUND_CORNER_RADIUS: 4,
  LEFT_LEFT: 10,
} as const;

/** Settings for aging-star/view/HRDiagramNode.ts. Layout lengths are in px; counts and ratios are dimensionless. */
export const HR_DIAGRAM_NODE_SETTINGS = {
  CONSTRUCTOR_X: 2000, // px
  CONSTRUCTOR_Y: 1e-4, // px

  /** Full track opacity (dimensionless). */
  FULL_TRACK_OPACITY: 0.6,
  LIVED_TRACK_LINE_WIDTH: 2,
  DOT_RADIUS: 5,
  DOT_LINE_WIDTH: 1.5,
} as const;

/** Settings for aging-star/view/TimelineNode.ts. Layout lengths are in px; counts and ratios are dimensionless. */
export const TIMELINE_NODE_SETTINGS = {
  HANDLE_X_SEGMENT_2: 7, // px
  HANDLE_X_SEGMENT_3: -12, // px
  HANDLE_Y_SEGMENT_2: -4, // px

  REDRAW_LEFT_OFFSET: 3, // px
  REDRAW_TOP_FACTOR: 13, // dimensionless
  CONSTRUCTOR_REDRAW_TOP_FACTOR: 3, // dimensionless
  REDRAW_RIGHT_OFFSET: 3, // px
  REDRAW_LINE_DASH_DASH: 3, // px

  STRIP_HEIGHT: 10,
  STRIP_GAP: 4,
  CURVE_LINE_WIDTH: 2,
  TEXT_MAX_WIDTH: 110,
  CURSOR_LINE_LINE_WIDTH: 2,
  HANDLE_X: -7,
  HANDLE_Y: 11,
  HANDLE_WIDTH: 24,
  HANDLE_HEIGHT: 20,
} as const;

/** Settings for common/HabitabilityLabControlOptions.ts. Layout lengths are in px; counts and ratios are dimensionless. */
export const HABITABILITY_LAB_CONTROL_OPTIONS_SETTINGS = {
  SLIDER_THUMB_SIZE_WIDTH: 12,
  SLIDER_THUMB_SIZE_HEIGHT: 22,
  STANDALONE_SLIDER_TRACK_SIZE_WIDTH: 150,
  STANDALONE_SLIDER_TRACK_SIZE_HEIGHT: 3,
  NUMBER_CONTROL_SLIDER_TRACK_SIZE_WIDTH: 110,
  NUMBER_CONTROL_SLIDER_TRACK_SIZE_HEIGHT: 3,
  CHECKBOX_BOX_WIDTH: 16,
  /** Habitability lab number control options scale (dimensionless). */
  HABITABILITY_LAB_NUMBER_CONTROL_OPTIONS_SCALE: 0.75,
  HABITABILITY_LAB_NUMBER_CONTROL_OPTIONS_SLIDER_PADDING: 4,
  HABITABILITY_LAB_NUMBER_CONTROL_OPTIONS_ARROW_BUTTON_SPACING: 3,
  HABITABILITY_LAB_NUMBER_CONTROL_OPTIONS_VERTICAL_SPACING: 4,
  HABITABILITY_LAB_CHECKBOX_OPTIONS_SPACING: 4,
} as const;

/** Settings for common/HabitabilityLabPanel.ts. Layout lengths are in px; counts and ratios are dimensionless. */
export const HABITABILITY_LAB_PANEL_SETTINGS = {
  OPTIONS_X_MARGIN: 12,
  OPTIONS_Y_MARGIN: 10,
} as const;

/** Settings for common/HabitabilityLabScreenIcons.ts. Layout lengths are in px; counts and ratios are dimensionless. */
export const HABITABILITY_LAB_SCREEN_ICONS_SETTINGS = {
  CREATE_ENERGY_BALANCE_ICON_TAIL_WIDTH: 34, // px
  CREATE_ENERGY_BALANCE_ICON_TAIL_WIDTH_SEGMENT_2: 28, // px
  CREATE_ENERGY_BALANCE_ICON_TAIL_WIDTH_SEGMENT_3: 20, // px
  CREATE_GREENHOUSE_ICON_TAIL_WIDTH: 34, // px
  CREATE_GREENHOUSE_ICON_TAIL_WIDTH_SEGMENT_2: 52, // px
  CREATE_GREENHOUSE_ICON_TAIL_WIDTH_SEGMENT_3: 30, // px
  CREATE_GREENHOUSE_ICON_TAIL_WIDTH_SEGMENT_4: 42, // px
  CREATE_ZONE_EDGES_ICON_RADIUS_SEGMENT_2: 175, // px
  CREATE_ZONE_EDGES_ICON_RADIUS_SEGMENT_3: 160, // px
  CREATE_ZONE_EDGES_ICON_RADIUS_SEGMENT_4: 100, // px
  CREATE_ZONE_EDGES_ICON_RADIUS_SEGMENT_5: 85, // px
  CREATE_ZONE_EDGES_ICON_RADIUS_SEGMENT_6: 60, // px
  CREATE_ZONE_EDGES_ICON_RADIUS_SEGMENT_7: 130, // px
  CREATE_ZONE_EDGES_ICON_RADIUS_SEGMENT_8: 205, // px
  CREATE_ZONE_EDGES_ICON_RADIUS_SEGMENT_9: 15, // px
  TRAIL_TAIL_WIDTH: 8, // px

  CREATE_ZONE_EDGES_ICON_X_FACTOR: 60, // dimensionless
  CREATE_ZONE_EDGES_ICON_X: 2.4, // px
  CREATE_ZONE_EDGES_ICON_Y_FACTOR: 60, // dimensionless
  CREATE_ZONE_EDGES_ICON_Y: 2.4, // px
  TRACK_LINE_DASH_DASH: 14, // px
  CREATE_AGING_STAR_ICON_TRACK_LINE_DASH_DASH: 10, // px
  LIMB_Y_OFFSET: 400, // px

  PLANET_RADIUS: 55,
  PLANET_X: 330,
  PLANET_Y: 186,
  NIGHT_RADIUS: 55,
  NIGHT_X: 330,
  NIGHT_Y: 186,
  CREATE_ENERGY_BALANCE_ICON_X: 40,
  CREATE_ENERGY_BALANCE_ICON_Y: 186,
  ATMOSPHERE_Y: 80,
  ATMOSPHERE_HEIGHT: 223,
  GROUND_Y: 303,
  GROUND_HEIGHT: 70,
  /** Create greenhouse icon opacity (dimensionless). */
  CREATE_GREENHOUSE_ICON_OPACITY: 0.7,
  ORBIT_LINE_WIDTH: 3,
  CREATE_ZONE_EDGES_ICON_RADIUS: 12,
  GIANT_X: 380,
  GIANT_Y: 186,
  YOUNG_X: 90,
  YOUNG_Y: 186,
  TRACK_X: 140,
  TRACK_Y: 186,
  TRACK_CONTROL_X: 180,
  TRACK_CONTROL_Y: 120,
  TRACK_END_X: 220,
  TRACK_END_Y: 150,
  TRACK_LINE_WIDTH: 6,
  LIMB_RADIUS: 520,
  CREATE_ESCAPE_ICON_RADIUS: 8,
  ESCAPING_RADIUS: 10,
  ESCAPING_X: 360,
  ESCAPING_Y: 70,
} as const;

/** Settings for common/view/ChartFrameNode.ts. Layout lengths are in px; counts and ratios are dimensionless. */
export const CHART_FRAME_NODE_SETTINGS = {
  FORMAT_LOG_TICK_DIGITS: 2, // digits

  PLACE_AXIS_LABELS_TOP_OFFSET: 20, // px
  PLACE_AXIS_LABELS_RIGHT_OFFSET: 6, // px
  REDRAW_AXES_TOP_OFFSET: 6, // px

  MINOR_GRID_PATH_LINE_WIDTH: 0.5,
  /** Minor grid path opacity (dimensionless). */
  MINOR_GRID_PATH_OPACITY: 0.6,
  REDRAW_AXES_X: -5,
  RIGHT_RIGHT: -7,
} as const;

/** Settings for common/view/chartUtils.ts. Layout lengths are in px; counts and ratios are dimensionless. */
export const CHART_UTILS_SETTINGS = {
  DEFAULT_DIGITS: 3,
} as const;

/** Settings for common/view/controls.ts. Layout lengths are in px; counts and ratios are dimensionless. */
export const CONTROLS_SETTINGS = {
  CREATE_NUMBER_CONTROL_MAX_WIDTH_VARIANT_2: 96, // px
  CREATE_NUMBER_CONTROL_MAX_WIDTH_VARIANT_3: 110, // px

  PARAGRAPHS_LINE_WRAP: 600, // px
  CREATE_PUSH_BUTTON_Y_MARGIN: 5, // px

  DIALOG_TITLE_FONT_SIZE: 20,
  CREATE_NUMBER_CONTROL_MAX_WIDTH: 130,
  CREATE_CHECKBOX_MAX_WIDTH: 190,
  /** Create explanation button scale (dimensionless). */
  CREATE_EXPLANATION_BUTTON_SCALE: 0.6,
  CREATE_EXPLANATION_BUTTON_SPACING: 14,
  CREATE_EXPLANATION_BUTTON_MAX_WIDTH: 600,
  DEFAULT_MAX_WIDTH: 220,
  DEFAULT_MAX_TEXT_WIDTH: 180,
  DEFAULT_MAX_LABEL_WIDTH: 180,
  CREATE_RADIO_GROUP_SPACING: 6,
  CREATE_RADIO_GROUP_RADIUS: 7,
  CREATE_EXPLANATION_ROW_SPACING: 8,
} as const;

/** Settings for energy-balance/model/EnergyBalanceModel.ts. */
export const ENERGY_BALANCE_MODEL_SETTINGS = {
  /** Minimum flux scale when computing relative imbalance (W/m²). */
  MIN_FLUX_SCALE: 1e-9,
  /** Maximum wall-clock interval advanced per rendered frame (s). */
  MAX_FRAME_DT: 0.1,
  /** Relative difference below which absorbed and emitted count as balanced. */
  BALANCE_TOLERANCE: 0.01,
} as const;

/** Settings for energy-balance/view/EnergyBalanceScreenView.ts. Layout lengths are in px; counts and ratios are dimensionless. */
export const ENERGY_BALANCE_SCREEN_VIEW_SETTINGS = {
  CONTROL_PANEL_MIN_WIDTH_OFFSET: 24, // px
  CONTROL_PANEL_MAX_WIDTH_OFFSET: 24, // px
  CONSTRUCTOR_LEFT_OFFSET: 58, // px
  CONSTRUCTOR_TOP_OFFSET: 24, // px
  BARS_PANEL_MIN_WIDTH_OFFSET: 24, // px
  BARS_PANEL_MAX_WIDTH_OFFSET: 24, // px
  CONSTRUCTOR_RIGHT_OFFSET: 20, // px

  /** Years advanced by one press of the step button. */
  SPACE_HEIGHT: 215,
  /** Years advanced by one press of the step button. */
  CHART_WIDTH: 320,
  /** Years advanced by one press of the step button. */
  CHART_HEIGHT: 230,
  /** Years advanced by one press of the step button. */
  BARS_PANEL_WIDTH: 220,
  /** Luminosity control significant figures (dimensionless). */
  LUMINOSITY_CONTROL_SIGNIFICANT_FIGURES: 2,
  /** Distance control significant figures (dimensionless). */
  DISTANCE_CONTROL_SIGNIFICANT_FIGURES: 3,
  /** Albedo control significant figures (dimensionless). */
  ALBEDO_CONTROL_SIGNIFICANT_FIGURES: 2,
  /** Albedo control delta (dimensionless). */
  ALBEDO_CONTROL_DELTA: 0.01,
  CONTROL_PANEL_SPACING: 8,
  BARS_PANEL_SPACING: 6,
} as const;

/** Settings for energy-balance/view/EnergyBarsNode.ts. Layout lengths are in px; counts and ratios are dimensionless. */
export const ENERGY_BARS_NODE_SETTINGS = {
  SCALE_TEXT_DIGITS: 2, // digits
  ITEM_2_SPACING: 26, // px

  MAKE_BAR_BOTTOM_OFFSET: 3, // px
  MAKE_BAR_TOP_OFFSET: 4, // px

  BAR_WIDTH: 34,
  BAR_HEIGHT: 120,
  BAR_SPACING: 26,
  VALUE_TEXT_MAX_WIDTH: 80,
  BASELINE_START_X: -6,
  CONSTRUCTOR_SPACING: 8,
} as const;

/** Settings for energy-balance/view/EnergySpaceNode.ts. Layout lengths are in px; counts and ratios are dimensionless. */
export const ENERGY_SPACE_NODE_SETTINGS = {
  CONSTRUCTOR_TOP_OFFSET: 6, // px
  SOLAR_MARKS_BOTTOM_OFFSET: 8, // px
  CONSTRUCTOR_Y_FACTOR: 16, // dimensionless
  CONSTRUCTOR_RIGHT_OFFSET: 12, // px

  STAR_X: 42,
  AXIS_LEFT_MARGIN: 100,
  AXIS_RIGHT_MARGIN: 40,
  PLANET_RADIUS: 13,
  /** Keyboard step of the planet, decades of distance (Shift: a quarter of it). */
  KEYBOARD_STEP_DECADES: 0.02,
  BACKGROUND_CORNER_RADIUS: 4,
  SOLAR_MARKS_LINE_WIDTH: 2,
  SOLAR_MARKS_MAX_WIDTH: 60,
  STARLIGHT_READOUT_LEFT: 12,
  STARLIGHT_READOUT_TOP: 10,
  LEGEND_ITEM_WIDTH: 14,
  LEGEND_ITEM_HEIGHT: 6,
  LEGEND_ITEM_LEFT: 20,
  LEGEND_ITEM_MAX_WIDTH: 150,
  TOP_TOP: 14,
} as const;

/** Settings for energy-balance/view/TemperatureHistoryNode.ts. Layout lengths are in px; counts and ratios are dimensionless. */
export const TEMPERATURE_HISTORY_NODE_SETTINGS = {
  EQUILIBRIUM_LINE_LINE_DASH_DASH: 6, // px
  CONSTRUCTOR_EQUILIBRIUM_LINE_LINE_DASH_DASH: 4, // px
  MEASURED_LINE_LINE_DASH_DASH: 3, // px
  REDRAW_LEFT_OFFSET: 6, // px
  REDRAW_CENTER_Y: 14, // px

  CURVE_LINE_WIDTH: 2.5,
  EQUILIBRIUM_LINE_LINE_WIDTH: 1.5,
  MEASURED_LINE_LINE_WIDTH: 1.5,
  EQUILIBRIUM_LABEL_MAX_WIDTH: 110,
  MEASURED_LABEL_MAX_WIDTH: 110,
} as const;

/** Settings for escape/model/EscapeModel.ts. */
export const ESCAPE_MODEL_SETTINGS = {
  /** Minimum radius for the demonstration acceleration (body radii). */
  MIN_RADIUS: 1e-6,
  /** Maximum wall-clock interval advanced per rendered frame (s). */
  MAX_FRAME_DT: 0.1,
  /** Height of the top of the animation, in body radii from the centre. */
  TOP_RADIUS: 3,
  /** Wall-clock seconds for a typical hop (a molecule at the most probable speed going up and down). */
  HOP_SECONDS: 1.6,
  /** Largest integration step, as a fraction of a typical hop time. */
  MAX_STEP_FRACTION: 0.01,
} as const;

/** Settings for escape/view/EscapeScreenView.ts. Layout lengths are in px; counts and ratios are dimensionless. */
export const ESCAPE_SCREEN_VIEW_SETTINGS = {
  GAS_CREATE_RADIO_GROUP_MAX_LABEL_WIDTH: 80, // px
  BODY_CREATE_TITLE_MAX_WIDTH: 110, // px
  GAS_CREATE_TITLE_MAX_WIDTH: 90, // px
  VALUE_FORMAT_SIGNIFICANT_DIGITS: 3, // digits
  READOUTS_DIGITS: 3, // digits
  SHORELINE_TITLE_CREATE_TITLE_MAX_WIDTH: 400, // px

  CONSTRUCTOR_MOLECULE_CONTROLS_SPACING: 18, // px
  CONTROL_PANEL_MIN_WIDTH_OFFSET: 24, // px
  CONTROL_PANEL_MAX_WIDTH_OFFSET: 24, // px
  CONSTRUCTOR_TOP_OFFSET: 8, // px
  CONSTRUCTOR_LEFT_OFFSET: 70, // px
  READOUTS_MIN_WIDTH_OFFSET: 24, // px
  READOUTS_MAX_WIDTH_OFFSET: 24, // px

  MOLECULES_WIDTH: 210,
  DISTRIBUTION_WIDTH: 360,
  DISTRIBUTION_HEIGHT: 200,
  READOUT_WIDTH: 420,
  /** Escape speed control significant figures (dimensionless). */
  ESCAPE_SPEED_CONTROL_SIGNIFICANT_FIGURES: 3,
  /** Temperature control significant figures (dimensionless). */
  TEMPERATURE_CONTROL_SIGNIFICANT_FIGURES: 3,
  MOLECULE_CONTROLS_SPACING: 6,
  SHORELINE_CONTROLS_SPACING: 8,
  CONTROL_PANEL_SPACING: 8,
  READOUTS_SPACING: 4,
} as const;

/** Settings for escape/view/MoleculesNode.ts. Layout lengths are in px; counts and ratios are dimensionless. */
export const MOLECULES_NODE_SETTINGS = {
  UPDATE_TICKS_RIGHT_OFFSET: 10, // px
  MOVE_DOTS_X_OFFSET: 6, // px
  CONSTRUCTOR_MOVE_DOTS_X_OFFSET: 60, // px
  NOTE_MAX_WIDTH_OFFSET: 16, // px

  GROUND_HEIGHT: 30,
  TOP_MARGIN: 26,
  MOLECULE_RADIUS: 2.6,
  SKY_CORNER_RADIUS: 4,
  NOTE_LEFT: 8,
  NOTE_TOP: 6,
  LEFT_LEFT: 8,
} as const;

/** Settings for escape/view/ShorelineNode.ts. Layout lengths are in px; counts and ratios are dimensionless. */
export const SHORELINE_NODE_SETTINGS = {
  CIRCLE_RADIUS: 1.8, // px
  EXOPLANETS_ITEM_2_OPACITY: 0.8, // dimensionless
  DOT_RADIUS_SEGMENT_2: 5, // px
  LEGEND_RADIUS_SEGMENT_2: 3, // px

  LABEL_LEFT_OFFSET: 5, // px
  BODIES_LEFT_OFFSET: 3, // px
  BODIES_RIGHT_OFFSET: 3, // px
  CONSTRUCTOR_LEGEND_LINE_WIDTH: 2.5, // px

  V_MIN: 0.5,
  V_MAX: 100,
  S_MIN: 1e-4,
  S_MAX: 1e4,
  /** Hosts cooler than this are drawn as red dwarfs, K. */
  RED_DWARF_TEMPERATURE: 4000,
  /** Bare region opacity (dimensionless). */
  BARE_REGION_OPACITY: 0.12,
  LINE_LINE_WIDTH: 2.5,
  /** Exoplanets opacity (dimensionless). */
  EXOPLANETS_OPACITY: 0.55,
  DOT_RADIUS: 3.5,
  DOT_LINE_WIDTH: 2,
  LABEL_MAX_WIDTH: 70,
  /** Side label opacity (dimensionless). */
  SIDE_LABEL_OPACITY: 0.6,
  SIDE_LABEL_MAX_WIDTH: 160,
  LEGEND_ROW_SPACING: 6,
  LEGEND_ROW_MAX_WIDTH: 170,
  LEGEND_SPACING: 3,
  LEGEND_RADIUS: 4,
  LEGEND_LINE_WIDTH: 2,
  LEGEND_X: 14,
  LEFT_LEFT: 8,
  TOP_TOP: 8,
} as const;

/** Settings for escape/view/SpeedDistributionNode.ts. Layout lengths are in px; counts and ratios are dimensionless. */
export const SPEED_DISTRIBUTION_NODE_SETTINGS = {
  RMS_LINE_LINE_DASH_DASH: 4, // px
  CONSTRUCTOR_RMS_LINE_LINE_DASH_DASH: 3, // px
  CONSTRUCTOR_RIGHT_OFFSET: 4, // px
  CONSTRUCTOR_LEFT_OFFSET: 4, // px
  CONSTRUCTOR_TOP: 22, // px

  SAMPLES: 240,
  /** Tail opacity (dimensionless). */
  TAIL_OPACITY: 0.6,
  CURVE_LINE_WIDTH: 2.5,
  ESCAPE_LINE_LINE_WIDTH: 2,
  TOP_TOP: 4,
} as const;

/** Settings for greenhouse/model/GreenhouseModel.ts. */
export const GREENHOUSE_MODEL_SETTINGS = {
  /** The Sun's luminosity 3.8 billion years ago, L☉ (the faint young Sun, ~75 % of today). */
  EARLY_SUN_LUMINOSITY: 0.75,
  /** A thick early-Mars CO₂ atmosphere: about 1 bar, τ ≈ 1.5 (still below freezing in this model). */
  EARLY_MARS_OPTICAL_DEPTH: 1.5,
} as const;

/** Settings for greenhouse/view/AtmosphereColumnNode.ts. Layout lengths are in px; counts and ratios are dimensionless. */
export const ATMOSPHERE_COLUMN_NODE_SETTINGS = {
  CONSTRUCTOR_MAX_WIDTH_OFFSET: 30, // px
  CONSTRUCTOR_LEFT_OFFSET: 16, // px
  UNDER_ARROW_TOP_OFFSET: 4, // px

  GROUND_HEIGHT: 56,
  SPACE_HEIGHT: 70,
  SPACE_CORNER_RADIUS: 4,
  /** Back arrow opacity (dimensionless). */
  BACK_ARROW_OPACITY: 0.7,
  TOP_TOP: 8,
} as const;

/** Settings for greenhouse/view/GreenhouseScreenView.ts. Layout lengths are in px; counts and ratios are dimensionless. */
export const GREENHOUSE_SCREEN_VIEW_SETTINGS = {
  CONTROL_PANEL_MIN_WIDTH_OFFSET: 24, // px
  CONTROL_PANEL_MAX_WIDTH_OFFSET: 24, // px
  CONSTRUCTOR_TOP_OFFSET: 10, // px
  READOUTS_MIN_WIDTH_OFFSET: 24, // px
  READOUTS_MAX_WIDTH_OFFSET: 24, // px
  CONSTRUCTOR_LEFT_OFFSET: 12, // px

  COLUMN_WIDTH: 270,
  DIAGRAM_WIDTH: 330,
  DIAGRAM_HEIGHT: 300,
  /** Starlight control significant figures (dimensionless). */
  STARLIGHT_CONTROL_SIGNIFICANT_FIGURES: 3,
  /** Albedo control significant figures (dimensionless). */
  ALBEDO_CONTROL_SIGNIFICANT_FIGURES: 2,
  /** Albedo control delta (dimensionless). */
  ALBEDO_CONTROL_DELTA: 0.01,
  /** Optical depth control significant figures (dimensionless). */
  OPTICAL_DEPTH_CONTROL_SIGNIFICANT_FIGURES: 2,
  /** Pressure control significant figures (dimensionless). */
  PRESSURE_CONTROL_SIGNIFICANT_FIGURES: 2,
  CONTROL_PANEL_SPACING: 8,
  COLUMN_BOX_SPACING: 8,
  READOUTS_SPACING: 5,
} as const;

/** Settings for greenhouse/view/PhaseDiagramNode.ts. Layout lengths are in px; counts and ratios are dimensionless. */
export const PHASE_DIAGRAM_NODE_SETTINGS = {
  ICE_REGION_LABEL_MAX_WIDTH: 50, // px
  DOT_RADIUS_SEGMENT_2: 3.5, // px

  POINT_MARKER_RIGHT_OFFSET: 6, // px
  POINT_MARKER_LEFT_OFFSET: 6, // px
  POINT_MARKER_TOP_OFFSET: 3, // px
  POINT_MARKER_BOTTOM_OFFSET: 3, // px
  REFERENCES_RIGHT_OFFSET: 5, // px

  T_MIN: 150,
  T_MAX: 800,
  P_MIN_BAR: 1e-4,
  P_MAX_BAR: 1000,
  SAMPLES: 120,
  BOUNDARIES_LINE_WIDTH: 1.5,
  DEFAULT_MAX_WIDTH: 100,
  /** Text opacity (dimensionless). */
  TEXT_OPACITY: 0.85,
  DOT_RADIUS: 3,
  TEXT_MAX_WIDTH: 90,
  DOT_LINE_WIDTH: 1.5,
  NAME_MAX_WIDTH: 60,
  PLANET_DOT_RADIUS: 7,
  PLANET_DOT_LINE_WIDTH: 2,
} as const;

/** Settings for preferences/HabitabilityLabPreferencesNode.ts. Layout lengths are in px; counts and ratios are dimensionless. */
export const HABITABILITY_LAB_PREFERENCES_NODE_SETTINGS = {
  HEADER_FONT_SIZE: 18,
  SHOW_EQUATIONS_CHECKBOX_FONT_SIZE: 14,
  SHOW_EQUATIONS_CHECKBOX_SPACING: 8,
  DESCRIPTION_FONT_SIZE: 12,
  DESCRIPTION_MAX_WIDTH: 420,
  CONSTRUCTOR_SPACING: 12,
} as const;

/** Settings for zone-edges/view/ZoneDiagramNode.ts. Layout lengths are in px; counts and ratios are dimensionless. */
export const ZONE_DIAGRAM_NODE_SETTINGS = {
  CIRCLE_RADIUS: 1.3, // px
  DOT_RADIUS_SEGMENT_2: 8, // px
  DOT_RADIUS_SEGMENT_3: 6, // px
  DOT_RADIUS_SEGMENT_4: 4.5, // px
  DOT_RADIUS_SEGMENT_5: 9, // px

  STAR_LINE_LINE_DASH_DASH: 5, // px
  CONSTRUCTOR_STAR_LINE_LINE_DASH_DASH: 4, // px
  CURATED_DOTS_RADIUS: 5, // px
  CONSTRUCTOR_CURATED_DOTS_RADIUS: 3.5, // px
  SOLAR_DOTS_BOTTOM_OFFSET: 6, // px
  CONSTRUCTOR_LEFT_OFFSET: 3, // px
  CONSTRUCTOR_CENTER_Y_OFFSET: 10, // px
  CONSTRUCTOR_RIGHT_OFFSET: 3, // px

  S_MIN: 0.1,
  S_MAX: 10,
  T_MIN: 2400,
  T_MAX: 7400,
  SAMPLES: 60,
  /** Star line opacity (dimensionless). */
  STAR_LINE_OPACITY: 0.7,
  DOT_RADIUS: 3.5,
  LABEL_MAX_WIDTH: 60,
  SELECTION_RING_RADIUS: 9,
  SELECTION_RING_LINE_WIDTH: 2,
  SELECTION_LABEL_MAX_WIDTH: 120,
  SWATCH_SPACING: 5,
  SWATCH_WIDTH: 14,
  SWATCH_HEIGHT: 10,
  SWATCH_MAX_WIDTH: 120,
  LEGEND_SPACING: 3,
  LEFT_LEFT: 6,
  TOP_TOP: 6,
} as const;

/** Settings for zone-edges/view/ZoneEdgesScreenView.ts. Layout lengths are in px; counts and ratios are dimensionless. */
export const ZONE_EDGES_SCREEN_VIEW_SETTINGS = {
  STAR_TEXT_DIGITS: 2, // digits
  RADIUS_FORMAT_SIGNIFICANT_DIGITS: 3, // digits
  MASS_FORMAT_SIGNIFICANT_DIGITS: 3, // digits

  SYSTEM_COMBO_BOX_MAX_WIDTH_OFFSET: 50, // px
  CONTROL_PANEL_MIN_WIDTH_OFFSET: 24, // px
  CONTROL_PANEL_MAX_WIDTH_OFFSET: 24, // px
  CONSTRUCTOR_LEFT_OFFSET: 62, // px
  CONSTRUCTOR_TOP_OFFSET: 10, // px

  DIAGRAM_WIDTH: 340,
  DIAGRAM_HEIGHT: 420,
  SYSTEM_SIZE: 250,
  SYSTEM_COMBO_BOX_Y_MARGIN: 4,
  /** Temperature control significant figures (dimensionless). */
  TEMPERATURE_CONTROL_SIGNIFICANT_FIGURES: 4,
  /** Temperature control delta (dimensionless). */
  TEMPERATURE_CONTROL_DELTA: 10,
  CONTROL_PANEL_SPACING: 7,
  PLANET_INFO_SPACING: 6,
  CARD_SPACING: 8,
} as const;

/** Settings for zone-edges/view/ZoneSystemViewNode.ts. Layout lengths are in px; counts and ratios are dimensionless. */
export const ZONE_SYSTEM_VIEW_NODE_SETTINGS = {
  DOT_RADIUS: 9, // px

  ORBIT_LINE_WIDTH: 1.5, // px
  CONSTRUCTOR_ORBIT_LINE_WIDTH: 0.8, // px
  CONSTRUCTOR_BOTTOM_OFFSET: 18, // px

  BACKGROUND_CORNER_RADIUS: 4,
  SCALE_BAR_LINE_WIDTH: 2,
  DOT_LINE_WIDTH: 2,
  LEFT_LEFT: 12,
} as const;

/** Layout lengths in px; precision values count digits; factors are dimensionless. */
export const FLUX_ARROWS_SETTINGS = {
  ARROW_HEAD_WIDTH_OFFSET: 9, // px
  ARROW_HEAD_HEIGHT: 14, // px
  ARROW_HEAD_HEIGHT_OFFSET: 6, // px
} as const;

/** Numerical settings; units are specified per value. */
export const CLIMATE_NUMERICS = {
  /** Maximum explicit integration step relative to thermal relaxation time. */
  MAX_RELAXATION_STEP_FRACTION: 0.2,
} as const;

/** Numerical settings; units are specified per value. */
export const ESCAPE_NUMERICS = {
  /** Jeans parameter above which the asymptotic logarithmic tail is used (dimensionless). */
  ASYMPTOTIC_JEANS_THRESHOLD: 600,
} as const;

/** Numerical settings; units are specified per value. */
export const STELLAR_REFERENCE = {
  /** Solar effective temperature (K). */
  SUN_TEMPERATURE_K: 5772,
} as const;

/** Numerical settings; units are specified per value. */
export const WATER_NUMERICS = {
  /** Lower end of the ice-I melting-curve temperature domain (K). */
  MIN_ICE_I_TEMPERATURE_K: 251.165,
  /** Bisection iterations when inverting a phase boundary (count). */
  INVERSION_ITERATIONS: 50,
} as const;

/** Component dimensions in px; ratios and control steps are dimensionless; precision counts digits. */
export const ZONE_EDGES_SCREEN_SUMMARY_CONTENT_SETTINGS = {
  PLAIN_DIGITS: 2, // digits
  INSOLATION_PLAIN_DIGITS: 3, // digits
} as const;

/** Component dimensions in px; ratios and control steps are dimensionless; precision counts digits. */
export const GREENHOUSE_SCREEN_SUMMARY_CONTENT_SETTINGS = {
  FORMAT_SIGNIFICANT_DIGITS: 2, // digits
} as const;

/** Component dimensions in px; ratios and control steps are dimensionless; precision counts digits. */
export const ESCAPE_SCREEN_SUMMARY_CONTENT_SETTINGS = {
  MOLECULE_DETAILS_DIGITS: 3, // digits
} as const;

/** Component dimensions in px; ratios and control steps are dimensionless; precision counts digits. */
export const ENERGY_BALANCE_SCREEN_SUMMARY_CONTENT_SETTINGS = {
  FORMAT_SIGNIFICANT_DIGITS: 3, // digits
} as const;

/** Component dimensions in px; ratios and control steps are dimensionless; precision counts digits. */
export const FORMATTERS_SETTINGS = {
  FORMAT_STARLIGHT_DIGITS: 3, // digits
  FORMAT_FLUX_DIGITS: 3, // digits
  FORMAT_AU_DIGITS: 3, // digits
  FORMAT_AGE_DIGITS: 3, // digits
  FORMAT_POWER_FRACTION_DIGITS: 2, // digits
  MANTISSA_SIGNIFICANT_FIGURES: 2, // digits
} as const;

/** Component dimensions in px; ratios and control steps are dimensionless; precision counts digits. */
export const AGING_STAR_SCREEN_SUMMARY_CONTENT_SETTINGS = {
  LUMINOSITY_PLAIN_DIGITS: 3, // digits
  PLAIN_DIGITS: 3, // digits
} as const;

HabitabilityLabNamespace.register("HabitabilityLabConstants", {
  STEFAN_BOLTZMANN,
  SCREEN_VIEW_MARGIN,
  PANEL_CORNER_RADIUS,
});
