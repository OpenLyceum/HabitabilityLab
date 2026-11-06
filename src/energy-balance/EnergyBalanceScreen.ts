/**
 * EnergyBalanceScreen.ts
 *
 * The top-level Screen component. It wires together the model and view
 * factories and passes screen-level options (name, background color, tandem)
 * to the parent Screen class.
 *
 * Registered in the screens array in src/main.ts. Its home-screen and navigation-bar
 * icons come from createEnergyBalanceIcon() in src/common/HabitabilityLabScreenIcons.ts.
 */
import { type EmptySelfOptions, optionize } from "scenerystack/phet-core";
import type { ScreenOptions } from "scenerystack/sim";
import { Screen } from "scenerystack/sim";
import type { Tandem } from "scenerystack/tandem";
import { createEnergyBalanceIcon } from "../common/HabitabilityLabScreenIcons.js";
import HabitabilityLabColors from "../HabitabilityLabColors.js";
import { EnergyBalanceModel } from "./model/EnergyBalanceModel.js";
import { EnergyBalanceKeyboardHelpContent } from "./view/EnergyBalanceKeyboardHelpContent.js";
import { EnergyBalanceScreenView } from "./view/EnergyBalanceScreenView.js";

// Require tandem to be explicit — accidental omission would break PhET-iO.
type EnergyBalanceScreenOptions = ScreenOptions & { tandem: Tandem };

export class EnergyBalanceScreen extends Screen<EnergyBalanceModel, EnergyBalanceScreenView> {
  public constructor(options: EnergyBalanceScreenOptions) {
    super(
      // Model factory — called once when the screen is first shown
      () => new EnergyBalanceModel(),
      // View factory — receives the model instance
      (model) =>
        new EnergyBalanceScreenView(model, {
          tandem: options.tandem.createTandem("view"),
        }),
      optionize<EnergyBalanceScreenOptions, EmptySelfOptions, ScreenOptions>()(
        {
          backgroundColorProperty: HabitabilityLabColors.backgroundColorProperty,
          createKeyboardHelpNode: () => new EnergyBalanceKeyboardHelpContent(),
          homeScreenIcon: createEnergyBalanceIcon(),
          navigationBarIcon: createEnergyBalanceIcon(),
        },
        options,
      ),
    );
  }
}
