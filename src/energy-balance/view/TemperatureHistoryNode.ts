/**
 * TemperatureHistoryNode.ts
 *
 * The planet's temperature over the last 30 simulated years (0 = now, so the
 * axis never scrolls), with the equilibrium temperature as a dashed line and,
 * for a Solar System planet, its measured surface temperature as a second
 * dashed line. The temperature axis grows in steps when the planet gets hot.
 */

import { Multilink } from "scenerystack/axon";
import { Shape } from "scenerystack/kite";
import { Node, Path, RichText } from "scenerystack/scenery";
import { ChartFrameNode } from "../../common/view/ChartFrameNode.js";
import HabitabilityLabColors from "../../HabitabilityLabColors.js";
import { FONTS, HISTORY_YEARS } from "../../HabitabilityLabConstants.js";
import { StringManager } from "../../i18n/StringManager.js";
import type { EnergyBalanceModel } from "../model/EnergyBalanceModel.js";

/** Upper limits the temperature axis steps through, K. */
const AXIS_MAXIMA = [300, 400, 500, 800, 1000] as const;

export class TemperatureHistoryNode extends Node {
  public constructor(model: EnergyBalanceModel, width: number, height: number) {
    super();
    const strings = StringManager.getInstance().getEnergyBalanceStrings();

    const chart = new ChartFrameNode({
      viewWidth: width,
      viewHeight: height,
      xAxis: { min: -HISTORY_YEARS, max: 0 },
      yAxis: { min: 0, max: 400 },
      xAxisLabelProperty: strings.timeAxisStringProperty,
      yAxisLabelProperty: strings.temperatureAxisStringProperty,
    });

    const curve = new Path(null, { stroke: HabitabilityLabColors.temperatureCurveColorProperty, lineWidth: 2.5 });
    const equilibriumLine = new Path(null, {
      stroke: HabitabilityLabColors.equilibriumLineColorProperty,
      lineWidth: 1.5,
      lineDash: [6, 4],
    });
    const measuredLine = new Path(null, {
      stroke: HabitabilityLabColors.measuredColorProperty,
      lineWidth: 1.5,
      lineDash: [2, 3],
    });
    chart.plotLayer.children = [equilibriumLine, measuredLine, curve];

    const equilibriumLabel = new RichText(strings.equilibriumStringProperty, {
      font: FONTS.SMALL,
      fill: HabitabilityLabColors.equilibriumLineColorProperty,
      maxWidth: 110,
    });
    const measuredLabel = new RichText(strings.measuredStringProperty, {
      font: FONTS.SMALL,
      fill: HabitabilityLabColors.measuredColorProperty,
      maxWidth: 110,
    });
    chart.overlayLayer.children = [equilibriumLabel, measuredLabel];

    const redraw = (): void => {
      const now = model.yearsProperty.value;
      const highest = Math.max(
        model.equilibriumTemperatureProperty.value,
        model.measuredTemperatureProperty.value ?? 0,
        ...model.history.map(([, t]) => t),
      );
      const yMax = AXIS_MAXIMA.find((max) => max >= highest * 1.08) ?? AXIS_MAXIMA[AXIS_MAXIMA.length - 1];
      if (chart.getYAxis().max !== yMax) {
        chart.setAxes(chart.getXAxis(), { min: 0, max: yMax ?? 1000 });
      }
      curve.shape = chart.polyline(model.history.map(([t, kelvin]) => [t - now, kelvin] as const));

      const yEq = chart.modelToViewY(Math.min(model.equilibriumTemperatureProperty.value, chart.getYAxis().max));
      equilibriumLine.shape = new Shape().moveTo(0, yEq).lineTo(width, yEq);
      equilibriumLabel.left = width + 6;
      equilibriumLabel.centerY = yEq;

      const measured = model.measuredTemperatureProperty.value;
      measuredLine.visible = measured !== null;
      measuredLabel.visible = measured !== null;
      if (measured !== null) {
        const yMeasured = chart.modelToViewY(Math.min(measured, chart.getYAxis().max));
        measuredLine.shape = new Shape().moveTo(0, yMeasured).lineTo(width, yMeasured);
        measuredLabel.left = width + 6;
        measuredLabel.centerY = yMeasured;
        // Keep the two labels from overlapping when the values are close (Mars).
        if (Math.abs(yMeasured - yEq) < 14) {
          measuredLabel.centerY = yEq + (yMeasured >= yEq ? 14 : -14);
        }
      }
    };
    model.historyChangedEmitter.addListener(redraw);
    Multilink.multilink([model.equilibriumTemperatureProperty, model.measuredTemperatureProperty], redraw);

    this.children = [chart];
  }
}
