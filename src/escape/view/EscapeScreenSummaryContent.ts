/**
 * EscapeScreenSummaryContent.ts
 *
 * The accessible screen summary for the Escape screen. In the molecules view the
 * current-details paragraph gives the gas, temperature, escape speed, the ratio
 * to the typical speed and the verdict; in the shoreline view it says so.
 */

import { DerivedProperty, PatternStringProperty } from "scenerystack/axon";
import { ScreenSummaryContent } from "scenerystack/sim";
import { formatSignificant, toPlainText } from "../../common/view/chartUtils.js";
import { StringManager } from "../../i18n/StringManager.js";
import type { EscapeModel } from "../model/EscapeModel.js";

export class EscapeScreenSummaryContent extends ScreenSummaryContent {
  public constructor(model: EscapeModel) {
    const stringManager = StringManager.getInstance();
    const a11y = stringManager.getEscapeA11yStrings();
    const strings = stringManager.getEscapeStrings();
    const gasNames = strings.gases;

    const moleculeDetails = new PatternStringProperty(a11y.currentDetailsPatternStringProperty, {
      gas: DerivedProperty.deriveAny([model.gasProperty, ...Object.values(gasNames)], () =>
        toPlainText(gasNames[`${model.gasProperty.value}StringProperty`].value),
      ),
      temperature: new DerivedProperty([model.temperatureProperty], (t) => String(Math.round(t))),
      escapeSpeed: new DerivedProperty([model.escapeSpeedProperty], (v) => formatSignificant(v, 3)),
      ratio: DerivedProperty.deriveAny([model.escapeSpeedProperty, model.rmsSpeedProperty], () =>
        formatSignificant(model.escapeSpeedProperty.value / model.rmsSpeedProperty.value, 3),
      ),
      verdict: new DerivedProperty(
        [model.retainedProperty, strings.retainedStringProperty, strings.lostStringProperty],
        (retained, kept, lost) => toPlainText(retained ? kept : lost),
      ),
    });

    super({
      playAreaContent: a11y.screenSummary.playAreaStringProperty,
      controlAreaContent: a11y.screenSummary.controlAreaStringProperty,
      currentDetailsContent: new DerivedProperty(
        [model.viewProperty, moleculeDetails, a11y.shorelineDetailsStringProperty],
        (view, molecules, shoreline) => (view === "molecules" ? molecules : shoreline),
      ),
      interactionHintContent: a11y.screenSummary.interactionHintStringProperty,
    });
  }
}
