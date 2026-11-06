/**
 * ZoneDiagramNode.ts
 *
 * The habitable-zone diagram as drawn in the literature: starlight received
 * (log, increasing to the left) against star temperature. The optimistic and
 * conservative zones are bands between the Kopparapu edges; the Solar System's
 * rocky planets, the curated exoplanets and (optionally) every small archive
 * planet are points. Clicking a point selects that planet. A dashed line marks
 * the chosen star's temperature.
 */

import { Multilink } from "scenerystack/axon";
import { Shape } from "scenerystack/kite";
import { Circle, FireListener, HBox, Node, Path, Rectangle, Text, VBox } from "scenerystack/scenery";
import { edgeStarlight, type ZoneEdge } from "../../common/model/habitableZone.js";
import { CURATED_PLANETS, SMALL_PLANETS } from "../../common/model/planets.js";
import { ChartFrameNode } from "../../common/view/ChartFrameNode.js";
import { bodyNameProperty } from "../../common/view/formatters.js";
import HabitabilityLabColors from "../../HabitabilityLabColors.js";
import { FONTS, KOPPARAPU_TEMPERATURE_RANGE, SUN_TEMPERATURE_K } from "../../HabitabilityLabConstants.js";
import { StringManager } from "../../i18n/StringManager.js";
import { SOLAR_SYSTEM, type ZoneEdgesModel } from "../model/ZoneEdgesModel.js";

const S_MIN = 0.1;
const S_MAX = 10;
const T_MIN = 2400;
const T_MAX = 7400;
const SAMPLES = 60;

export class ZoneDiagramNode extends Node {
  public constructor(model: ZoneEdgesModel, width: number, height: number) {
    super();
    const strings = StringManager.getInstance().getZoneEdgesStrings();
    const common = StringManager.getInstance().getCommonStrings();

    const chart = new ChartFrameNode({
      viewWidth: width,
      viewHeight: height,
      xAxis: { min: S_MIN, max: S_MAX, log: true, reversed: true },
      yAxis: { min: T_MIN, max: T_MAX },
      xAxisLabelProperty: strings.starlightAxisStringProperty,
      yAxisLabelProperty: strings.starTemperatureAxisStringProperty,
    });
    const px = (s: number): number => chart.modelToViewX(s);
    const py = (t: number): number => chart.modelToViewY(t);

    /** The band between two edges over the range of the fits. */
    const band = (inner: ZoneEdge, outer: ZoneEdge, mass: number): Shape => {
      const shape = new Shape();
      const temperatures: number[] = [];
      for (let i = 0; i <= SAMPLES; i++) {
        temperatures.push(KOPPARAPU_TEMPERATURE_RANGE.min + (KOPPARAPU_TEMPERATURE_RANGE.getLength() * i) / SAMPLES);
      }
      temperatures.forEach((t, i) => {
        const x = px(edgeStarlight(inner, t, mass));
        if (i === 0) {
          shape.moveTo(x, py(t));
        } else {
          shape.lineTo(x, py(t));
        }
      });
      for (const t of [...temperatures].reverse()) {
        shape.lineTo(px(edgeStarlight(outer, t, mass)), py(t));
      }
      return shape.close();
    };
    const optimisticBand = new Path(null, { fill: HabitabilityLabColors.optimisticZoneColorProperty });
    const conservativeBand = new Path(null, { fill: HabitabilityLabColors.conservativeZoneColorProperty });
    model.planetMassProperty.link((mass) => {
      optimisticBand.shape = band("recentVenus", "earlyMars", mass);
      conservativeBand.shape = band("runawayGreenhouse", "maximumGreenhouse", mass);
    });

    // Every small archive planet, as one path of tiny dots.
    const archiveShape = new Shape();
    for (const [s, t] of SMALL_PLANETS) {
      if (s >= S_MIN && s <= S_MAX && t >= T_MIN && t <= T_MAX) {
        archiveShape.circle(px(s), py(t), 1.3);
      }
    }
    const archiveDots = new Path(archiveShape, {
      fill: HabitabilityLabColors.backgroundPlanetColorProperty,
      visibleProperty: model.showArchiveProperty,
      pickable: false,
    });

    // The chosen star's temperature.
    const starLine = new Path(null, {
      stroke: HabitabilityLabColors.textColorProperty,
      lineWidth: 1,
      lineDash: [5, 4],
      opacity: 0.7,
    });
    model.starTemperatureProperty.link((t) => {
      const y = py(Math.min(Math.max(t, T_MIN), T_MAX));
      starLine.shape = new Shape().moveTo(0, y).lineTo(width, y);
    });

    // Curated exoplanets: small dots, larger with an outline when in the chosen system.
    const curatedDots = CURATED_PLANETS.map((planet) => {
      const dot = new Circle(3.5, {
        fill: HabitabilityLabColors.exoplanetColorProperty,
        x: px(Math.min(Math.max(planet.insolation, S_MIN), S_MAX)),
        y: py(planet.starTemperature),
        cursor: "pointer",
        touchArea: Shape.circle(0, 0, 8),
        mouseArea: Shape.circle(0, 0, 6),
      });
      dot.addInputListener(new FireListener({ fire: () => model.selectByName(planet.name) }));
      model.systemProperty.link((system) => {
        const inSystem = system.key === planet.host;
        dot.radius = inSystem ? 5 : 3.5;
        dot.stroke = inSystem ? HabitabilityLabColors.selectedColorProperty : null;
        dot.opacity = inSystem ? 1 : 0.75;
      });
      return dot;
    });

    // Solar System planets on the Sun's temperature, labelled.
    const solarDots = SOLAR_SYSTEM.planets.map((planet) => {
      const dot = new Circle(4.5, {
        fill: HabitabilityLabColors.earthColorProperty,
        x: px(planet.insolation),
        y: py(SUN_TEMPERATURE_K),
        cursor: "pointer",
        touchArea: Shape.circle(0, 0, 9),
      });
      dot.addInputListener(
        new FireListener({
          fire: () => {
            model.systemProperty.value = SOLAR_SYSTEM;
            model.selectedPlanetProperty.value = planet;
          },
        }),
      );
      const label = new Text(planet.bodyKey ? bodyNameProperty(planet.bodyKey) : "", {
        font: FONTS.SMALL,
        fill: HabitabilityLabColors.earthColorProperty,
        maxWidth: 60,
        pickable: false,
      });
      label.boundsProperty.link(() => {
        label.centerX = dot.x;
        label.bottom = dot.y - 6;
      });
      return new Node({ children: [dot, label] });
    });

    // A ring and a name on the selected planet.
    const selectionRing = new Circle(9, {
      stroke: HabitabilityLabColors.selectedColorProperty,
      lineWidth: 2,
      pickable: false,
    });
    const selectionLabel = new Text("", {
      font: FONTS.SMALL,
      fill: HabitabilityLabColors.selectedColorProperty,
      maxWidth: 120,
      pickable: false,
    });
    Multilink.multilink([model.selectedPlanetProperty, model.systemProperty], (planet, system) => {
      selectionRing.visible = planet !== null;
      selectionLabel.visible = planet !== null && planet.bodyKey === null;
      if (planet) {
        selectionRing.x = px(Math.min(Math.max(planet.insolation, S_MIN), S_MAX));
        selectionRing.y = py(planet.bodyKey ? SUN_TEMPERATURE_K : system.temperature);
        selectionLabel.string = planet.name;
        selectionLabel.left = selectionRing.right + 3;
        selectionLabel.centerY = selectionRing.y + 10;
        if (selectionLabel.right > width) {
          selectionLabel.right = selectionRing.left - 3;
        }
      }
    });

    // Legend.
    const swatch = (
      fill: typeof HabitabilityLabColors.conservativeZoneColorProperty,
      label: typeof strings.systemStringProperty,
    ) =>
      new HBox({
        spacing: 5,
        children: [
          new Rectangle(0, 0, 14, 10, { fill: fill }),
          new Text(label, { font: FONTS.SMALL, fill: HabitabilityLabColors.textColorProperty, maxWidth: 120 }),
        ],
      });
    const legend = new VBox({
      spacing: 3,
      align: "left",
      children: [
        swatch(HabitabilityLabColors.conservativeZoneColorProperty, common.conservativeZoneStringProperty),
        swatch(HabitabilityLabColors.optimisticZoneColorProperty, common.optimisticZoneStringProperty),
      ],
    });
    legend.left = 6;
    legend.top = 6;

    chart.plotLayer.children = [optimisticBand, conservativeBand, archiveDots, starLine, ...curatedDots, ...solarDots];
    chart.overlayLayer.children = [selectionRing, selectionLabel, legend];
    this.children = [chart];
  }
}
