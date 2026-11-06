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
import { SUN_TEMPERATURE_K } from "../HabitabilityLabConstants.js";
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
  const planet = new Circle(55, { fill: HabitabilityLabColors.planetColorProperty, x: 330, y: 186 });
  const night = new Path(new Shape().arc(0, 0, 55, -Math.PI / 2, Math.PI / 2, false).close(), {
    fill: "rgba(0,0,0,0.45)",
    x: 330,
    y: 186,
  });
  return iconFrom(
    new StarNode(70, SUN_TEMPERATURE_K, { x: 40, y: 186 }),
    new Path(arrow(140, 186, 268, 186, 34), { fill: HabitabilityLabColors.sunlightColorProperty }),
    new Path(arrow(392, 186, 520, 186, 28), { fill: HabitabilityLabColors.infraredColorProperty }),
    new Path(arrow(375, 140, 470, 60, 20), { fill: HabitabilityLabColors.infraredColorProperty }),
    new Path(arrow(375, 232, 470, 312, 20), { fill: HabitabilityLabColors.infraredColorProperty }),
    planet,
    night,
  );
}

export function createGreenhouseIcon(): ScreenIcon {
  const atmosphere = new Rectangle(0, 80, W, 223, {
    fill: new LinearGradient(0, 80, 0, 303)
      .addColorStop(0, "rgba(79,134,198,0.15)")
      .addColorStop(1, "rgba(79,134,198,0.85)"),
  });
  const ground = new Rectangle(0, 303, W, 70, { fill: HabitabilityLabColors.surfaceColorProperty });
  return iconFrom(
    atmosphere,
    ground,
    new Path(arrow(110, 10, 110, 298, 34), { fill: HabitabilityLabColors.sunlightColorProperty }),
    new Path(arrow(274, 298, 274, 120, 52), { fill: HabitabilityLabColors.infraredColorProperty }),
    new Path(arrow(274, 90, 274, 15, 30), { fill: HabitabilityLabColors.infraredColorProperty }),
    new Path(arrow(430, 130, 430, 298, 42), { fill: HabitabilityLabColors.infraredColorProperty, opacity: 0.7 }),
  );
}

export function createZoneEdgesIcon(): ScreenIcon {
  const cx = W / 2;
  const cy = H / 2;
  const ring = (radius: number, fill: typeof HabitabilityLabColors.conservativeZoneColorProperty): Circle =>
    new Circle(radius, { fill: fill, x: cx, y: cy });
  const orbit = (radius: number): Circle =>
    new Circle(radius, { stroke: HabitabilityLabColors.orbitColorProperty, lineWidth: 3, x: cx, y: cy });
  return iconFrom(
    ring(175, HabitabilityLabColors.optimisticZoneColorProperty),
    ring(160, HabitabilityLabColors.conservativeZoneColorProperty),
    ring(100, HabitabilityLabColors.optimisticZoneColorProperty),
    ring(85, HabitabilityLabColors.spaceColorProperty),
    orbit(60),
    orbit(130),
    orbit(205),
    new StarNode(26, 3400, { x: cx, y: cy }),
    new Circle(12, {
      fill: HabitabilityLabColors.tooHotColorProperty,
      x: cx + 60 * Math.cos(2.4),
      y: cy + 60 * Math.sin(2.4),
    }),
    new Circle(15, {
      fill: HabitabilityLabColors.planetColorProperty,
      x: cx + 130 * Math.cos(-0.6),
      y: cy + 130 * Math.sin(-0.6),
    }),
    new Circle(12, {
      fill: HabitabilityLabColors.tooColdColorProperty,
      x: cx + 205 * Math.cos(0.5),
      y: cy + 205 * Math.sin(0.5),
    }),
  );
}

export function createAgingStarIcon(): ScreenIcon {
  const giant = new StarNode(150, 3600, { x: 380, y: 186 });
  const young = new StarNode(30, SUN_TEMPERATURE_K, { x: 90, y: 186 });
  const track = new Path(new Shape().moveTo(140, 186).quadraticCurveTo(180, 120, 220, 150), {
    stroke: HabitabilityLabColors.trackColorProperty,
    lineWidth: 6,
    lineDash: [14, 10],
  });
  return iconFrom(young, track, giant);
}

export function createEscapeIcon(): ScreenIcon {
  const random = pseudoRandom(7);
  const limb = new Circle(520, { fill: HabitabilityLabColors.surfaceColorProperty, x: W / 2, y: H + 400 });
  const molecules: Node[] = [];
  for (let i = 0; i < 40; i++) {
    const x = 20 + random() * (W - 40);
    const y = 240 + random() * 100;
    molecules.push(new Circle(8, { fill: HabitabilityLabColors.moleculeColorProperty, x: x, y: y }));
  }
  const escaping = new Circle(10, { fill: HabitabilityLabColors.escapingColorProperty, x: 360, y: 70 });
  const trail = new Path(arrow(300, 200, 352, 82, 8), { fill: HabitabilityLabColors.escapingColorProperty });
  return iconFrom(limb, ...molecules, trail, escaping);
}
