/**
 * ZoneEdgesKeyboardHelpContent.ts
 *
 * Keyboard-help dialog for the Zone Edges screen: the star list, radio buttons
 * and the archive checkbox on the left; the star-temperature slider on the right.
 */

import {
  BasicActionsKeyboardHelpSection,
  ComboBoxKeyboardHelpSection,
  SliderControlsKeyboardHelpSection,
  TwoColumnKeyboardHelpContent,
} from "scenerystack/scenery-phet";

export class ZoneEdgesKeyboardHelpContent extends TwoColumnKeyboardHelpContent {
  public constructor() {
    super(
      [new ComboBoxKeyboardHelpSection(), new BasicActionsKeyboardHelpSection({ withCheckboxContent: true })],
      [new SliderControlsKeyboardHelpSection()],
    );
  }
}
