/**
 * ZoneSystemViewNode.ts
 *
 * A top view of the chosen star, to scale: the optimistic and conservative
 * zones as rings, and the star's planets on circular orbits (clicking one
 * selects it). The scale fits the outer edge or the outermost planet, and a
 * scale bar shows it, since TRAPPIST-1's zone is fifty times smaller than the
 * Sun's.
 */

import { Multilink } from "scenerystack/axon";
import { Shape } from "scenerystack/kite";
import { Circle, FireListener, Line, Node, Path, Rectangle, Text } from "scenerystack/scenery";
import { starRadius } from "../../common/model/habitableZone.js";
import { formatAU } from "../../common/view/formatters.js";
import { StarNode } from "../../common/view/StarNode.js";
import HabitabilityLabColors from "../../HabitabilityLabColors.js";
import { AU_M, FONTS, SUN_RADIUS_M } from "../../HabitabilityLabConstants.js";
import type { ZoneEdgesModel } from "../model/ZoneEdgesModel.js";

/** The smallest of 1, 2 or 5 × 10ⁿ not above `value`. */
const niceFloor = (value: number): number => {
  const decade = 10 ** Math.floor(Math.log10(value));
  const m = value / decade;
  return decade * (m >= 5 ? 5 : m >= 2 ? 2 : 1);
};

export class ZoneSystemViewNode extends Node {
  public constructor(model: ZoneEdgesModel, size: number) {
    super();
    const center = size / 2;
    const background = new Rectangle(0, 0, size, size, {
      fill: HabitabilityLabColors.spaceColorProperty,
      stroke: HabitabilityLabColors.spaceBorderColorProperty,
      cornerRadius: 4,
    });

    // Four nested discs make the two rings: optimistic outer, conservative outer,
    // conservative inner (back to optimistic), optimistic inner (back to space).
    const optimisticOuter = new Circle(1, { fill: HabitabilityLabColors.optimisticZoneColorProperty });
    const conservativeOuter = new Circle(1, { fill: HabitabilityLabColors.conservativeZoneColorProperty });
    const conservativeInner = new Circle(1, { fill: HabitabilityLabColors.optimisticZoneColorProperty });
    const optimisticInner = new Circle(1, { fill: HabitabilityLabColors.spaceColorProperty });
    const rings = new Node({
      children: [optimisticOuter, conservativeOuter, conservativeInner, optimisticInner],
      x: center,
      y: center,
    });

    const star = new StarNode(4, 5772, { x: center, y: center });
    const orbits = new Node({ x: center, y: center });
    const scaleBar = new Line(0, 0, 1, 0, { stroke: HabitabilityLabColors.spaceTextColorProperty, lineWidth: 2 });
    const scaleText = new Text("", { font: FONTS.SMALL, fill: HabitabilityLabColors.spaceTextColorProperty });

    Multilink.multilink(
      [
        model.systemProperty,
        model.distancesProperty,
        model.starLuminosityProperty,
        model.starTemperatureProperty,
        model.selectedPlanetProperty,
      ],
      (system, distances, luminosity, temperature, selected) => {
        const farthest = Math.max(distances.earlyMars, ...system.planets.map((p) => p.distance));
        const pxPerAU = (center - 12) / (1.08 * farthest);
        optimisticOuter.radius = distances.earlyMars * pxPerAU;
        conservativeOuter.radius = distances.maximumGreenhouse * pxPerAU;
        conservativeInner.radius = distances.runawayGreenhouse * pxPerAU;
        optimisticInner.radius = distances.recentVenus * pxPerAU;

        // The star at true size when that is visible, else 4 px.
        const radiusAU = (starRadius(luminosity, temperature) * SUN_RADIUS_M) / AU_M;
        star.setRadius(Math.max(4, radiusAU * pxPerAU));
        star.setTemperature(temperature);

        for (const child of orbits.children) {
          child.dispose();
        }
        orbits.children = system.planets.map((planet) => {
          const r = planet.distance * pxPerAU;
          const isSelected = planet === selected;
          const orbit = new Path(Shape.circle(0, 0, r), {
            stroke: HabitabilityLabColors.orbitColorProperty,
            lineWidth: isSelected ? 1.5 : 0.8,
          });
          // Planets spread around their orbits so close ones do not overlap.
          const angle = -Math.PI / 4 + system.planets.indexOf(planet) * 0.9;
          const dot = new Circle(isSelected ? 5.5 : 4, {
            fill: planet.bodyKey
              ? HabitabilityLabColors.earthColorProperty
              : HabitabilityLabColors.exoplanetColorProperty,
            stroke: isSelected ? HabitabilityLabColors.selectedColorProperty : null,
            lineWidth: 2,
            x: r * Math.cos(angle),
            y: r * Math.sin(angle),
            cursor: "pointer",
            touchArea: Shape.circle(0, 0, 9),
          });
          dot.addInputListener(
            new FireListener({
              fire: () => {
                model.selectedPlanetProperty.value = planet;
              },
            }),
          );
          return new Node({ children: [orbit, dot] });
        });

        const barAU = niceFloor(farthest / 3);
        scaleBar.setLine(12, size - 14, 12 + barAU * pxPerAU, size - 14);
        scaleText.string = formatAU(barAU);
        scaleText.left = 12;
        scaleText.bottom = size - 18;
      },
    );

    this.children = [background, rings, orbits, star, scaleBar, scaleText];
    this.clipArea = Shape.rect(0, 0, size, size);
  }
}
