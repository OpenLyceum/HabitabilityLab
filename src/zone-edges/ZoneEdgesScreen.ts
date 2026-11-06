/**
 * ZoneEdgesScreen.ts
 *
 * The top-level Screen component. It wires together the model and view
 * factories and passes screen-level options (name, background color, tandem)
 * to the parent Screen class.
 *
 * Registered in the screens array in src/main.ts. Its home-screen and navigation-bar
 * icons come from createZoneEdgesIcon() in src/common/HabitabilityLabScreenIcons.ts
 * (see doc/multi-screen.md).
 */
import { type EmptySelfOptions, optionize } from "scenerystack/phet-core";
import type { ScreenOptions } from "scenerystack/sim";
import { Screen } from "scenerystack/sim";
import type { Tandem } from "scenerystack/tandem";
import { createZoneEdgesIcon } from "../common/HabitabilityLabScreenIcons.js";
import HabitabilityLabColors from "../HabitabilityLabColors.js";
import { ZoneEdgesModel } from "./model/ZoneEdgesModel.js";
import { ZoneEdgesKeyboardHelpContent } from "./view/ZoneEdgesKeyboardHelpContent.js";
import { ZoneEdgesScreenView } from "./view/ZoneEdgesScreenView.js";

// Require tandem to be explicit — accidental omission would break PhET-iO.
type ZoneEdgesScreenOptions = ScreenOptions & { tandem: Tandem };

export class ZoneEdgesScreen extends Screen<ZoneEdgesModel, ZoneEdgesScreenView> {
  public constructor(options: ZoneEdgesScreenOptions) {
    super(
      // Model factory — called once when the screen is first shown
      () => new ZoneEdgesModel(),
      // View factory — receives the model instance
      (model) =>
        new ZoneEdgesScreenView(model, {
          tandem: options.tandem.createTandem("view"),
        }),
      optionize<ZoneEdgesScreenOptions, EmptySelfOptions, ScreenOptions>()(
        {
          backgroundColorProperty: HabitabilityLabColors.backgroundColorProperty,
          createKeyboardHelpNode: () => new ZoneEdgesKeyboardHelpContent(),
          homeScreenIcon: createZoneEdgesIcon(),
          navigationBarIcon: createZoneEdgesIcon(),
        },
        options,
      ),
    );
  }
}
