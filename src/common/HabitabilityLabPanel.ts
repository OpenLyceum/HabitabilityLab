/**
 * HabitabilityLabPanel.ts
 *
 * A pre-themed Panel that automatically uses HabitabilityLabColors for background and
 * border. Use this for all control panels and info boxes in the sim so that
 * default / projector mode switching is handled automatically.
 *
 * ── Basic usage ───────────────────────────────────────────────────────────────
 *
 *   import { HabitabilityLabPanel } from "../../common/HabitabilityLabPanel.js";
 *   import { VBox, Text } from "scenerystack/scenery";
 *
 *   const content = new VBox({
 *     children: [ new Text("label"), slider ],
 *     spacing: 8,
 *   });
 *   const panel = new HabitabilityLabPanel(content);
 *
 * ── Overriding defaults ───────────────────────────────────────────────────────
 *
 *   // Wider margins, sharper corners, custom stroke
 *   const panel = new HabitabilityLabPanel(content, { xMargin: 20, cornerRadius: 0 });
 *
 *   // Transparent background (decorative border only)
 *   const panel = new HabitabilityLabPanel(content, { fill: "transparent" });
 */

import { type EmptySelfOptions, optionize } from "scenerystack/phet-core";
import type { Node } from "scenerystack/scenery";
import { Panel, type PanelOptions } from "scenerystack/sun";
import HabitabilityLabColors from "../HabitabilityLabColors.js";
import { PANEL_CORNER_RADIUS } from "../HabitabilityLabConstants.js";

export type HabitabilityLabPanelOptions = PanelOptions;

export class HabitabilityLabPanel extends Panel {
  public constructor(content: Node, providedOptions?: HabitabilityLabPanelOptions) {
    const options = optionize<HabitabilityLabPanelOptions, EmptySelfOptions, PanelOptions>()(
      {
        fill: HabitabilityLabColors.panelBackgroundColorProperty,
        stroke: HabitabilityLabColors.panelBorderColorProperty,
        cornerRadius: PANEL_CORNER_RADIUS,
        xMargin: 12,
        yMargin: 10,
      },
      providedOptions,
    );
    super(content, options);
  }
}
