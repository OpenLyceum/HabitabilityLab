/**
 * AgingStarScreen.ts
 *
 * The top-level Screen component. It wires together the model and view
 * factories and passes screen-level options (name, background color, tandem)
 * to the parent Screen class.
 *
 * Registered in the screens array in src/main.ts. Its home-screen and navigation-bar
 * icons come from createAgingStarIcon() in src/common/HabitabilityLabScreenIcons.ts
 * (see doc/multi-screen.md).
 */
import { type EmptySelfOptions, optionize } from "scenerystack/phet-core";
import type { ScreenOptions } from "scenerystack/sim";
import { Screen } from "scenerystack/sim";
import type { Tandem } from "scenerystack/tandem";
import { createAgingStarIcon } from "../common/HabitabilityLabScreenIcons.js";
import HabitabilityLabColors from "../HabitabilityLabColors.js";
import { AgingStarModel } from "./model/AgingStarModel.js";
import { AgingStarKeyboardHelpContent } from "./view/AgingStarKeyboardHelpContent.js";
import { AgingStarScreenView } from "./view/AgingStarScreenView.js";

// Require tandem to be explicit — accidental omission would break PhET-iO.
type AgingStarScreenOptions = ScreenOptions & { tandem: Tandem };

export class AgingStarScreen extends Screen<AgingStarModel, AgingStarScreenView> {
  public constructor(options: AgingStarScreenOptions) {
    super(
      // Model factory — called once when the screen is first shown
      () => new AgingStarModel(),
      // View factory — receives the model instance
      (model) =>
        new AgingStarScreenView(model, {
          tandem: options.tandem.createTandem("view"),
        }),
      optionize<AgingStarScreenOptions, EmptySelfOptions, ScreenOptions>()(
        {
          backgroundColorProperty: HabitabilityLabColors.backgroundColorProperty,
          createKeyboardHelpNode: () => new AgingStarKeyboardHelpContent(),
          homeScreenIcon: createAgingStarIcon(),
          navigationBarIcon: createAgingStarIcon(),
        },
        options,
      ),
    );
  }
}
