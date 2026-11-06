/**
 * ZoneEdgesScreenSummaryContent.ts
 *
 * The accessible screen summary for the Zone Edges screen. Its current-details
 * paragraph stays live: the star's temperature, the conservative zone's extent,
 * and where the selected planet falls.
 */

import { DerivedProperty, PatternStringProperty } from "scenerystack/axon";
import { StringUtils } from "scenerystack/phetcommon";
import { ScreenSummaryContent } from "scenerystack/sim";
import { formatSignificant, toPlainText } from "../../common/view/chartUtils.js";
import { bodyNameProperty } from "../../common/view/formatters.js";
import { zoneStatusDependencies, zoneStatusStringProperty } from "../../common/view/zoneStatusView.js";
import { StringManager } from "../../i18n/StringManager.js";
import type { ZoneEdgesModel } from "../model/ZoneEdgesModel.js";

export class ZoneEdgesScreenSummaryContent extends ScreenSummaryContent {
  public constructor(model: ZoneEdgesModel) {
    const a11y = StringManager.getInstance().getZoneEdgesA11yStrings();
    const plain = (value: number, digits: number): string => toPlainText(formatSignificant(value, digits));

    super({
      playAreaContent: a11y.screenSummary.playAreaStringProperty,
      controlAreaContent: a11y.screenSummary.controlAreaStringProperty,
      currentDetailsContent: new PatternStringProperty(a11y.currentDetailsPatternStringProperty, {
        temperature: new DerivedProperty([model.starTemperatureProperty], (t) => String(Math.round(t))),
        inner: new DerivedProperty([model.distancesProperty], (d) => plain(d.runawayGreenhouse, 2)),
        outer: new DerivedProperty([model.distancesProperty], (d) => plain(d.maximumGreenhouse, 2)),
        planet: DerivedProperty.deriveAny(
          [
            model.selectedPlanetProperty,
            model.selectedStatusProperty,
            a11y.planetDetailsPatternStringProperty,
            ...zoneStatusDependencies(),
          ],
          () => {
            const planet = model.selectedPlanetProperty.value;
            const status = model.selectedStatusProperty.value;
            if (!(planet && status)) {
              return "";
            }
            return StringUtils.fillIn(a11y.planetDetailsPatternStringProperty.value, {
              name: planet.bodyKey ? bodyNameProperty(planet.bodyKey).value : planet.name,
              starlight: plain(planet.insolation, 3),
              status: zoneStatusStringProperty(status).value,
            });
          },
        ),
      }),
      interactionHintContent: a11y.screenSummary.interactionHintStringProperty,
    });
  }
}
