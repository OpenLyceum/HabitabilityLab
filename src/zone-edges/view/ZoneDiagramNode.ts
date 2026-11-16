import { ZONE_DIAGRAM_NODE_SETTINGS } from "../../HabitabilityLabConstants.js";
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

const S_MIN: number = ZONE_DIAGRAM_NODE_SETTINGS.S_MIN;
const S_MAX: number = ZONE_DIAGRAM_NODE_SETTINGS.S_MAX;
const T_MIN: number = ZONE_DIAGRAM_NODE_SETTINGS.T_MIN;
const T_MAX: number = ZONE_DIAGRAM_NODE_SETTINGS.T_MAX;
const SAMPLES: number = ZONE_DIAGRAM_NODE_SETTINGS.SAMPLES;

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
        archiveShape.circle(px(s), py(t), ZONE_DIAGRAM_NODE_SETTINGS.CIRCLE_RADIUS);
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
      lineDash: [
        ZONE_DIAGRAM_NODE_SETTINGS.STAR_LINE_LINE_DASH_DASH,
        ZONE_DIAGRAM_NODE_SETTINGS.CONSTRUCTOR_STAR_LINE_LINE_DASH_DASH,
      ],
      opacity: ZONE_DIAGRAM_NODE_SETTINGS.STAR_LINE_OPACITY,
    });
    model.starTemperatureProperty.link((t) => {
      const y = py(Math.min(Math.max(t, T_MIN), T_MAX));
      starLine.shape = new Shape().moveTo(0, y).lineTo(width, y);
    });

    // Curated exoplanets: small dots, larger with an outline when in the chosen system.
    const curatedDots = CURATED_PLANETS.map((planet) => {
      const dot = new Circle(ZONE_DIAGRAM_NODE_SETTINGS.DOT_RADIUS, {
        fill: HabitabilityLabColors.exoplanetColorProperty,
        x: px(Math.min(Math.max(planet.insolation, S_MIN), S_MAX)),
        y: py(planet.starTemperature),
        cursor: "pointer",
        touchArea: Shape.circle(0, 0, ZONE_DIAGRAM_NODE_SETTINGS.DOT_RADIUS_SEGMENT_2),
        mouseArea: Shape.circle(0, 0, ZONE_DIAGRAM_NODE_SETTINGS.DOT_RADIUS_SEGMENT_3),
      });
      dot.addInputListener(new FireListener({ fire: () => model.selectByName(planet.name) }));
      model.systemProperty.link((system) => {
        const inSystem = system.key === planet.host;
        dot.radius = inSystem
          ? ZONE_DIAGRAM_NODE_SETTINGS.CURATED_DOTS_RADIUS
          : ZONE_DIAGRAM_NODE_SETTINGS.CONSTRUCTOR_CURATED_DOTS_RADIUS;
        dot.stroke = inSystem ? HabitabilityLabColors.selectedColorProperty : null;
        dot.opacity = inSystem ? 1 : 0.75;
      });
      return dot;
    });

    // Solar System planets on the Sun's temperature, labelled.
    const solarDots = SOLAR_SYSTEM.planets.map((planet) => {
      const dot = new Circle(ZONE_DIAGRAM_NODE_SETTINGS.DOT_RADIUS_SEGMENT_4, {
        fill: HabitabilityLabColors.earthColorProperty,
        x: px(planet.insolation),
        y: py(SUN_TEMPERATURE_K),
        cursor: "pointer",
        touchArea: Shape.circle(0, 0, ZONE_DIAGRAM_NODE_SETTINGS.DOT_RADIUS_SEGMENT_5),
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
        maxWidth: ZONE_DIAGRAM_NODE_SETTINGS.LABEL_MAX_WIDTH,
        pickable: false,
      });
      label.boundsProperty.link(() => {
        label.centerX = dot.x;
        label.bottom = dot.y - ZONE_DIAGRAM_NODE_SETTINGS.SOLAR_DOTS_BOTTOM_OFFSET;
      });
      return new Node({ children: [dot, label] });
    });

    // A ring and a name on the selected planet.
    const selectionRing = new Circle(ZONE_DIAGRAM_NODE_SETTINGS.SELECTION_RING_RADIUS, {
      stroke: HabitabilityLabColors.selectedColorProperty,
      lineWidth: ZONE_DIAGRAM_NODE_SETTINGS.SELECTION_RING_LINE_WIDTH,
      pickable: false,
    });
    const selectionLabel = new Text("", {
      font: FONTS.SMALL,
      fill: HabitabilityLabColors.selectedColorProperty,
      maxWidth: ZONE_DIAGRAM_NODE_SETTINGS.SELECTION_LABEL_MAX_WIDTH,
      pickable: false,
    });
    Multilink.multilink([model.selectedPlanetProperty, model.systemProperty], (planet, system) => {
      selectionRing.visible = planet !== null;
      selectionLabel.visible = planet !== null && planet.bodyKey === null;
      if (planet) {
        selectionRing.x = px(Math.min(Math.max(planet.insolation, S_MIN), S_MAX));
        selectionRing.y = py(planet.bodyKey ? SUN_TEMPERATURE_K : system.temperature);
        selectionLabel.string = planet.name;
        selectionLabel.left = selectionRing.right + ZONE_DIAGRAM_NODE_SETTINGS.CONSTRUCTOR_LEFT_OFFSET;
        selectionLabel.centerY = selectionRing.y + ZONE_DIAGRAM_NODE_SETTINGS.CONSTRUCTOR_CENTER_Y_OFFSET;
        if (selectionLabel.right > width) {
          selectionLabel.right = selectionRing.left - ZONE_DIAGRAM_NODE_SETTINGS.CONSTRUCTOR_RIGHT_OFFSET;
        }
      }
    });

    // Legend.
    const swatch = (
      fill: typeof HabitabilityLabColors.conservativeZoneColorProperty,
      label: typeof strings.systemStringProperty,
    ) =>
      new HBox({
        spacing: ZONE_DIAGRAM_NODE_SETTINGS.SWATCH_SPACING,
        children: [
          new Rectangle(0, 0, ZONE_DIAGRAM_NODE_SETTINGS.SWATCH_WIDTH, ZONE_DIAGRAM_NODE_SETTINGS.SWATCH_HEIGHT, {
            fill: fill,
          }),
          new Text(label, {
            font: FONTS.SMALL,
            fill: HabitabilityLabColors.textColorProperty,
            maxWidth: ZONE_DIAGRAM_NODE_SETTINGS.SWATCH_MAX_WIDTH,
          }),
        ],
      });
    const legend = new VBox({
      spacing: ZONE_DIAGRAM_NODE_SETTINGS.LEGEND_SPACING,
      align: "left",
      children: [
        swatch(HabitabilityLabColors.conservativeZoneColorProperty, common.conservativeZoneStringProperty),
        swatch(HabitabilityLabColors.optimisticZoneColorProperty, common.optimisticZoneStringProperty),
      ],
    });
    legend.left = ZONE_DIAGRAM_NODE_SETTINGS.LEFT_LEFT;
    legend.top = ZONE_DIAGRAM_NODE_SETTINGS.TOP_TOP;

    chart.plotLayer.children = [optimisticBand, conservativeBand, archiveDots, starLine, ...curatedDots, ...solarDots];
    chart.overlayLayer.children = [selectionRing, selectionLabel, legend];
    this.children = [chart];
  }
}
