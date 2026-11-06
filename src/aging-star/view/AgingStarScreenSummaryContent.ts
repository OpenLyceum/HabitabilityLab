/**
 * AgingStarScreenSummaryContent.ts
 *
 * The accessible screen summary for the Aging Star screen. Its current-details
 * paragraph stays live: the age, the star's stage and luminosity, and the
 * planet's distance and zone status.
 */

import { DerivedProperty, PatternStringProperty } from "scenerystack/axon";
import { ScreenSummaryContent } from "scenerystack/sim";
import { formatSignificant, toPlainText } from "../../common/view/chartUtils.js";
import { formatAge, unitDependencies } from "../../common/view/formatters.js";
import { zoneStatusDependencies, zoneStatusStringProperty } from "../../common/view/zoneStatusView.js";
import { StringManager } from "../../i18n/StringManager.js";
import type { AgingStarModel } from "../model/AgingStarModel.js";

export class AgingStarScreenSummaryContent extends ScreenSummaryContent {
  public constructor(model: AgingStarModel) {
    const stringManager = StringManager.getInstance();
    const a11y = stringManager.getAgingStarA11yStrings();
    const strings = stringManager.getAgingStarStrings();
    const stageNames = strings.stage;
    const plain = (value: number, digits: number): string => toPlainText(formatSignificant(value, digits));

    super({
      playAreaContent: a11y.screenSummary.playAreaStringProperty,
      controlAreaContent: a11y.screenSummary.controlAreaStringProperty,
      currentDetailsContent: new PatternStringProperty(a11y.currentDetailsPatternStringProperty, {
        age: DerivedProperty.deriveAny([model.ageProperty, ...unitDependencies()], () =>
          toPlainText(formatAge(model.ageProperty.value)),
        ),
        stage: DerivedProperty.deriveAny(
          [model.stageProperty, ...Object.values(stageNames)],
          () => stageNames[`${model.stageProperty.value}StringProperty`].value,
        ),
        luminosity: new DerivedProperty([model.starProperty], (star) => plain(star.luminosity, 3)),
        distance: new DerivedProperty([model.planetDistanceProperty], (d) => plain(d, 3)),
        status: DerivedProperty.deriveAny(
          [model.statusProperty, model.engulfedProperty, strings.engulfedStringProperty, ...zoneStatusDependencies()],
          () =>
            model.engulfedProperty.value
              ? strings.engulfedStringProperty.value
              : zoneStatusStringProperty(model.statusProperty.value).value,
        ),
      }),
      interactionHintContent: a11y.screenSummary.interactionHintStringProperty,
    });
  }
}
