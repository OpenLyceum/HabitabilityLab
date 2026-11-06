/**
 * StarNode.ts
 *
 * A glowing star disc whose colour follows its temperature (red dwarfs orange,
 * the Sun yellow-white, F stars white-blue) and whose size can change. Used by
 * every space view in the sim.
 */

import { Circle, Color, Node, type NodeOptions, RadialGradient } from "scenerystack/scenery";

/** Approximate apparent colours of stars by effective temperature (K), for drawing only. */
const STAR_COLORS: readonly (readonly [number, string])[] = [
  [2400, "#ff8a3d"],
  [3000, "#ffa552"],
  [3600, "#ffbf72"],
  [4400, "#ffd59a"],
  [5200, "#ffe6bf"],
  [5800, "#fff3dc"],
  [6600, "#f4f3ff"],
  [7500, "#dbe3ff"],
  [10000, "#c3d2ff"],
  [30000, "#a8beff"],
];

/** The drawing colour of a star at temperature T (K), interpolated between table entries. */
export function starColor(temperature: number): Color {
  const first = STAR_COLORS[0] as readonly [number, string];
  const last = STAR_COLORS[STAR_COLORS.length - 1] as readonly [number, string];
  if (temperature <= first[0]) {
    return new Color(first[1]);
  }
  if (temperature >= last[0]) {
    return new Color(last[1]);
  }
  let i = 0;
  while ((STAR_COLORS[i + 1] as readonly [number, string])[0] < temperature) {
    i++;
  }
  const [t0, c0] = STAR_COLORS[i] as readonly [number, string];
  const [t1, c1] = STAR_COLORS[i + 1] as readonly [number, string];
  return Color.interpolateRGBA(new Color(c0), new Color(c1), (temperature - t0) / (t1 - t0));
}

export class StarNode extends Node {
  private readonly disc: Circle;
  private readonly glow: Circle;
  private radius: number;
  private color: Color;

  public constructor(radius: number, temperature: number, options?: NodeOptions) {
    super(options);
    this.radius = radius;
    this.color = starColor(temperature);
    this.glow = new Circle(1, { pickable: false });
    this.disc = new Circle(1, { pickable: false });
    this.children = [this.glow, this.disc];
    this.update();
  }

  public setRadius(radius: number): void {
    this.radius = Math.max(radius, 0.5);
    this.update();
  }

  public setTemperature(temperature: number): void {
    this.color = starColor(temperature);
    this.update();
  }

  private update(): void {
    const r = this.radius;
    const glowRadius = r * 1.8 + 4;
    this.disc.radius = r;
    this.disc.fill = new RadialGradient(-r * 0.25, -r * 0.25, 0, 0, 0, r)
      .addColorStop(0, Color.WHITE)
      .addColorStop(0.55, this.color)
      .addColorStop(1, this.color.colorUtilsDarker(0.15));
    this.glow.radius = glowRadius;
    this.glow.fill = new RadialGradient(0, 0, r * 0.8, 0, 0, glowRadius)
      .addColorStop(0, this.color.withAlpha(0.55))
      .addColorStop(1, this.color.withAlpha(0));
  }
}
