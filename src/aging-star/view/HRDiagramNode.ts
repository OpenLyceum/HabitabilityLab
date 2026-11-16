import { HR_DIAGRAM_NODE_SETTINGS } from "../../HabitabilityLabConstants.js";
/**
 * HRDiagramNode.ts
 *
 * A small Hertzsprung–Russell diagram: the star's whole evolutionary track
 * (temperature, hot on the left, against luminosity, both logarithmic), the
 * part already lived drawn brighter, and the current state as a dot.
 */

import { Multilink } from "scenerystack/axon";
import { Circle, Node, Path } from "scenerystack/scenery";
import { trackStates } from "../../common/model/stellarTracks.js";
import { ChartFrameNode } from "../../common/view/ChartFrameNode.js";
import { starColor } from "../../common/view/StarNode.js";
import HabitabilityLabColors from "../../HabitabilityLabColors.js";
import { StringManager } from "../../i18n/StringManager.js";
import type { AgingStarModel } from "../model/AgingStarModel.js";

export class HRDiagramNode extends Node {
  public constructor(model: AgingStarModel, width: number, height: number) {
    super();
    const strings = StringManager.getInstance().getAgingStarStrings();
    const chart = new ChartFrameNode({
      viewWidth: width,
      viewHeight: height,
      xAxis: { min: 2000, max: 100000, log: true, reversed: true },
      yAxis: { min: 1e-4, max: 1e6, log: true },
      xAxisLabelProperty: strings.hrTemperatureAxisStringProperty,
      yAxisLabelProperty: strings.luminosityAxisStringProperty,
    });

    const fullTrack = new Path(null, {
      stroke: HabitabilityLabColors.trackColorProperty,
      lineWidth: 1,
      opacity: HR_DIAGRAM_NODE_SETTINGS.FULL_TRACK_OPACITY,
    });
    const livedTrack = new Path(null, {
      stroke: HabitabilityLabColors.luminosityCurveColorProperty,
      lineWidth: HR_DIAGRAM_NODE_SETTINGS.LIVED_TRACK_LINE_WIDTH,
    });
    const dot = new Circle(HR_DIAGRAM_NODE_SETTINGS.DOT_RADIUS, {
      stroke: HabitabilityLabColors.selectedColorProperty,
      lineWidth: HR_DIAGRAM_NODE_SETTINGS.DOT_LINE_WIDTH,
    });

    let points: [number, number, number][] = [];
    model.windowProperty.link((window) => {
      points = trackStates(model.trackProperty.value)
        .filter((s) => s.ageMyr <= window.max)
        .map((s) => [s.ageMyr, s.temperature, s.luminosity]);
      fullTrack.shape = chart.polyline(points.map(([, t, l]) => [t, l]));
    });
    Multilink.multilink([model.starProperty, model.trackProperty], (star) => {
      livedTrack.shape = chart.polyline([
        ...points.filter(([age]) => age <= star.ageMyr).map(([, t, l]) => [t, l] as const),
        [star.temperature, star.luminosity],
      ]);
      dot.x = chart.modelToViewX(Math.min(Math.max(star.temperature, HR_DIAGRAM_NODE_SETTINGS.CONSTRUCTOR_X), 100000));
      dot.y = chart.modelToViewY(Math.min(Math.max(star.luminosity, HR_DIAGRAM_NODE_SETTINGS.CONSTRUCTOR_Y), 1e6));
      dot.fill = starColor(star.temperature);
    });

    chart.plotLayer.children = [fullTrack, livedTrack];
    chart.overlayLayer.children = [dot];
    this.children = [chart];
  }
}
