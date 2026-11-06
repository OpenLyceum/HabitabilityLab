/**
 * AgingSystemViewNode.ts
 *
 * A top view of the aging star to scale: the star at its true radius (so a
 * giant visibly swells), the optimistic and conservative zones as rings, the
 * continuously habitable zone as a translucent band, the tidal-lock distance as
 * a dashed circle, and the planet on its widening orbit. The scale follows the
 * zone and the planet smoothly, with a scale bar.
 */

import { Multilink } from "scenerystack/axon";
import { Shape } from "scenerystack/kite";
import { Circle, Line, Node, Path, Rectangle, Text } from "scenerystack/scenery";
import { formatAU } from "../../common/view/formatters.js";
import { StarNode } from "../../common/view/StarNode.js";
import HabitabilityLabColors from "../../HabitabilityLabColors.js";
import { AU_M, FONTS, SUN_RADIUS_M } from "../../HabitabilityLabConstants.js";
import type { AgingStarModel } from "../model/AgingStarModel.js";

const PLANET_ANGLE = -Math.PI / 5;

/** How fast the scale catches up with its target, per second. */
const SCALE_RATE = 3;

const niceFloor = (value: number): number => {
  const decade = 10 ** Math.floor(Math.log10(value));
  const m = value / decade;
  return decade * (m >= 5 ? 5 : m >= 2 ? 2 : 1);
};

export class AgingSystemViewNode extends Node {
  private readonly model: AgingStarModel;
  private readonly middle: number;
  private readonly size: number;

  /** Current half-width of the view, AU, eased towards {@link targetExtent}. */
  private extent: number;

  private readonly optimisticOuter = new Circle(1, { fill: HabitabilityLabColors.optimisticZoneColorProperty });
  private readonly conservativeOuter = new Circle(1, { fill: HabitabilityLabColors.conservativeZoneColorProperty });
  private readonly conservativeInner = new Circle(1, { fill: HabitabilityLabColors.optimisticZoneColorProperty });
  private readonly optimisticInner = new Circle(1, { fill: HabitabilityLabColors.spaceColorProperty });
  // A thick dashed stroke draws the band as radial hatching, distinct from the zone fills.
  private readonly chzRing = new Circle(1, {
    stroke: HabitabilityLabColors.continuousZoneColorProperty,
    lineDash: [2, 3],
    opacity: 0.85,
  });
  private readonly lockCircle = new Circle(1, {
    stroke: HabitabilityLabColors.tidalLockColorProperty,
    lineWidth: 1.5,
    lineDash: [5, 4],
  });
  private readonly orbit = new Circle(1, { stroke: HabitabilityLabColors.orbitColorProperty, lineWidth: 1 });
  private readonly planet = new Circle(5, {
    fill: HabitabilityLabColors.planetColorProperty,
    stroke: HabitabilityLabColors.selectedColorProperty,
    lineWidth: 1,
  });
  private readonly engulfedMark = new Path(new Shape().moveTo(-5, -5).lineTo(5, 5).moveTo(-5, 5).lineTo(5, -5), {
    stroke: HabitabilityLabColors.tooHotColorProperty,
    lineWidth: 2.5,
  });
  private readonly star = new StarNode(4, 5772);
  private readonly scaleBar = new Line(0, 0, 1, 0, {
    stroke: HabitabilityLabColors.spaceTextColorProperty,
    lineWidth: 2,
  });
  private readonly scaleText = new Text("", { font: FONTS.SMALL, fill: HabitabilityLabColors.spaceTextColorProperty });

  public constructor(model: AgingStarModel, size: number) {
    super();
    this.model = model;
    this.size = size;
    this.middle = size / 2;
    this.extent = this.targetExtent();

    const background = new Rectangle(0, 0, size, size, {
      fill: HabitabilityLabColors.spaceColorProperty,
      stroke: HabitabilityLabColors.spaceBorderColorProperty,
      cornerRadius: 4,
    });
    const centered = new Node({
      x: this.middle,
      y: this.middle,
      children: [
        this.optimisticOuter,
        this.conservativeOuter,
        this.conservativeInner,
        this.optimisticInner,
        this.chzRing,
        this.lockCircle,
        this.orbit,
        this.star,
        this.planet,
        this.engulfedMark,
      ],
    });
    this.children = [background, centered, this.scaleBar, this.scaleText];
    this.clipArea = Shape.rect(0, 0, size, size);

    Multilink.multilinkAny(
      [
        model.zoneProperty,
        model.chzProperty,
        model.lockDistanceProperty,
        model.planetDistanceProperty,
        model.starProperty,
        model.engulfedProperty,
      ],
      () => this.redraw(),
    );
    // A new star or planet jumps straight to its scale rather than easing from the old one.
    Multilink.multilink([model.trackProperty, model.distanceProperty], () => {
      this.extent = this.targetExtent();
      this.redraw();
    });
  }

  /** Half-width the view should show, AU: the outer edge or the planet, whichever is farther. */
  private targetExtent(): number {
    return Math.max(
      1.08 * this.model.zoneProperty.value.earlyMars,
      1.25 * this.model.planetDistanceProperty.value,
      1.1 * ((this.model.starProperty.value.radius * SUN_RADIUS_M) / AU_M),
    );
  }

  private redraw(): void {
    const model = this.model;
    const pxPerAU = (this.middle - 10) / this.extent;
    const zone = model.zoneProperty.value;
    this.optimisticOuter.radius = zone.earlyMars * pxPerAU;
    this.conservativeOuter.radius = zone.maximumGreenhouse * pxPerAU;
    this.conservativeInner.radius = zone.runawayGreenhouse * pxPerAU;
    this.optimisticInner.radius = zone.recentVenus * pxPerAU;

    const chz = model.chzProperty.value;
    this.chzRing.visible = chz !== null;
    if (chz) {
      this.chzRing.radius = ((chz.inner + chz.outer) / 2) * pxPerAU;
      this.chzRing.lineWidth = Math.max(1, (chz.outer - chz.inner) * pxPerAU);
    }
    this.lockCircle.radius = Math.max(0.5, model.lockDistanceProperty.value * pxPerAU);

    const star = model.starProperty.value;
    this.star.setRadius(Math.max(3, ((star.radius * SUN_RADIUS_M) / AU_M) * pxPerAU));
    this.star.setTemperature(star.temperature);

    const r = model.planetDistanceProperty.value * pxPerAU;
    this.orbit.radius = r;
    const engulfed = model.engulfedProperty.value;
    this.planet.visible = !engulfed;
    this.engulfedMark.visible = engulfed;
    this.planet.x = r * Math.cos(PLANET_ANGLE);
    this.planet.y = r * Math.sin(PLANET_ANGLE);
    this.engulfedMark.translation = this.planet.translation;

    const barAU = niceFloor(this.extent / 2);
    this.scaleBar.setLine(10, this.size - 12, 10 + barAU * pxPerAU, this.size - 12);
    this.scaleText.string = formatAU(barAU);
    this.scaleText.left = 10;
    this.scaleText.bottom = this.size - 16;
  }

  /** Eases the scale towards its target. */
  public step(dt: number): void {
    const target = this.targetExtent();
    if (Math.abs(target / this.extent - 1) > 1e-3) {
      this.extent += (target - this.extent) * Math.min(1, dt * SCALE_RATE);
      this.redraw();
    }
  }
}
