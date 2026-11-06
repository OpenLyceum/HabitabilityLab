/**
 * EscapeScreen.ts
 *
 * The top-level Screen component. It wires together the model and view
 * factories and passes screen-level options (name, background color, tandem)
 * to the parent Screen class.
 *
 * Registered in the screens array in src/main.ts. Its home-screen and navigation-bar
 * icons come from createEscapeIcon() in src/common/HabitabilityLabScreenIcons.ts.
 */
import { type EmptySelfOptions, optionize } from "scenerystack/phet-core";
import type { ScreenOptions } from "scenerystack/sim";
import { Screen } from "scenerystack/sim";
import type { Tandem } from "scenerystack/tandem";
import { createEscapeIcon } from "../common/HabitabilityLabScreenIcons.js";
import HabitabilityLabColors from "../HabitabilityLabColors.js";
import { EscapeModel } from "./model/EscapeModel.js";
import { EscapeKeyboardHelpContent } from "./view/EscapeKeyboardHelpContent.js";
import { EscapeScreenView } from "./view/EscapeScreenView.js";

// Require tandem to be explicit — accidental omission would break PhET-iO.
type EscapeScreenOptions = ScreenOptions & { tandem: Tandem };

export class EscapeScreen extends Screen<EscapeModel, EscapeScreenView> {
  public constructor(options: EscapeScreenOptions) {
    super(
      // Model factory — called once when the screen is first shown
      () => new EscapeModel(),
      // View factory — receives the model instance
      (model) =>
        new EscapeScreenView(model, {
          tandem: options.tandem.createTandem("view"),
        }),
      optionize<EscapeScreenOptions, EmptySelfOptions, ScreenOptions>()(
        {
          backgroundColorProperty: HabitabilityLabColors.backgroundColorProperty,
          createKeyboardHelpNode: () => new EscapeKeyboardHelpContent(),
          homeScreenIcon: createEscapeIcon(),
          navigationBarIcon: createEscapeIcon(),
        },
        options,
      ),
    );
  }
}
