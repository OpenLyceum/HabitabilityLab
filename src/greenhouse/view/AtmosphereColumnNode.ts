/**
 * AtmosphereColumnNode.ts
 *
 * A cartoon column of atmosphere over the ground. Sunlight comes down through
 * it; the ground sends infrared up; the atmosphere, darker as τ grows, sends
 * part of it back down, and the infrared that reaches space balances the
 * sunlight. Arrow widths follow the fluxes on the same scale as the Energy
 * Balance screen, so the surface arrow visibly outgrows the one to space.
 */

import { Multilink, type TReadOnlyProperty } from "scenerystack/axon";
import { Color, LinearGradient, Node, Path, Rectangle, RichText } from "scenerystack/scenery";
import { arrow, arrowWidthForFlux } from "../../common/view/fluxArrows.js";
import { formatFlux, unitDependencies } from "../../common/view/formatters.js";
import HabitabilityLabColors from "../../HabitabilityLabColors.js";
import { FONTS } from "../../HabitabilityLabConstants.js";
import { StringManager } from "../../i18n/StringManager.js";
import type { GreenhouseModel } from "../model/GreenhouseModel.js";

const GROUND_HEIGHT = 56;
const SPACE_HEIGHT = 70;

/** Opacity of the drawn atmosphere for an optical depth τ (saturates for Venus-like τ). */
const atmosphereOpacity = (tau: number): number => Math.min(0.92, 0.08 + 0.3 * Math.log10(1 + 10 * tau));

export class AtmosphereColumnNode extends Node {
  public constructor(model: GreenhouseModel, width: number, height: number) {
    super();
    const strings = StringManager.getInstance().getGreenhouseStrings();

    const space = new Rectangle(0, 0, width, height, {
      fill: HabitabilityLabColors.spaceColorProperty,
      stroke: HabitabilityLabColors.spaceBorderColorProperty,
      cornerRadius: 4,
    });
    const atmosphereTop = SPACE_HEIGHT;
    const groundTop = height - GROUND_HEIGHT;
    const atmosphere = new Rectangle(1, atmosphereTop, width - 2, groundTop - atmosphereTop);
    const ground = new Rectangle(1, groundTop, width - 2, GROUND_HEIGHT - 1, {
      fill: HabitabilityLabColors.surfaceColorProperty,
    });

    const sunArrow = new Path(null, { fill: HabitabilityLabColors.sunlightColorProperty });
    const upArrow = new Path(null, { fill: HabitabilityLabColors.infraredColorProperty });
    const backArrow = new Path(null, { fill: HabitabilityLabColors.infraredColorProperty, opacity: 0.7 });
    const spaceArrow = new Path(null, { fill: HabitabilityLabColors.infraredColorProperty });

    const labelWidth = width / 3 - 8;
    const label = (stringProperty: TReadOnlyProperty<string>): RichText =>
      new RichText(stringProperty, {
        font: FONTS.SMALL,
        fill: HabitabilityLabColors.spaceTextColorProperty,
        lineWrap: labelWidth,
        align: "center",
      });
    const sunLabel = label(strings.sunlightInStringProperty);
    const spaceLabel = label(strings.infraredOutStringProperty);
    const upLabel = label(strings.surfaceInfraredStringProperty);
    const backLabel = label(strings.backRadiationStringProperty);
    // Values are plain strings set below; never bind them to a StringProperty (setting .string on a
    // bound RichText writes through to the shared localized property).
    const valueLabel = (): RichText =>
      new RichText("", { font: FONTS.SMALL, fill: HabitabilityLabColors.spaceTextColorProperty, maxWidth: labelWidth });
    const sunValue = valueLabel();
    const spaceValue = valueLabel();
    const upValue = valueLabel();
    const backValue = valueLabel();

    // One third of the width per arrow, so the labels under them never collide.
    const xSun = width / 6;
    const xUp = width / 2;
    const xBack = (5 * width) / 6;

    Multilink.multilinkAny(
      [
        model.opticalDepthProperty,
        model.absorbedProperty,
        model.surfaceInfraredProperty,
        model.backRadiationProperty,
        ...unitDependencies(),
      ],
      () => {
        const tau = model.opticalDepthProperty.value;
        const opacity = atmosphereOpacity(tau);
        const base = new Color(HabitabilityLabColors.atmosphereColorProperty.value);
        atmosphere.fill = new LinearGradient(0, atmosphereTop, 0, groundTop)
          .addColorStop(0, base.withAlpha(opacity * 0.35))
          .addColorStop(1, base.withAlpha(opacity));

        const absorbed = model.absorbedProperty.value;
        const up = model.surfaceInfraredProperty.value;
        const back = model.backRadiationProperty.value;

        sunArrow.shape = arrow(xSun, 12, xSun, groundTop - 2, arrowWidthForFlux(absorbed));
        spaceArrow.shape = arrow(xUp, atmosphereTop + 10, xUp, 14, arrowWidthForFlux(absorbed));
        upArrow.shape = arrow(xUp, groundTop - 2, xUp, atmosphereTop + 30, arrowWidthForFlux(up));
        sunLabel.maxWidth = xUp - xSun - 30;
        spaceLabel.maxWidth = width - xUp - 22;
        backArrow.visible = back > 1;
        backArrow.shape = arrow(xBack, atmosphereTop + 30, xBack, groundTop - 2, arrowWidthForFlux(back));

        sunValue.string = formatFlux(absorbed);
        spaceValue.string = formatFlux(absorbed);
        upValue.string = formatFlux(up);
        backValue.string = formatFlux(back);
        backValue.visible = back > 1;
        backLabel.visible = back > 1;

        // Sunlight and infrared-to-space labels sit beside their arrows in space; the surface
        // labels sit in the ground band, centred under their arrows.
        sunLabel.left = xSun + 16;
        sunLabel.top = 8;
        sunValue.left = sunLabel.left;
        sunValue.top = sunLabel.bottom + 1;
        spaceLabel.left = xUp + 16;
        spaceLabel.top = 8;
        spaceValue.left = spaceLabel.left;
        spaceValue.top = spaceLabel.bottom + 1;
        const underArrow = (title: RichText, value: RichText, x: number): void => {
          title.centerX = x;
          title.top = groundTop + 4;
          value.centerX = x;
          value.top = title.bottom + 1;
        };
        underArrow(upLabel, upValue, xUp);
        underArrow(backLabel, backValue, xBack);
      },
    );

    this.children = [
      space,
      atmosphere,
      ground,
      sunArrow,
      upArrow,
      backArrow,
      spaceArrow,
      sunLabel,
      sunValue,
      spaceLabel,
      spaceValue,
      upLabel,
      upValue,
      backLabel,
      backValue,
    ];
  }
}
