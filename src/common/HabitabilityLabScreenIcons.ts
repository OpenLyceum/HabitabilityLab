/**
 * HabitabilityLabScreenIcons.ts
 *
 * Programmatic home-screen / navigation-bar icons for each screen, drawn on the
 * standard 548 × 373 canvas with HabitabilityLabColors.
 *
 *  - Energy Balance: a star, sunlight into a planet, infrared out of it.
 *  - Greenhouse: ground under an atmosphere, infrared sent back down.
 *  - Zone Edges: the habitable zone as rings around a star, with planets.
 *  - Aging Star: a swollen red giant beside the small star it was.
 *  - Escape: molecules over a planet's limb, one flying away.
 */
import { Shape } from "scenerystack/kite";
import { Circle, LinearGradient, Node, Path, Rectangle } from "scenerystack/scenery";
import { ScreenIcon } from "scenerystack/sim";
import HabitabilityLabColors from "../HabitabilityLabColors.js";
import { HABITABILITY_LAB_SCREEN_ICONS_SETTINGS, SUN_TEMPERATURE_K } from "../HabitabilityLabConstants.js";
import { arrow } from "./view/fluxArrows.js";
import { StarNode } from "./view/StarNode.js";

const W = 548;
const H = 373;

function background(): Rectangle {
  return new Rectangle(0, 0, W, H, { fill: HabitabilityLabColors.spaceColorProperty });
}

function iconFrom(...children: Node[]): ScreenIcon {
  return new ScreenIcon(new Node({ children: [background(), ...children], clipArea: Shape.rect(0, 0, W, H) }), {
    maxIconWidthProportion: 1,
    maxIconHeightProportion: 1,
    fill: HabitabilityLabColors.spaceColorProperty,
  });
}

/** Repeatable pseudo-random numbers (the icons must look the same every time). */
function pseudoRandom(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

export function createEnergyBalanceIcon(): ScreenIcon {
  const planet = new Circle(HABITABILITY_LAB_SCREEN_ICONS_SETTINGS.PLANET_RADIUS, {
    fill: HabitabilityLabColors.planetColorProperty,
    x: HABITABILITY_LAB_SCREEN_ICONS_SETTINGS.PLANET_X,
    y: HABITABILITY_LAB_SCREEN_ICONS_SETTINGS.PLANET_Y,
  });
  const night = new Path(
    new Shape()
      .arc(0, 0, HABITABILITY_LAB_SCREEN_ICONS_SETTINGS.NIGHT_RADIUS, -Math.PI / 2, Math.PI / 2, false)
      .close(),
    {
      fill: "rgba(0,0,0,0.45)",
      x: HABITABILITY_LAB_SCREEN_ICONS_SETTINGS.NIGHT_X,
      y: HABITABILITY_LAB_SCREEN_ICONS_SETTINGS.NIGHT_Y,
    },
  );
  return iconFrom(
    new StarNode(70, SUN_TEMPERATURE_K, {
      x: HABITABILITY_LAB_SCREEN_ICONS_SETTINGS.CREATE_ENERGY_BALANCE_ICON_X,
      y: HABITABILITY_LAB_SCREEN_ICONS_SETTINGS.CREATE_ENERGY_BALANCE_ICON_Y,
    }),
    new Path(arrow(140, 186, 268, 186, HABITABILITY_LAB_SCREEN_ICONS_SETTINGS.CREATE_ENERGY_BALANCE_ICON_TAIL_WIDTH), {
      fill: HabitabilityLabColors.sunlightColorProperty,
    }),
    new Path(
      arrow(392, 186, 520, 186, HABITABILITY_LAB_SCREEN_ICONS_SETTINGS.CREATE_ENERGY_BALANCE_ICON_TAIL_WIDTH_SEGMENT_2),
      { fill: HabitabilityLabColors.infraredColorProperty },
    ),
    new Path(
      arrow(375, 140, 470, 60, HABITABILITY_LAB_SCREEN_ICONS_SETTINGS.CREATE_ENERGY_BALANCE_ICON_TAIL_WIDTH_SEGMENT_3),
      { fill: HabitabilityLabColors.infraredColorProperty },
    ),
    new Path(
      arrow(375, 232, 470, 312, HABITABILITY_LAB_SCREEN_ICONS_SETTINGS.CREATE_ENERGY_BALANCE_ICON_TAIL_WIDTH_SEGMENT_3),
      { fill: HabitabilityLabColors.infraredColorProperty },
    ),
    planet,
    night,
  );
}

export function createGreenhouseIcon(): ScreenIcon {
  const atmosphere = new Rectangle(
    0,
    HABITABILITY_LAB_SCREEN_ICONS_SETTINGS.ATMOSPHERE_Y,
    W,
    HABITABILITY_LAB_SCREEN_ICONS_SETTINGS.ATMOSPHERE_HEIGHT,
    {
      fill: new LinearGradient(0, 80, 0, 303)
        .addColorStop(0, "rgba(79,134,198,0.15)")
        .addColorStop(1, "rgba(79,134,198,0.85)"),
    },
  );
  const ground = new Rectangle(
    0,
    HABITABILITY_LAB_SCREEN_ICONS_SETTINGS.GROUND_Y,
    W,
    HABITABILITY_LAB_SCREEN_ICONS_SETTINGS.GROUND_HEIGHT,
    { fill: HabitabilityLabColors.surfaceColorProperty },
  );
  return iconFrom(
    atmosphere,
    ground,
    new Path(arrow(110, 10, 110, 298, HABITABILITY_LAB_SCREEN_ICONS_SETTINGS.CREATE_GREENHOUSE_ICON_TAIL_WIDTH), {
      fill: HabitabilityLabColors.sunlightColorProperty,
    }),
    new Path(
      arrow(274, 298, 274, 120, HABITABILITY_LAB_SCREEN_ICONS_SETTINGS.CREATE_GREENHOUSE_ICON_TAIL_WIDTH_SEGMENT_2),
      { fill: HabitabilityLabColors.infraredColorProperty },
    ),
    new Path(
      arrow(274, 90, 274, 15, HABITABILITY_LAB_SCREEN_ICONS_SETTINGS.CREATE_GREENHOUSE_ICON_TAIL_WIDTH_SEGMENT_3),
      { fill: HabitabilityLabColors.infraredColorProperty },
    ),
    new Path(
      arrow(430, 130, 430, 298, HABITABILITY_LAB_SCREEN_ICONS_SETTINGS.CREATE_GREENHOUSE_ICON_TAIL_WIDTH_SEGMENT_4),
      {
        fill: HabitabilityLabColors.infraredColorProperty,
        opacity: HABITABILITY_LAB_SCREEN_ICONS_SETTINGS.CREATE_GREENHOUSE_ICON_OPACITY,
      },
    ),
  );
}

export function createZoneEdgesIcon(): ScreenIcon {
  const cx = W / 2;
  const cy = H / 2;
  const ring = (radius: number, fill: typeof HabitabilityLabColors.conservativeZoneColorProperty): Circle =>
    new Circle(radius, { fill: fill, x: cx, y: cy });
  const orbit = (radius: number): Circle =>
    new Circle(radius, {
      stroke: HabitabilityLabColors.orbitColorProperty,
      lineWidth: HABITABILITY_LAB_SCREEN_ICONS_SETTINGS.ORBIT_LINE_WIDTH,
      x: cx,
      y: cy,
    });
  return iconFrom(
    ring(
      HABITABILITY_LAB_SCREEN_ICONS_SETTINGS.CREATE_ZONE_EDGES_ICON_RADIUS_SEGMENT_2,
      HabitabilityLabColors.optimisticZoneColorProperty,
    ),
    ring(
      HABITABILITY_LAB_SCREEN_ICONS_SETTINGS.CREATE_ZONE_EDGES_ICON_RADIUS_SEGMENT_3,
      HabitabilityLabColors.conservativeZoneColorProperty,
    ),
    ring(
      HABITABILITY_LAB_SCREEN_ICONS_SETTINGS.CREATE_ZONE_EDGES_ICON_RADIUS_SEGMENT_4,
      HabitabilityLabColors.optimisticZoneColorProperty,
    ),
    ring(
      HABITABILITY_LAB_SCREEN_ICONS_SETTINGS.CREATE_ZONE_EDGES_ICON_RADIUS_SEGMENT_5,
      HabitabilityLabColors.spaceColorProperty,
    ),
    orbit(HABITABILITY_LAB_SCREEN_ICONS_SETTINGS.CREATE_ZONE_EDGES_ICON_RADIUS_SEGMENT_6),
    orbit(HABITABILITY_LAB_SCREEN_ICONS_SETTINGS.CREATE_ZONE_EDGES_ICON_RADIUS_SEGMENT_7),
    orbit(HABITABILITY_LAB_SCREEN_ICONS_SETTINGS.CREATE_ZONE_EDGES_ICON_RADIUS_SEGMENT_8),
    new StarNode(26, 3400, { x: cx, y: cy }),
    new Circle(HABITABILITY_LAB_SCREEN_ICONS_SETTINGS.CREATE_ZONE_EDGES_ICON_RADIUS, {
      fill: HabitabilityLabColors.tooHotColorProperty,
      x:
        cx +
        HABITABILITY_LAB_SCREEN_ICONS_SETTINGS.CREATE_ZONE_EDGES_ICON_X_FACTOR *
          Math.cos(HABITABILITY_LAB_SCREEN_ICONS_SETTINGS.CREATE_ZONE_EDGES_ICON_X),
      y:
        cy +
        HABITABILITY_LAB_SCREEN_ICONS_SETTINGS.CREATE_ZONE_EDGES_ICON_Y_FACTOR *
          Math.sin(HABITABILITY_LAB_SCREEN_ICONS_SETTINGS.CREATE_ZONE_EDGES_ICON_Y),
    }),
    new Circle(HABITABILITY_LAB_SCREEN_ICONS_SETTINGS.CREATE_ZONE_EDGES_ICON_RADIUS_SEGMENT_9, {
      fill: HabitabilityLabColors.planetColorProperty,
      x: cx + 130 * Math.cos(-0.6),
      y: cy + 130 * Math.sin(-0.6),
    }),
    new Circle(HABITABILITY_LAB_SCREEN_ICONS_SETTINGS.CREATE_ZONE_EDGES_ICON_RADIUS, {
      fill: HabitabilityLabColors.tooColdColorProperty,
      x: cx + 205 * Math.cos(0.5),
      y: cy + 205 * Math.sin(0.5),
    }),
  );
}

export function createAgingStarIcon(): ScreenIcon {
  const giant = new StarNode(150, 3600, {
    x: HABITABILITY_LAB_SCREEN_ICONS_SETTINGS.GIANT_X,
    y: HABITABILITY_LAB_SCREEN_ICONS_SETTINGS.GIANT_Y,
  });
  const young = new StarNode(30, SUN_TEMPERATURE_K, {
    x: HABITABILITY_LAB_SCREEN_ICONS_SETTINGS.YOUNG_X,
    y: HABITABILITY_LAB_SCREEN_ICONS_SETTINGS.YOUNG_Y,
  });
  const track = new Path(
    new Shape()
      .moveTo(HABITABILITY_LAB_SCREEN_ICONS_SETTINGS.TRACK_X, HABITABILITY_LAB_SCREEN_ICONS_SETTINGS.TRACK_Y)
      .quadraticCurveTo(
        HABITABILITY_LAB_SCREEN_ICONS_SETTINGS.TRACK_CONTROL_X,
        HABITABILITY_LAB_SCREEN_ICONS_SETTINGS.TRACK_CONTROL_Y,
        HABITABILITY_LAB_SCREEN_ICONS_SETTINGS.TRACK_END_X,
        HABITABILITY_LAB_SCREEN_ICONS_SETTINGS.TRACK_END_Y,
      ),
    {
      stroke: HabitabilityLabColors.trackColorProperty,
      lineWidth: HABITABILITY_LAB_SCREEN_ICONS_SETTINGS.TRACK_LINE_WIDTH,
      lineDash: [
        HABITABILITY_LAB_SCREEN_ICONS_SETTINGS.TRACK_LINE_DASH_DASH,
        HABITABILITY_LAB_SCREEN_ICONS_SETTINGS.CREATE_AGING_STAR_ICON_TRACK_LINE_DASH_DASH,
      ],
    },
  );
  return iconFrom(young, track, giant);
}

export function createEscapeIcon(): ScreenIcon {
  const random = pseudoRandom(7);
  const limb = new Circle(HABITABILITY_LAB_SCREEN_ICONS_SETTINGS.LIMB_RADIUS, {
    fill: HabitabilityLabColors.surfaceColorProperty,
    x: W / 2,
    y: H + HABITABILITY_LAB_SCREEN_ICONS_SETTINGS.LIMB_Y_OFFSET,
  });
  const molecules: Node[] = [];
  for (let i = 0; i < 40; i++) {
    const x = 20 + random() * (W - 40);
    const y = 240 + random() * 100;
    molecules.push(
      new Circle(HABITABILITY_LAB_SCREEN_ICONS_SETTINGS.CREATE_ESCAPE_ICON_RADIUS, {
        fill: HabitabilityLabColors.moleculeColorProperty,
        x: x,
        y: y,
      }),
    );
  }
  const escaping = new Circle(HABITABILITY_LAB_SCREEN_ICONS_SETTINGS.ESCAPING_RADIUS, {
    fill: HabitabilityLabColors.escapingColorProperty,
    x: HABITABILITY_LAB_SCREEN_ICONS_SETTINGS.ESCAPING_X,
    y: HABITABILITY_LAB_SCREEN_ICONS_SETTINGS.ESCAPING_Y,
  });
  const trail = new Path(arrow(300, 200, 352, 82, HABITABILITY_LAB_SCREEN_ICONS_SETTINGS.TRAIL_TAIL_WIDTH), {
    fill: HabitabilityLabColors.escapingColorProperty,
  });
  return iconFrom(limb, ...molecules, trail, escaping);
}
