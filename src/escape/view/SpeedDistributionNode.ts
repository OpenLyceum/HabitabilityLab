/**
 * SpeedDistributionNode.ts
 *
 * The Maxwell–Boltzmann distribution of molecular speeds (scaled so its peak is
 * 1) with the typical speed v_rms and the escape speed marked, and the tail
 * beyond the escape speed shaded red. The speed axis runs to a little past the
 * escape speed, so a gas far too slow to escape shows as a narrow hump near zero.
 */

import { Multilink } from "scenerystack/axon";
import { Shape } from "scenerystack/kite";
import { Node, Path, RichText } from "scenerystack/scenery";
import { speedDistribution } from "../../common/model/escape.js";
import { ChartFrameNode } from "../../common/view/ChartFrameNode.js";
import HabitabilityLabColors from "../../HabitabilityLabColors.js";
import { FONTS } from "../../HabitabilityLabConstants.js";
import { StringManager } from "../../i18n/StringManager.js";
import { type EscapeModel, GAS_MASSES } from "../model/EscapeModel.js";

const SAMPLES = 240;

export class SpeedDistributionNode extends Node {
  public constructor(model: EscapeModel, width: number, height: number) {
    super();
    const strings = StringManager.getInstance().getEscapeStrings();
    const chart = new ChartFrameNode({
      viewWidth: width,
      viewHeight: height,
      xAxis: { min: 0, max: 15 },
      yAxis: { min: 0, max: 1.15 },
      xAxisLabelProperty: strings.speedAxisStringProperty,
      yAxisLabelProperty: strings.fractionAxisStringProperty,
      targetDivisions: 6,
    });

    const tail = new Path(null, { fill: HabitabilityLabColors.escapingColorProperty, opacity: 0.6 });
    const curve = new Path(null, { stroke: HabitabilityLabColors.distributionColorProperty, lineWidth: 2.5 });
    const escapeLine = new Path(null, { stroke: HabitabilityLabColors.escapingColorProperty, lineWidth: 2 });
    const rmsLine = new Path(null, { stroke: HabitabilityLabColors.textColorProperty, lineWidth: 1, lineDash: [4, 3] });
    const escapeLabel = new RichText(strings.vEscStringProperty, {
      font: FONTS.LABEL,
      fill: HabitabilityLabColors.escapingColorProperty,
    });
    const rmsLabel = new RichText(strings.vRmsStringProperty, {
      font: FONTS.LABEL,
      fill: HabitabilityLabColors.textColorProperty,
    });

    Multilink.multilink(
      [model.escapeSpeedProperty, model.temperatureProperty, model.gasProperty, model.rmsSpeedProperty],
      (escapeSpeed, temperature, gas, vRms) => {
        const mass = GAS_MASSES[gas];
        const vp = model.mostProbableSpeedProperty.value;
        const xMax = Math.max(1.2 * escapeSpeed, 3.5 * vp);
        chart.setAxes({ min: 0, max: xMax }, chart.getYAxis());
        // f(v) per km/s, scaled so the peak (at v_p) is 1.
        const peak = speedDistribution(vp * 1000, temperature, mass);
        const points: [number, number][] = [];
        for (let i = 0; i <= SAMPLES; i++) {
          const v = (xMax * i) / SAMPLES;
          points.push([v, speedDistribution(v * 1000, temperature, mass) / peak]);
        }
        curve.shape = chart.polyline(points);

        const tailShape = new Shape().moveTo(chart.modelToViewX(escapeSpeed), chart.modelToViewY(0));
        for (const [v, f] of points) {
          if (v >= escapeSpeed) {
            tailShape.lineTo(chart.modelToViewX(v), chart.modelToViewY(f));
          }
        }
        tail.shape = tailShape.lineTo(width, chart.modelToViewY(0)).close();

        const xEsc = chart.modelToViewX(escapeSpeed);
        escapeLine.shape = new Shape().moveTo(xEsc, 0).lineTo(xEsc, height);
        escapeLabel.right = xEsc - 4;
        escapeLabel.top = 4;
        const xRms = chart.modelToViewX(vRms);
        rmsLine.shape = new Shape().moveTo(xRms, 0).lineTo(xRms, height);
        rmsLabel.left = xRms + 4;
        rmsLabel.top = 4;
        if (rmsLabel.right > escapeLabel.left - 4) {
          rmsLabel.top = 22;
        }
      },
    );

    chart.plotLayer.children = [tail, curve, rmsLine, escapeLine];
    chart.overlayLayer.children = [rmsLabel, escapeLabel];
    this.children = [chart];
  }
}
