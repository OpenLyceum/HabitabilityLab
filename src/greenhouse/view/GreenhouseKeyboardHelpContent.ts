/**
 * GreenhouseKeyboardHelpContent.ts
 *
 * Keyboard-help dialog for the Greenhouse screen: radio buttons and buttons on
 * the left, the four sliders on the right.
 */

import {
  BasicActionsKeyboardHelpSection,
  SliderControlsKeyboardHelpSection,
  TwoColumnKeyboardHelpContent,
} from "scenerystack/scenery-phet";

export class GreenhouseKeyboardHelpContent extends TwoColumnKeyboardHelpContent {
  public constructor() {
    super([new BasicActionsKeyboardHelpSection()], [new SliderControlsKeyboardHelpSection()]);
  }
}
