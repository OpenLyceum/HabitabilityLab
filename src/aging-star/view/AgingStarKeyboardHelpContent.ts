/**
 * AgingStarKeyboardHelpContent.ts
 *
 * Keyboard-help dialog for the Aging Star screen: the age cursor, the star-mass
 * list and basic actions on the left; the distance slider and time controls on
 * the right.
 */

import {
  BasicActionsKeyboardHelpSection,
  ComboBoxKeyboardHelpSection,
  KeyboardHelpIconFactory,
  KeyboardHelpSection,
  KeyboardHelpSectionRow,
  SliderControlsKeyboardHelpSection,
  TimeControlsKeyboardHelpSection,
  TwoColumnKeyboardHelpContent,
} from "scenerystack/scenery-phet";
import { StringManager } from "../../i18n/StringManager.js";

export class AgingStarKeyboardHelpContent extends TwoColumnKeyboardHelpContent {
  public constructor() {
    const help = StringManager.getInstance().getCommonStrings().keyboardHelp;
    const ageSection = new KeyboardHelpSection(help.ageHeadingStringProperty, [
      KeyboardHelpSectionRow.labelWithIcon(
        help.moveAgeStringProperty,
        KeyboardHelpIconFactory.leftRightArrowKeysRowIcon(),
      ),
      KeyboardHelpSectionRow.labelWithIcon(
        help.moveAgeFineStringProperty,
        KeyboardHelpIconFactory.shiftPlusIcon(KeyboardHelpIconFactory.leftRightArrowKeysRowIcon()),
      ),
    ]);
    super(
      [
        ageSection,
        new ComboBoxKeyboardHelpSection(),
        new BasicActionsKeyboardHelpSection({ withCheckboxContent: true }),
      ],
      [new SliderControlsKeyboardHelpSection(), new TimeControlsKeyboardHelpSection()],
    );
  }
}
