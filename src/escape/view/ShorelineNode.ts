import { SHORELINE_NODE_SETTINGS } from "../../HabitabilityLabConstants.js";
/**
 * ShorelineNode.ts
 *
 * The cosmic shoreline (Zahnle & Catling 2017): escape speed against starlight
 * received, both logarithmic. Solar System bodies are filled when they have an
 * atmosphere and hollow when they do not; exoplanets with a measured mass and
 * radius are dots coloured by their host star (red dwarfs apart), a few of them
 * labelled. The line S = (v_esc / 6.5 km/s)⁴ separates the two sides.
 */

import { Shape } from "scenerystack/kite";
import { Circle, HBox, Node, Path, Text, VBox } from "scenerystack/scenery";
import { shorelineStarlight } from "../../common/model/escape.js";
import { SHORELINE_BODIES, SHORELINE_HIGHLIGHTS, SHORELINE_PLANETS } from "../../common/model/planets.js";
import { ChartFrameNode } from "../../common/view/ChartFrameNode.js";
import { bodyNameProperty } from "../../common/view/formatters.js";
import HabitabilityLabColors from "../../HabitabilityLabColors.js";
import { FONTS } from "../../HabitabilityLabConstants.js";
import { StringManager } from "../../i18n/StringManager.js";
import type { EscapeModel } from "../model/EscapeModel.js";

const V_MIN: number = SHORELINE_NODE_SETTINGS.V_MIN;
const V_MAX: number = SHORELINE_NODE_SETTINGS.V_MAX;
const S_MIN: number = SHORELINE_NODE_SETTINGS.S_MIN;
const S_MAX: number = SHORELINE_NODE_SETTINGS.S_MAX;

/** Hosts cooler than this are drawn as red dwarfs, K. */
const RED_DWARF_TEMPERATURE: number = SHORELINE_NODE_SETTINGS.RED_DWARF_TEMPERATURE;

/** Label offsets (px) that keep crowded Solar System names apart. */
const LABEL_OFFSETS: Partial<Record<string, readonly [number, number]>> = {
  io: [-4, 12],
  europa: [-6, 0],
  ganymede: [6, -8],
  callisto: [-6, -10],
  uranus: [6, 8],
  neptune: [6, -6],
  saturn: [6, 0],
  titan: [6, 4],
  triton: [6, 0],
};

export class ShorelineNode extends Node {
  public constructor(model: EscapeModel, width: number, height: number) {
    super();
    const strings = StringManager.getInstance().getEscapeStrings();
    const chart = new ChartFrameNode({
      viewWidth: width,
      viewHeight: height,
      xAxis: { min: V_MIN, max: V_MAX, log: true },
      yAxis: { min: S_MIN, max: S_MAX, log: true },
      xAxisLabelProperty: strings.shorelineSpeedAxisStringProperty,
      yAxisLabelProperty: strings.shorelineStarlightAxisStringProperty,
    });
    const px = (v: number): number => chart.modelToViewX(v);
    const py = (s: number): number => chart.modelToViewY(s);

    // The bare side of the line (high starlight for the escape speed), lightly shaded.
    const lineShape = new Shape();
    const bareSide = new Shape().moveTo(px(V_MIN), 0);
    for (let i = 0; i <= 60; i++) {
      const v = V_MIN * (V_MAX / V_MIN) ** (i / 60);
      const y = py(Math.min(Math.max(shorelineStarlight(v), S_MIN / 10), S_MAX * 10));
      if (i === 0) {
        lineShape.moveTo(px(v), y);
      } else {
        lineShape.lineTo(px(v), y);
      }
      bareSide.lineTo(px(v), y);
    }
    bareSide.lineTo(width, 0).close();
    const bareRegion = new Path(bareSide, {
      fill: HabitabilityLabColors.tooHotColorProperty,
      opacity: SHORELINE_NODE_SETTINGS.BARE_REGION_OPACITY,
    });
    const line = new Path(lineShape, {
      stroke: HabitabilityLabColors.shorelineColorProperty,
      lineWidth: SHORELINE_NODE_SETTINGS.LINE_LINE_WIDTH,
    });

    // Exoplanets, one path per host colour.
    const redShape = new Shape();
    const otherShape = new Shape();
    for (const planet of SHORELINE_PLANETS) {
      if (
        planet.escapeSpeed >= V_MIN &&
        planet.escapeSpeed <= V_MAX &&
        planet.insolation >= S_MIN &&
        planet.insolation <= S_MAX
      ) {
        (planet.starTemperature < RED_DWARF_TEMPERATURE ? redShape : otherShape).circle(
          px(planet.escapeSpeed),
          py(planet.insolation),
          SHORELINE_NODE_SETTINGS.CIRCLE_RADIUS,
        );
      }
    }
    const exoplanets = new Node({
      visibleProperty: model.showExoplanetsProperty,
      children: [
        new Path(otherShape, {
          fill: HabitabilityLabColors.exoplanetColorProperty,
          opacity: SHORELINE_NODE_SETTINGS.EXOPLANETS_OPACITY,
        }),
        new Path(redShape, {
          fill: HabitabilityLabColors.infraredColorProperty,
          opacity: SHORELINE_NODE_SETTINGS.EXOPLANETS_ITEM_2_OPACITY,
        }),
      ],
    });
    const highlights = new Node({ visibleProperty: model.showExoplanetsProperty });
    highlights.children = SHORELINE_PLANETS.filter((p) => SHORELINE_HIGHLIGHTS.includes(p.name)).map((planet) => {
      const dot = new Circle(SHORELINE_NODE_SETTINGS.DOT_RADIUS, {
        fill:
          planet.starTemperature < RED_DWARF_TEMPERATURE
            ? HabitabilityLabColors.infraredColorProperty
            : HabitabilityLabColors.exoplanetColorProperty,
        stroke: HabitabilityLabColors.selectedColorProperty,
        x: px(planet.escapeSpeed),
        y: py(planet.insolation),
      });
      const label = new Text(planet.name, {
        font: FONTS.SMALL,
        fill: HabitabilityLabColors.textColorProperty,
        left: dot.x + SHORELINE_NODE_SETTINGS.LABEL_LEFT_OFFSET,
        centerY: dot.y,
      });
      return new Node({ children: [dot, label] });
    });

    // Solar System bodies.
    const bodies = SHORELINE_BODIES.map((body) => {
      const dot = new Circle(SHORELINE_NODE_SETTINGS.DOT_RADIUS_SEGMENT_2, {
        fill: body.hasAtmosphere ? HabitabilityLabColors.earthColorProperty : null,
        stroke: HabitabilityLabColors.earthColorProperty,
        lineWidth: SHORELINE_NODE_SETTINGS.DOT_LINE_WIDTH,
        x: px(body.escapeSpeed),
        y: py(body.insolation),
      });
      const label = new Text(bodyNameProperty(body.key), {
        font: FONTS.SMALL,
        fill: HabitabilityLabColors.earthColorProperty,
        maxWidth: SHORELINE_NODE_SETTINGS.LABEL_MAX_WIDTH,
      });
      const [dx, dy] = LABEL_OFFSETS[body.key] ?? [6, 0];
      label.boundsProperty.link(() => {
        if (dx >= 0) {
          label.left = dot.x + dx + SHORELINE_NODE_SETTINGS.BODIES_LEFT_OFFSET;
        } else {
          label.right = dot.x + dx - SHORELINE_NODE_SETTINGS.BODIES_RIGHT_OFFSET;
        }
        label.centerY = dot.y + dy;
      });
      return new Node({ children: [dot, label] });
    });

    const sideLabel = (stringProperty: typeof strings.atmosphereSideStringProperty, v: number, s: number): Text =>
      new Text(stringProperty, {
        font: FONTS.TITLE,
        fill: HabitabilityLabColors.textColorProperty,
        opacity: SHORELINE_NODE_SETTINGS.SIDE_LABEL_OPACITY,
        centerX: px(v),
        centerY: py(s),
        maxWidth: SHORELINE_NODE_SETTINGS.SIDE_LABEL_MAX_WIDTH,
      });

    // Legend.
    const legendRow = (dot: Node, label: typeof strings.hasAtmosphereStringProperty): HBox =>
      new HBox({
        spacing: SHORELINE_NODE_SETTINGS.LEGEND_ROW_SPACING,
        children: [
          dot,
          new Text(label, {
            font: FONTS.SMALL,
            fill: HabitabilityLabColors.textColorProperty,
            maxWidth: SHORELINE_NODE_SETTINGS.LEGEND_ROW_MAX_WIDTH,
          }),
        ],
      });
    const legend = new VBox({
      spacing: SHORELINE_NODE_SETTINGS.LEGEND_SPACING,
      align: "left",
      children: [
        legendRow(
          new Circle(SHORELINE_NODE_SETTINGS.LEGEND_RADIUS, { fill: HabitabilityLabColors.earthColorProperty }),
          strings.hasAtmosphereStringProperty,
        ),
        legendRow(
          new Circle(SHORELINE_NODE_SETTINGS.LEGEND_RADIUS, {
            stroke: HabitabilityLabColors.earthColorProperty,
            lineWidth: SHORELINE_NODE_SETTINGS.LEGEND_LINE_WIDTH,
          }),
          strings.noAtmosphereStringProperty,
        ),
        legendRow(
          new Circle(SHORELINE_NODE_SETTINGS.LEGEND_RADIUS_SEGMENT_2, {
            fill: HabitabilityLabColors.infraredColorProperty,
          }),
          strings.redDwarfHostsStringProperty,
        ),
        legendRow(
          new Circle(SHORELINE_NODE_SETTINGS.LEGEND_RADIUS_SEGMENT_2, {
            fill: HabitabilityLabColors.exoplanetColorProperty,
          }),
          strings.otherHostsStringProperty,
        ),
        legendRow(
          new Path(new Shape().moveTo(0, 0).lineTo(SHORELINE_NODE_SETTINGS.LEGEND_X, 0), {
            stroke: HabitabilityLabColors.shorelineColorProperty,
            lineWidth: SHORELINE_NODE_SETTINGS.CONSTRUCTOR_LEGEND_LINE_WIDTH,
          }),
          strings.shorelineStringProperty,
        ),
      ],
    });
    legend.left = SHORELINE_NODE_SETTINGS.LEFT_LEFT;
    legend.top = SHORELINE_NODE_SETTINGS.TOP_TOP;

    chart.plotLayer.children = [
      bareRegion,
      line,
      sideLabel(strings.bareSideStringProperty, 1.4, 20),
      sideLabel(strings.atmosphereSideStringProperty, 6.5, 1e-3),
      exoplanets,
      highlights,
      ...bodies,
    ];
    chart.overlayLayer.children = [legend];
    this.children = [chart];
  }
}
