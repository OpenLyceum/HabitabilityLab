/**
 * GreenhouseScreen.ts
 *
 * The top-level Screen component. It wires together the model and view
 * factories and passes screen-level options (name, background color, tandem)
 * to the parent Screen class.
 *
 * Registered in the screens array in src/main.ts. Its home-screen and navigation-bar
 * icons come from createGreenhouseIcon() in src/common/HabitabilityLabScreenIcons.ts.
 */
import { type EmptySelfOptions, optionize } from "scenerystack/phet-core";
import type { ScreenOptions } from "scenerystack/sim";
import { Screen } from "scenerystack/sim";
import type { Tandem } from "scenerystack/tandem";
import { createGreenhouseIcon } from "../common/HabitabilityLabScreenIcons.js";
import HabitabilityLabColors from "../HabitabilityLabColors.js";
import { GreenhouseModel } from "./model/GreenhouseModel.js";
import { GreenhouseKeyboardHelpContent } from "./view/GreenhouseKeyboardHelpContent.js";
import { GreenhouseScreenView } from "./view/GreenhouseScreenView.js";

// Require tandem to be explicit — accidental omission would break PhET-iO.
type GreenhouseScreenOptions = ScreenOptions & { tandem: Tandem };

export class GreenhouseScreen extends Screen<GreenhouseModel, GreenhouseScreenView> {
  public constructor(options: GreenhouseScreenOptions) {
    super(
      // Model factory — called once when the screen is first shown
      () => new GreenhouseModel(),
      // View factory — receives the model instance
      (model) =>
        new GreenhouseScreenView(model, {
          tandem: options.tandem.createTandem("view"),
        }),
      optionize<GreenhouseScreenOptions, EmptySelfOptions, ScreenOptions>()(
        {
          backgroundColorProperty: HabitabilityLabColors.backgroundColorProperty,
          createKeyboardHelpNode: () => new GreenhouseKeyboardHelpContent(),
          homeScreenIcon: createGreenhouseIcon(),
          navigationBarIcon: createGreenhouseIcon(),
        },
        options,
      ),
    );
  }
}
