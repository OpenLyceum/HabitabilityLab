import { HABITABILITY_LAB_PREFERENCES_NODE_SETTINGS } from "../HabitabilityLabConstants.js";
/**
 * HabitabilityLabPreferencesNode.ts
 *
 * Custom preferences UI shown in Preferences → Simulation. Controls are bound
 * to HabitabilityLabPreferencesModel Properties (whose initial values come from
 * habitabilityLabQueryParameters).
 */

import { Text, VBox } from "scenerystack/scenery";
import { PhetFont } from "scenerystack/scenery-phet";
import { Checkbox } from "scenerystack/sun";
import type { Tandem } from "scenerystack/tandem";
import HabitabilityLabColors from "../HabitabilityLabColors.js";
import HabitabilityLabNamespace from "../HabitabilityLabNamespace.js";
import { StringManager } from "../i18n/StringManager.js";
import type { HabitabilityLabPreferencesModel } from "./HabitabilityLabPreferencesModel.js";

export class HabitabilityLabPreferencesNode extends VBox {
  public constructor(preferencesModel: HabitabilityLabPreferencesModel, tandem?: Tandem) {
    const prefStrings = StringManager.getInstance().getPreferences();

    // The Preferences dialog is always white, so use the dark "light control surface"
    // colors (readable on white in both default and projector profiles), not textColorProperty
    // (which is near-white in default mode and would be invisible on the white dialog).
    const header = new Text(prefStrings.titleStringProperty, {
      font: new PhetFont({ size: HABITABILITY_LAB_PREFERENCES_NODE_SETTINGS.HEADER_FONT_SIZE, weight: "bold" }),
      fill: HabitabilityLabColors.controlSurfaceTextColorProperty,
    });

    const showEquationsCheckbox = new Checkbox(
      preferencesModel.showEquationsProperty,
      new Text(prefStrings.showEquationsStringProperty, {
        font: new PhetFont(HABITABILITY_LAB_PREFERENCES_NODE_SETTINGS.SHOW_EQUATIONS_CHECKBOX_FONT_SIZE),
        fill: HabitabilityLabColors.controlSurfaceTextColorProperty,
      }),
      {
        checkboxColor: HabitabilityLabColors.controlSurfaceTextColorProperty,
        checkboxColorBackground: HabitabilityLabColors.controlSurfaceColorProperty,
        spacing: HABITABILITY_LAB_PREFERENCES_NODE_SETTINGS.SHOW_EQUATIONS_CHECKBOX_SPACING,
        accessibleHelpText: prefStrings.showEquationsHelpStringProperty,
        ...(tandem && { tandem: tandem.createTandem("showEquationsCheckbox") }),
      },
    );

    const description = new Text(prefStrings.showEquationsHelpStringProperty, {
      font: new PhetFont(HABITABILITY_LAB_PREFERENCES_NODE_SETTINGS.DESCRIPTION_FONT_SIZE),
      fill: HabitabilityLabColors.controlSurfaceTextColorProperty,
      maxWidth: HABITABILITY_LAB_PREFERENCES_NODE_SETTINGS.DESCRIPTION_MAX_WIDTH,
    });

    super({
      align: "left",
      spacing: HABITABILITY_LAB_PREFERENCES_NODE_SETTINGS.SPACING,
      children: [header, showEquationsCheckbox, description],
    });
  }
}

HabitabilityLabNamespace.register("HabitabilityLabPreferencesNode", HabitabilityLabPreferencesNode);
