/**
 * EnergyBalanceScreenSummaryContent.ts
 *
 * The accessible screen summary for the Energy Balance screen. Its current-details
 * paragraph stays live: starlight received, current temperature and trend, and
 * the equilibrium temperature.
 */

import { DerivedProperty, PatternStringProperty } from "scenerystack/axon";
import { ScreenSummaryContent } from "scenerystack/sim";
import { formatSignificant, toPlainText } from "../../common/view/chartUtils.js";
import { StringManager } from "../../i18n/StringManager.js";
import type { EnergyBalanceModel } from "../model/EnergyBalanceModel.js";

export class EnergyBalanceScreenSummaryContent extends ScreenSummaryContent {
  public constructor(model: EnergyBalanceModel) {
    const a11y = StringManager.getInstance().getEnergyBalanceA11yStrings();

    super({
      playAreaContent: a11y.screenSummary.playAreaStringProperty,
      controlAreaContent: a11y.screenSummary.controlAreaStringProperty,
      currentDetailsContent: new PatternStringProperty(a11y.currentDetailsPatternStringProperty, {
        starlight: new DerivedProperty([model.starlightProperty], (s) => toPlainText(formatSignificant(s, 3))),
        temperature: new DerivedProperty([model.temperatureProperty], (t) => String(Math.round(t))),
        trend: new DerivedProperty(
          [model.trendProperty, a11y.warmingStringProperty, a11y.coolingStringProperty, a11y.balancedStringProperty],
          (trend, warming, cooling, balanced) =>
            trend === "warming" ? warming : trend === "cooling" ? cooling : balanced,
        ),
        equilibrium: new DerivedProperty([model.equilibriumTemperatureProperty], (t) => String(Math.round(t))),
      }),
      interactionHintContent: a11y.screenSummary.interactionHintStringProperty,
    });
  }
}
