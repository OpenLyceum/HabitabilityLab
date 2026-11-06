/**
 * HabitabilityLabColors.ts
 *
 * Defines all dynamic colors for the simulation using ProfileColorProperty.
 *
 * Each color has two profiles:
 *   - "default"   — used in standard (dark) mode
 *   - "projector" — used when the user enables Projector Mode in Preferences
 *
 * SceneryStack switches profiles automatically; no manual toggling is needed.
 *
 * ── Usage ─────────────────────────────────────────────────────────────────────
 * Import HabitabilityLabColors and pass properties directly to Node's fillProperty or
 * strokeProperty options:
 *
 *   import HabitabilityLabColors from "../../HabitabilityLabColors.js";
 *
 *   new Rectangle( 0, 0, 100, 50, {
 *     fillProperty: HabitabilityLabColors.backgroundColorProperty,
 *   });
 *
 * ── How to add a color ────────────────────────────────────────────────────────
 * Add a new ProfileColorProperty entry to the HabitabilityLabColors object below.
 * Always provide both "default" and "projector" values.
 */
import { ProfileColorProperty } from "scenerystack/scenery";
import HabitabilityLabNamespace from "./HabitabilityLabNamespace.js";

const HabitabilityLabColors = {
  /**
   * Background color for the simulation screen.
   * Deep navy in default mode; white in projector mode.
   */
  backgroundColorProperty: new ProfileColorProperty(HabitabilityLabNamespace, "background", {
    default: "#1a1a2e",
    projector: "#ffffff",
  }),

  /**
   * Primary accent color for highlights, selected items, and key UI elements.
   * Sky blue in default mode; dark navy in projector mode.
   */
  accentColorProperty: new ProfileColorProperty(HabitabilityLabNamespace, "accent", {
    default: "#4fc3f7",
    projector: "#1a1a2e",
  }),

  /**
   * Background fill for control panels and dialogs.
   * Deep blue in default mode; light gray in projector mode.
   */
  panelBackgroundColorProperty: new ProfileColorProperty(HabitabilityLabNamespace, "panelBackground", {
    default: "#16213e",
    projector: "#f5f5f5",
  }),

  /**
   * Border/stroke color for control panels and dialogs.
   * Teal-navy in default mode; medium gray in projector mode.
   */
  panelBorderColorProperty: new ProfileColorProperty(HabitabilityLabNamespace, "panelBorder", {
    default: "#0f3460",
    projector: "#999999",
  }),

  /**
   * Text color for labels, readouts, and general UI text.
   * Near-white in default mode; near-black in projector mode.
   */
  textColorProperty: new ProfileColorProperty(HabitabilityLabNamespace, "text", {
    default: "#e0e0e0",
    projector: "#1a1a1a",
  }),

  /** Secondary text: captions, notes, units. */
  mutedTextColorProperty: new ProfileColorProperty(HabitabilityLabNamespace, "mutedText", {
    default: "#9aa4b8",
    projector: "#555555",
  }),

  /** Bottom of the Escape screen's sky, just above the ground (top is spaceColorProperty). */
  lowSkyColorProperty: new ProfileColorProperty(HabitabilityLabNamespace, "lowSky", {
    default: "#1b2a4a",
    projector: "#1b2a4a",
  }),

  /** Background of the space views (kept dark in both profiles so stars and glows read). */
  spaceColorProperty: new ProfileColorProperty(HabitabilityLabNamespace, "space", {
    default: "#05070f",
    projector: "#0b1020",
  }),

  /** Border of the space views. */
  spaceBorderColorProperty: new ProfileColorProperty(HabitabilityLabNamespace, "spaceBorder", {
    default: "#2a3550",
    projector: "#5a6680",
  }),

  /** Labels drawn on the dark space views (light in both profiles). */
  spaceTextColorProperty: new ProfileColorProperty(HabitabilityLabNamespace, "spaceText", {
    default: "#d6dceb",
    projector: "#e8ecf5",
  }),

  /** Chart plotting area. */
  chartBackgroundColorProperty: new ProfileColorProperty(HabitabilityLabNamespace, "chartBackground", {
    default: "#0b1020",
    projector: "#ffffff",
  }),

  /** Chart frame, ticks. */
  chartAxisColorProperty: new ProfileColorProperty(HabitabilityLabNamespace, "chartAxis", {
    default: "#8a94aa",
    projector: "#333333",
  }),

  /** Chart gridlines. */
  chartGridColorProperty: new ProfileColorProperty(HabitabilityLabNamespace, "chartGrid", {
    default: "#1f2a44",
    projector: "#e0e0e0",
  }),

  /** Incoming starlight arrows and bars. */
  sunlightColorProperty: new ProfileColorProperty(HabitabilityLabNamespace, "sunlight", {
    default: "#ffd54f",
    projector: "#e0a000",
  }),

  /** Reflected starlight. */
  reflectedColorProperty: new ProfileColorProperty(HabitabilityLabNamespace, "reflected", {
    default: "#b3e5fc",
    projector: "#4a90c0",
  }),

  /** Outgoing infrared arrows and bars. */
  infraredColorProperty: new ProfileColorProperty(HabitabilityLabNamespace, "infrared", {
    default: "#ff7043",
    projector: "#d84315",
  }),

  /** The student's planet. */
  planetColorProperty: new ProfileColorProperty(HabitabilityLabNamespace, "planet", {
    default: "#4fc3f7",
    projector: "#1565c0",
  }),

  /** Earth and Solar System reference marks. */
  earthColorProperty: new ProfileColorProperty(HabitabilityLabNamespace, "earth", {
    default: "#64b5f6",
    projector: "#1e64b4",
  }),

  /** Orbit paths. */
  orbitColorProperty: new ProfileColorProperty(HabitabilityLabNamespace, "orbit", {
    default: "#5c6b8a",
    projector: "#8090b0",
  }),

  /** Temperature history curve. */
  temperatureCurveColorProperty: new ProfileColorProperty(HabitabilityLabNamespace, "temperatureCurve", {
    default: "#ffb74d",
    projector: "#e65100",
  }),

  /** Equilibrium-temperature reference line. */
  equilibriumLineColorProperty: new ProfileColorProperty(HabitabilityLabNamespace, "equilibriumLine", {
    default: "#81c784",
    projector: "#2e7d32",
  }),

  /** Measured (real) values for comparison. */
  measuredColorProperty: new ProfileColorProperty(HabitabilityLabNamespace, "measured", {
    default: "#ce93d8",
    projector: "#7b1fa2",
  }),

  /** Atmosphere column on the Greenhouse screen (alpha set by the view). */
  atmosphereColorProperty: new ProfileColorProperty(HabitabilityLabNamespace, "atmosphere", {
    default: "#4f86c6",
    projector: "#4f86c6",
  }),

  /** Planet surface (ground). */
  surfaceColorProperty: new ProfileColorProperty(HabitabilityLabNamespace, "surface", {
    default: "#8d6e63",
    projector: "#8d6e63",
  }),

  /** Ice region of the phase diagram. */
  iceRegionColorProperty: new ProfileColorProperty(HabitabilityLabNamespace, "iceRegion", {
    default: "#24476b",
    projector: "#d6ecff",
  }),

  /** Liquid-water region of the phase diagram. */
  liquidRegionColorProperty: new ProfileColorProperty(HabitabilityLabNamespace, "liquidRegion", {
    default: "#1f5f3a",
    projector: "#c8f0d4",
  }),

  /** Vapour region of the phase diagram. */
  vapourRegionColorProperty: new ProfileColorProperty(HabitabilityLabNamespace, "vapourRegion", {
    default: "#3b2f4a",
    projector: "#efe4f7",
  }),

  /** Supercritical region of the phase diagram. */
  supercriticalRegionColorProperty: new ProfileColorProperty(HabitabilityLabNamespace, "supercriticalRegion", {
    default: "#4a3a24",
    projector: "#fbe9cf",
  }),

  /** Phase-boundary curves. */
  phaseBoundaryColorProperty: new ProfileColorProperty(HabitabilityLabNamespace, "phaseBoundary", {
    default: "#cfd8dc",
    projector: "#37474f",
  }),

  /** Conservative habitable zone. */
  conservativeZoneColorProperty: new ProfileColorProperty(HabitabilityLabNamespace, "conservativeZone", {
    default: "#2e7d32",
    projector: "#66bb6a",
  }),

  /** Optimistic habitable zone. */
  optimisticZoneColorProperty: new ProfileColorProperty(HabitabilityLabNamespace, "optimisticZone", {
    default: "#1b4d22",
    projector: "#c8e6c9",
  }),

  /** Continuously habitable zone outline. */
  continuousZoneColorProperty: new ProfileColorProperty(HabitabilityLabNamespace, "continuousZone", {
    default: "#aed581",
    projector: "#558b2f",
  }),

  /** "Too hot" status. */
  tooHotColorProperty: new ProfileColorProperty(HabitabilityLabNamespace, "tooHot", {
    default: "#e57373",
    projector: "#c62828",
  }),

  /** "Too cold" status. */
  tooColdColorProperty: new ProfileColorProperty(HabitabilityLabNamespace, "tooCold", {
    default: "#64b5f6",
    projector: "#1565c0",
  }),

  /** "In the zone" status. */
  habitableColorProperty: new ProfileColorProperty(HabitabilityLabNamespace, "habitable", {
    default: "#81c784",
    projector: "#2e7d32",
  }),

  /** Tidal-lock distance and marker. */
  tidalLockColorProperty: new ProfileColorProperty(HabitabilityLabNamespace, "tidalLock", {
    default: "#ba68c8",
    projector: "#7b1fa2",
  }),

  /** Faint dots of the whole archive population. */
  backgroundPlanetColorProperty: new ProfileColorProperty(HabitabilityLabNamespace, "backgroundPlanet", {
    default: "rgba(180,190,210,0.35)",
    projector: "rgba(80,90,110,0.35)",
  }),

  /** Named exoplanets. */
  exoplanetColorProperty: new ProfileColorProperty(HabitabilityLabNamespace, "exoplanet", {
    default: "#ffcc80",
    projector: "#ef6c00",
  }),

  /** Ring around the selected point. */
  selectedColorProperty: new ProfileColorProperty(HabitabilityLabNamespace, "selected", {
    default: "#ffffff",
    projector: "#000000",
  }),

  /** The cosmic shoreline. */
  shorelineColorProperty: new ProfileColorProperty(HabitabilityLabNamespace, "shoreline", {
    default: "#ffb74d",
    projector: "#e65100",
  }),

  /** Escaping molecules and the escaping tail. */
  escapingColorProperty: new ProfileColorProperty(HabitabilityLabNamespace, "escaping", {
    default: "#ff5252",
    projector: "#d50000",
  }),

  /** Bound molecules. */
  moleculeColorProperty: new ProfileColorProperty(HabitabilityLabNamespace, "molecule", {
    default: "#80deea",
    projector: "#00838f",
  }),

  /** Speed-distribution curve. */
  distributionColorProperty: new ProfileColorProperty(HabitabilityLabNamespace, "distribution", {
    default: "#80deea",
    projector: "#00838f",
  }),

  /** Time cursor on the timeline. */
  cursorColorProperty: new ProfileColorProperty(HabitabilityLabNamespace, "cursor", {
    default: "#ffffff",
    projector: "#000000",
  }),

  /** Evolutionary track on the HR diagram. */
  trackColorProperty: new ProfileColorProperty(HabitabilityLabNamespace, "track", {
    default: "#90a4ae",
    projector: "#546e7a",
  }),

  /** Luminosity-against-age curve. */
  luminosityCurveColorProperty: new ProfileColorProperty(HabitabilityLabNamespace, "luminosityCurve", {
    default: "#ffd54f",
    projector: "#e0a000",
  }),

  // ── Light control surfaces ───────────────────────────────────────────────────
  // White chrome (combo boxes, flat push buttons, editable input fields) stays light
  // in both profiles; its text stays dark. Same values in default and projector mode,
  // but defined here so every color lives in one themeable place.

  /** Fill of light control surfaces: combo-box button/list, editable input fields. */
  controlSurfaceColorProperty: new ProfileColorProperty(HabitabilityLabNamespace, "controlSurface", {
    default: "#ffffff",
    projector: "#ffffff",
  }),

  /** Fill of a disabled control surface (grayed-out editable input field). */
  controlSurfaceDisabledColorProperty: new ProfileColorProperty(HabitabilityLabNamespace, "controlSurfaceDisabled", {
    default: "#cccccc",
    projector: "#cccccc",
  }),

  /** Text on light control surfaces: combo items, flat-button labels, field values, preferences. */
  controlSurfaceTextColorProperty: new ProfileColorProperty(HabitabilityLabNamespace, "controlSurfaceText", {
    default: "#1a1a1a",
    projector: "#1a1a1a",
  }),
};

export default HabitabilityLabColors;
