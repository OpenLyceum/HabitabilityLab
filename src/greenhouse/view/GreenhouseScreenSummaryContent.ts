/**
 * GreenhouseScreenSummaryContent.ts
 *
 * The accessible screen summary for the Greenhouse screen. Its current-details
 * paragraph stays live: bare-rock and surface temperatures, pressure, and what
 * water would do at the surface.
 */

import { DerivedProperty, PatternStringProperty } from "scenerystack/axon";
import { ScreenSummaryContent } from "scenerystack/sim";
import { formatSignificant, toPlainText } from "../../common/view/chartUtils.js";
import { StringManager } from "../../i18n/StringManager.js";
import type { GreenhouseModel } from "../model/GreenhouseModel.js";

export class GreenhouseScreenSummaryContent extends ScreenSummaryContent {
  public constructor(model: GreenhouseModel) {
    const stringManager = StringManager.getInstance();
    const a11y = stringManager.getGreenhouseA11yStrings();
    const strings = stringManager.getGreenhouseStrings();

    super({
      playAreaContent: a11y.screenSummary.playAreaStringProperty,
      controlAreaContent: a11y.screenSummary.controlAreaStringProperty,
      currentDetailsContent: new PatternStringProperty(a11y.currentDetailsPatternStringProperty, {
        bare: new DerivedProperty([model.equilibriumTemperatureProperty], (t) => String(Math.round(t))),
        surface: new DerivedProperty([model.surfaceTemperatureProperty], (t) => String(Math.round(t))),
        pressure: new DerivedProperty([model.pressureProperty], (bar) => toPlainText(formatSignificant(bar, 2))),
        verdict: new DerivedProperty(
          [
            model.phaseProperty,
            strings.verdictIceStringProperty,
            strings.verdictLiquidStringProperty,
            strings.verdictVapourStringProperty,
            strings.verdictSupercriticalStringProperty,
          ],
          (phase, ice, liquid, vapour, supercritical) =>
            phase === "ice" ? ice : phase === "liquid" ? liquid : phase === "vapour" ? vapour : supercritical,
        ),
      }),
      interactionHintContent: a11y.screenSummary.interactionHintStringProperty,
    });
  }
}
