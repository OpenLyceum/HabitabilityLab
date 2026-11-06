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
      font: new PhetFont({ size: 18, weight: "bold" }),
      fill: HabitabilityLabColors.controlSurfaceTextColorProperty,
    });

    const showEquationsCheckbox = new Checkbox(
      preferencesModel.showEquationsProperty,
      new Text(prefStrings.showEquationsStringProperty, {
        font: new PhetFont(14),
        fill: HabitabilityLabColors.controlSurfaceTextColorProperty,
      }),
      {
        checkboxColor: HabitabilityLabColors.controlSurfaceTextColorProperty,
        checkboxColorBackground: HabitabilityLabColors.controlSurfaceColorProperty,
        spacing: 8,
        accessibleHelpText: prefStrings.showEquationsHelpStringProperty,
        ...(tandem && { tandem: tandem.createTandem("showEquationsCheckbox") }),
      },
    );

    const description = new Text(prefStrings.showEquationsHelpStringProperty, {
      font: new PhetFont(12),
      fill: HabitabilityLabColors.controlSurfaceTextColorProperty,
      maxWidth: 420,
    });

    super({
      align: "left",
      spacing: 12,
      children: [header, showEquationsCheckbox, description],
    });
  }
}

HabitabilityLabNamespace.register("HabitabilityLabPreferencesNode", HabitabilityLabPreferencesNode);
