/**
 * EnergyBarsNode.ts
 *
 * Two bars, absorbed sunlight and emitted infrared per square metre of the
 * planet's surface, on a shared scale that rescales in 1-2-5 steps, with a
 * thermometer beside them and a line saying whether the planet is warming,
 * cooling or balanced.
 */

import { DerivedProperty, Multilink, type TReadOnlyProperty } from "scenerystack/axon";
import { HBox, Line, Node, Rectangle, RichText, type TColor, Text, VBox } from "scenerystack/scenery";
import { ThermometerNode } from "scenerystack/scenery-phet";
import { formatSignificant } from "../../common/view/chartUtils.js";
import { formatFlux, unitDependencies } from "../../common/view/formatters.js";
import HabitabilityLabColors from "../../HabitabilityLabColors.js";
import { FONTS, TEMPERATURE_DISPLAY_RANGE } from "../../HabitabilityLabConstants.js";
import { StringManager } from "../../i18n/StringManager.js";
import type { EnergyBalanceModel } from "../model/EnergyBalanceModel.js";

const BAR_WIDTH = 34;
const BAR_HEIGHT = 120;
const BAR_SPACING = 26;

/** The smallest of 1, 2 or 5 × 10ⁿ at least `value`. */
const niceCeil = (value: number): number => {
  const decade = 10 ** Math.floor(Math.log10(value));
  const m = value / decade;
  return decade * (m <= 1 ? 1 : m <= 2 ? 2 : m <= 5 ? 5 : 10);
};

export class EnergyBarsNode extends VBox {
  public constructor(model: EnergyBalanceModel, width: number) {
    const strings = StringManager.getInstance().getEnergyBalanceStrings();

    const scaleProperty = new DerivedProperty([model.absorbedProperty, model.emittedProperty], (a, e) =>
      niceCeil(Math.max(a, e, 20) * 1.1),
    );

    const makeBar = (fluxProperty: TReadOnlyProperty<number>, fill: TColor, label: TReadOnlyProperty<string>): Node => {
      const bar = new Rectangle(0, 0, BAR_WIDTH, 1, { fill: fill });
      const valueText = new RichText("", {
        font: FONTS.SMALL,
        fill: HabitabilityLabColors.textColorProperty,
        maxWidth: 80,
      });
      Multilink.multilinkAny([fluxProperty, scaleProperty, ...unitDependencies()], () => {
        const height = Math.max(1, (BAR_HEIGHT * fluxProperty.value) / scaleProperty.value);
        bar.setRect(0, BAR_HEIGHT - height, BAR_WIDTH, height);
        valueText.string = formatFlux(fluxProperty.value);
        valueText.centerX = BAR_WIDTH / 2;
        valueText.bottom = bar.top - 3;
      });
      const caption = new Text(label, {
        font: FONTS.SMALL,
        fill: HabitabilityLabColors.textColorProperty,
        maxWidth: BAR_WIDTH + BAR_SPACING,
      });
      caption.boundsProperty.link(() => {
        caption.centerX = BAR_WIDTH / 2;
        caption.top = BAR_HEIGHT + 4;
      });
      return new Node({ children: [bar, valueText, caption] });
    };

    const absorbedBar = makeBar(
      model.absorbedProperty,
      HabitabilityLabColors.sunlightColorProperty,
      strings.absorbedShortStringProperty,
    );
    const emittedBar = makeBar(
      model.emittedProperty,
      HabitabilityLabColors.infraredColorProperty,
      strings.emittedShortStringProperty,
    );
    emittedBar.x = BAR_WIDTH + BAR_SPACING;
    const baseline = new Line(-6, BAR_HEIGHT, 2 * BAR_WIDTH + BAR_SPACING + 6, BAR_HEIGHT, {
      stroke: HabitabilityLabColors.chartAxisColorProperty,
    });
    const scaleText = new Text("", { font: FONTS.SMALL, fill: HabitabilityLabColors.mutedTextColorProperty });
    scaleProperty.link((scale) => {
      scaleText.string = `0–${formatSignificant(scale, 2)}`;
    });
    const bars = new Node({ children: [baseline, absorbedBar, emittedBar] });

    const thermometer = new ThermometerNode(
      model.temperatureProperty,
      TEMPERATURE_DISPLAY_RANGE.min,
      TEMPERATURE_DISPLAY_RANGE.max,
      {
        tubeHeight: BAR_HEIGHT - 10,
        tubeWidth: 14,
        bulbDiameter: 26,
        tickSpacingTemperature: 100,
        backgroundFill: HabitabilityLabColors.chartBackgroundColorProperty,
        outlineStroke: HabitabilityLabColors.chartAxisColorProperty,
      },
    );

    const trendText = new Text(
      new DerivedProperty(
        [
          model.trendProperty,
          strings.warmingStringProperty,
          strings.coolingStringProperty,
          strings.balancedStringProperty,
        ],
        (trend, warming, cooling, balanced) =>
          trend === "warming" ? warming : trend === "cooling" ? cooling : balanced,
      ),
      { font: FONTS.LABEL, fill: HabitabilityLabColors.textColorProperty, maxWidth: width },
    );
    model.trendProperty.link((trend) => {
      trendText.fill =
        trend === "warming"
          ? HabitabilityLabColors.infraredColorProperty
          : trend === "cooling"
            ? HabitabilityLabColors.tooColdColorProperty
            : HabitabilityLabColors.habitableColorProperty;
    });

    super({
      spacing: 8,
      align: "center",
      children: [
        new Text(strings.balanceTitleStringProperty, {
          font: FONTS.TITLE,
          fill: HabitabilityLabColors.textColorProperty,
          maxWidth: width,
        }),
        new HBox({ spacing: 26, align: "bottom", children: [bars, thermometer] }),
        trendText,
      ],
    });
  }
}
