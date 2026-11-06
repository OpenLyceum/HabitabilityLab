/**
 * EnergyBalanceKeyboardHelpContent.ts
 *
 * Keyboard-help dialog for the Energy Balance screen: moving the planet, radio
 * buttons and the jump button on the left; the sliders and time controls on
 * the right.
 */

import {
  BasicActionsKeyboardHelpSection,
  KeyboardHelpIconFactory,
  KeyboardHelpSection,
  KeyboardHelpSectionRow,
  SliderControlsKeyboardHelpSection,
  TimeControlsKeyboardHelpSection,
  TwoColumnKeyboardHelpContent,
} from "scenerystack/scenery-phet";
import { StringManager } from "../../i18n/StringManager.js";

export class EnergyBalanceKeyboardHelpContent extends TwoColumnKeyboardHelpContent {
  public constructor() {
    const help = StringManager.getInstance().getCommonStrings().keyboardHelp;
    const planetSection = new KeyboardHelpSection(help.planetHeadingStringProperty, [
      KeyboardHelpSectionRow.labelWithIcon(
        help.movePlanetStringProperty,
        KeyboardHelpIconFactory.leftRightArrowKeysRowIcon(),
      ),
      KeyboardHelpSectionRow.labelWithIcon(
        help.movePlanetFineStringProperty,
        KeyboardHelpIconFactory.shiftPlusIcon(KeyboardHelpIconFactory.leftRightArrowKeysRowIcon()),
      ),
    ]);
    super(
      [planetSection, new BasicActionsKeyboardHelpSection()],
      [new SliderControlsKeyboardHelpSection(), new TimeControlsKeyboardHelpSection()],
    );
  }
}
