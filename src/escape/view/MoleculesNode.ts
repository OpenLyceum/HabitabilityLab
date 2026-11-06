/**
 * MoleculesNode.ts
 *
 * Molecules rising from a body's surface. Height is drawn on a stretched
 * (logarithmic) scale scaled to the gas's typical hop, so ordinary molecules
 * rise a visible height while the escaping ones still fly off the top; ticks on
 * the right give the true height in body radii. Molecules that will escape are
 * red, and a counter keeps score.
 */

import { Multilink } from "scenerystack/axon";
import { Shape } from "scenerystack/kite";
import { Circle, LinearGradient, Node, Path, Rectangle, Text } from "scenerystack/scenery";
import { formatSignificant } from "../../common/view/chartUtils.js";
import HabitabilityLabColors from "../../HabitabilityLabColors.js";
import { FONTS } from "../../HabitabilityLabConstants.js";
import { StringManager } from "../../i18n/StringManager.js";
import { type EscapeModel, TOP_RADIUS } from "../model/EscapeModel.js";

const GROUND_HEIGHT = 30;
const TOP_MARGIN = 26;
const MOLECULE_RADIUS = 2.6;

/** Heights (body radii above the surface) marked on the right. */
const HEIGHT_TICKS = [0.0001, 0.001, 0.01, 0.1, 1, 2] as const;

export class MoleculesNode extends Node {
  public constructor(model: EscapeModel, width: number, height: number) {
    super();
    const strings = StringManager.getInstance().getEscapeStrings();

    const sky = new Rectangle(0, 0, width, height, {
      fill: new LinearGradient(0, 0, 0, height)
        .addColorStop(0, HabitabilityLabColors.spaceColorProperty)
        .addColorStop(1, HabitabilityLabColors.lowSkyColorProperty),
      stroke: HabitabilityLabColors.spaceBorderColorProperty,
      cornerRadius: 4,
    });
    const groundTop = height - GROUND_HEIGHT;
    const ground = new Rectangle(1, groundTop, width - 2, GROUND_HEIGHT - 1, {
      fill: HabitabilityLabColors.surfaceColorProperty,
    });
    const top = TOP_MARGIN;

    /** Scale height of the stretched axis, body radii: a twentieth of a typical hop. */
    const scaleHeight = (): number =>
      0.05 * (model.mostProbableSpeedProperty.value / model.escapeSpeedProperty.value) ** 2;
    const yOf = (r: number): number => {
      const hs = scaleHeight();
      const f = Math.log(1 + Math.max(0, r - 1) / hs) / Math.log(1 + (TOP_RADIUS - 1) / hs);
      return groundTop - f * (groundTop - top);
    };

    const ticks = new Node();
    const updateTicks = (): void => {
      for (const child of ticks.children) {
        child.dispose();
      }
      const children: Node[] = [];
      for (const h of HEIGHT_TICKS) {
        const y = yOf(1 + h);
        if (y < top - 1 || groundTop - y < 14) {
          continue;
        }
        children.push(
          new Path(new Shape().moveTo(width - 8, y).lineTo(width, y), {
            stroke: HabitabilityLabColors.spaceTextColorProperty,
          }),
          new Text(`${formatSignificant(h, 1)} R`, {
            font: FONTS.SMALL,
            fill: HabitabilityLabColors.spaceTextColorProperty,
            right: width - 10,
            centerY: y,
          }),
        );
      }
      ticks.children = children;
    };

    const dots = model.molecules.map(() => new Circle(MOLECULE_RADIUS, { pickable: false }));
    const dotLayer = new Node({ children: dots });
    const moveDots = (): void => {
      model.molecules.forEach((molecule, i) => {
        const dot = dots[i];
        if (dot) {
          dot.x = 6 + molecule.x * (width - 60);
          dot.y = yOf(molecule.r) - MOLECULE_RADIUS;
          dot.fill = molecule.escaping
            ? HabitabilityLabColors.escapingColorProperty
            : HabitabilityLabColors.moleculeColorProperty;
        }
      });
    };
    model.moleculesMovedEmitter.addListener(moveDots);
    Multilink.multilink([model.mostProbableSpeedProperty, model.escapeSpeedProperty], () => {
      updateTicks();
      moveDots();
    });

    const note = new Text(strings.altitudeNoteStringProperty, {
      font: FONTS.SMALL,
      fill: HabitabilityLabColors.spaceTextColorProperty,
      maxWidth: width - 16,
      left: 8,
      top: 6,
    });
    const escapedText = new Text("", { font: FONTS.LABEL, fill: HabitabilityLabColors.escapingColorProperty });
    Multilink.multilink([model.escapedCountProperty, strings.escapedPatternStringProperty], (count, pattern) => {
      escapedText.string = pattern.replace("{{count}}", String(count));
      escapedText.left = 8;
      escapedText.centerY = groundTop + GROUND_HEIGHT / 2;
    });

    this.children = [sky, ground, ticks, dotLayer, note, escapedText];
    this.clipArea = Shape.rect(0, 0, width, height);
  }
}
