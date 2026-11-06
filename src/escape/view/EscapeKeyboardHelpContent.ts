/**
 * EscapeKeyboardHelpContent.ts
 *
 * Keyboard-help dialog for the Escape screen: radio buttons and the exoplanet
 * checkbox on the left; the escape-speed and temperature sliders on the right.
 */

import {
  BasicActionsKeyboardHelpSection,
  SliderControlsKeyboardHelpSection,
  TwoColumnKeyboardHelpContent,
} from "scenerystack/scenery-phet";

export class EscapeKeyboardHelpContent extends TwoColumnKeyboardHelpContent {
  public constructor() {
    super(
      [new BasicActionsKeyboardHelpSection({ withCheckboxContent: true })],
      [new SliderControlsKeyboardHelpSection()],
    );
  }
}
