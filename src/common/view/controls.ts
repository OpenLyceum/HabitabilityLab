import { CONTROLS_SETTINGS } from "../../HabitabilityLabConstants.js";
/**
 * controls.ts
 *
 * Factories for the themed controls every screen uses:
 *  - {@link createNumberControl}: a NumberControl with a units suffix, a
 *    significant-figure readout, and an optional logarithmic slider (masses and
 *    distances span several decades). Adapted from TransitHunter.
 *  - {@link createCheckbox}: a themed checkbox with a text label.
 *  - {@link createExplanationButton}: an info button opening a dialog of short
 *    explanatory paragraphs.
 *  - {@link createEquationNode}: rich text shown only when the "Show equations"
 *    preference is on.
 *  - {@link createPushButton}: a flat white push button with a text label.
 */

import {
  DerivedProperty,
  NumberProperty,
  type PhetioProperty,
  type Property,
  type TReadOnlyProperty,
} from "scenerystack/axon";
import { Range } from "scenerystack/dot";
import { combineOptions } from "scenerystack/phet-core";
import { StringUtils } from "scenerystack/phetcommon";
import { HBox, type Node, RichText, Text, VBox } from "scenerystack/scenery";
import { InfoButton, NumberControl, type NumberControlOptions, PhetFont } from "scenerystack/scenery-phet";
import { Dialog } from "scenerystack/sim";
import { AquaRadioButtonGroup, Checkbox, type CheckboxOptions, TextPushButton } from "scenerystack/sun";
import HabitabilityLabColors from "../../HabitabilityLabColors.js";
import { FONTS } from "../../HabitabilityLabConstants.js";
import { StringManager } from "../../i18n/StringManager.js";
import { FLAT_PANEL_PUSH_BUTTON_OPTIONS, LIGHT_SURFACE_TEXT_FILL } from "../HabitabilityLabButtonOptions.js";
import {
  HABITABILITY_LAB_CHECKBOX_OPTIONS,
  HABITABILITY_LAB_NUMBER_CONTROL_OPTIONS,
} from "../HabitabilityLabControlOptions.js";
import { formatSignificant } from "./chartUtils.js";

export type CreateNumberControlOptions = {
  /** Localized unit symbol appended after the value (rich text, e.g. M<sub>J</sub>). */
  unitsProperty?: TReadOnlyProperty<string>;
  /** Significant figures of the readout (default 3). */
  significantFigures?: number;
  /** Arrow-button step; in decades on a logarithmic control (default 1/100 of the range, or 0.02 decade). */
  delta?: number;
  /** Move the slider on a log₁₀ scale. */
  logarithmic?: boolean;
  /** Accessible name; defaults to the visible title. */
  accessibleName?: TReadOnlyProperty<string>;
  /** Write the units straight after the value, with no pattern (for "°"). */
  compactUnits?: boolean;
  /**
   * The part of the range the slider may reach now (in the property's units, also for a
   * logarithmic control), e.g. planet sizes allowed around the selected star.
   */
  enabledRangeProperty?: TReadOnlyProperty<Range>;
  /** Extra NumberControl options merged last. */
  numberControlOptions?: NumberControlOptions;
};

const DIALOG_TITLE_FONT = new PhetFont({ size: CONTROLS_SETTINGS.DIALOG_TITLE_FONT_SIZE, weight: "bold" });

/** Rounds a value to `significantFigures`. */
const roundToFigures = (value: number, significantFigures: number): number =>
  value === 0 ? 0 : Number(value.toPrecision(significantFigures));

/**
 * A log₁₀ proxyProperty of `property` for a logarithmic slider, kept in step both ways.
 * A value the proxyProperty sets is rounded to the readout's figures and kept in range.
 */
function createLogarithmicProxy(property: PhetioProperty<number>, range: Range, figures: number): NumberProperty {
  const proxyProperty = new NumberProperty(Math.log10(property.value), {
    range: new Range(Math.log10(range.min), Math.log10(range.max)),
  });
  let updating = false;
  proxyProperty.lazyLink((log) => {
    if (!updating) {
      updating = true;
      property.value = range.constrainValue(roundToFigures(10 ** log, figures));
      updating = false;
    }
  });
  property.lazyLink((value) => {
    if (!updating) {
      updating = true;
      proxyProperty.value = proxyProperty.range.constrainValue(Math.log10(value));
      updating = false;
    }
  });
  return proxyProperty;
}

export function createNumberControl(
  titleProperty: TReadOnlyProperty<string>,
  numberProperty: PhetioProperty<number>,
  range: Range,
  options: CreateNumberControlOptions = {},
): NumberControl {
  const figures = options.significantFigures ?? 3;
  const logarithmic = options.logarithmic ?? false;
  const units = StringManager.getInstance().getUnits();

  const controlledProperty = logarithmic ? createLogarithmicProxy(numberProperty, range, figures) : numberProperty;
  const controlledRange = logarithmic ? new Range(Math.log10(range.min), Math.log10(range.max)) : range;
  const delta = options.delta ?? (logarithmic ? 0.02 : (range.max - range.min) / 100);
  const toValue = (controlled: number): number => (logarithmic ? range.constrainValue(10 ** controlled) : controlled);

  const enabledRangeProperty = options.enabledRangeProperty;
  const controlledEnabledRangeProperty =
    enabledRangeProperty && logarithmic
      ? new DerivedProperty(
          [enabledRangeProperty],
          (enabled) => new Range(Math.log10(enabled.min), Math.log10(enabled.max)),
        )
      : enabledRangeProperty;

  const unitsProperty = options.unitsProperty;
  const format = (controlled: number): string => {
    const text = formatSignificant(roundToFigures(toValue(controlled), figures), figures);
    if (!unitsProperty) {
      return text;
    }
    return options.compactUnits
      ? `${text}${unitsProperty.value}`
      : StringUtils.fillIn(units.valueUnitsPatternStringProperty.value, { value: text, units: unitsProperty.value });
  };

  return new NumberControl(
    titleProperty,
    controlledProperty,
    controlledRange,
    combineOptions<NumberControlOptions>(
      {},
      HABITABILITY_LAB_NUMBER_CONTROL_OPTIONS,
      {
        delta,
        ...(controlledEnabledRangeProperty ? { enabledRangeProperty: controlledEnabledRangeProperty } : {}),
        accessibleName: options.accessibleName ?? titleProperty,
        titleNodeOptions: {
          fill: HabitabilityLabColors.textColorProperty,
          font: FONTS.LABEL,
          maxWidth: CONTROLS_SETTINGS.CREATE_NUMBER_CONTROL_MAX_WIDTH,
        },
        numberDisplayOptions: {
          useRichText: true,
          textOptions: {
            fill: HabitabilityLabColors.controlSurfaceTextColorProperty,
            font: FONTS.LABEL,
            maxWidth: CONTROLS_SETTINGS.CREATE_NUMBER_CONTROL_MAX_WIDTH_VARIANT_2,
          },
          backgroundFill: HabitabilityLabColors.controlSurfaceColorProperty,
          numberFormatter: format,
          numberFormatterDependencies: unitsProperty
            ? [unitsProperty, units.valueUnitsPatternStringProperty]
            : [units.valueUnitsPatternStringProperty],
          maxWidth: CONTROLS_SETTINGS.CREATE_NUMBER_CONTROL_MAX_WIDTH_VARIANT_3,
          minBackgroundWidth: 100,
        },
      },
      options.numberControlOptions,
    ),
  );
}

/** A themed checkbox with a text label. */
export function createCheckbox(
  property: Property<boolean>,
  labelProperty: TReadOnlyProperty<string>,
  options?: CheckboxOptions,
): Checkbox {
  return new Checkbox(
    property,
    new RichText(labelProperty, {
      font: FONTS.LABEL,
      fill: HabitabilityLabColors.textColorProperty,
      maxWidth: CONTROLS_SETTINGS.CREATE_CHECKBOX_MAX_WIDTH,
    }),
    combineOptions<CheckboxOptions>({ accessibleName: labelProperty }, HABITABILITY_LAB_CHECKBOX_OPTIONS, options),
  );
}

/**
 * An info button that opens a dialog with a title and short paragraphs (rich
 * text, so equations can use sub- and superscripts).
 */
export function createExplanationButton(
  titleProperty: TReadOnlyProperty<string>,
  paragraphProperties: readonly TReadOnlyProperty<string>[],
  accessibleNameProperty: TReadOnlyProperty<string>,
): InfoButton {
  let dialog: Dialog | null = null;
  const textFill = HabitabilityLabColors.controlSurfaceTextColorProperty;
  return new InfoButton({
    iconFill: HabitabilityLabColors.accentColorProperty,
    scale: CONTROLS_SETTINGS.CREATE_EXPLANATION_BUTTON_SCALE,
    accessibleName: accessibleNameProperty,
    listener: () => {
      if (!dialog) {
        const paragraphs = paragraphProperties.map(
          (paragraph) =>
            new RichText(paragraph, {
              font: FONTS.EXPLANATION,
              fill: textFill,
              lineWrap: CONTROLS_SETTINGS.PARAGRAPHS_LINE_WRAP,
              leading: 3,
            }),
        );
        dialog = new Dialog(
          new VBox({
            align: "left",
            spacing: CONTROLS_SETTINGS.CREATE_EXPLANATION_BUTTON_SPACING,
            children: paragraphs,
          }),
          {
            title: new Text(titleProperty, {
              font: DIALOG_TITLE_FONT,
              fill: textFill,
              maxWidth: CONTROLS_SETTINGS.CREATE_EXPLANATION_BUTTON_MAX_WIDTH,
            }),
            fill: HabitabilityLabColors.controlSurfaceColorProperty,
          },
        );
      }
      dialog.show();
    },
  });
}

/** Rich text visible only while the "Show equations" preference is on. */
export function createEquationNode(
  showEquationsProperty: TReadOnlyProperty<boolean>,
  equationProperty: TReadOnlyProperty<string>,
  maxWidth: number = CONTROLS_SETTINGS.DEFAULT_MAX_WIDTH,
): Node {
  return new RichText(equationProperty, {
    font: FONTS.READOUT,
    fill: HabitabilityLabColors.accentColorProperty,
    maxWidth: maxWidth,
    visibleProperty: showEquationsProperty,
  });
}

/** A flat white push button with a dark text label, for dark panels. */
export function createPushButton(
  labelProperty: TReadOnlyProperty<string>,
  listener: () => void,
  maxTextWidth: number = CONTROLS_SETTINGS.DEFAULT_MAX_TEXT_WIDTH,
  compact = false,
): TextPushButton {
  return new TextPushButton(labelProperty, {
    ...FLAT_PANEL_PUSH_BUTTON_OPTIONS,
    font: compact ? FONTS.SMALL : FONTS.LABEL,
    yMargin: compact ? 2 : CONTROLS_SETTINGS.CREATE_PUSH_BUTTON_Y_MARGIN,
    textFill: LIGHT_SURFACE_TEXT_FILL,
    maxTextWidth: maxTextWidth,
    listener: listener,
  });
}

/** One choice of a {@link createRadioGroup}. */
export type RadioChoice<T> = {
  readonly value: T;
  /** Localized label, or a plain string for proper names (planets). */
  readonly labelProperty: TReadOnlyProperty<string> | string;
  /** Accessible name when the visible label is abbreviated (default: the label). */
  readonly accessibleNameProperty?: TReadOnlyProperty<string>;
};

/** A vertical group of themed radio buttons with text labels. */
export function createRadioGroup<T>(
  property: Property<T>,
  choices: readonly RadioChoice<T>[],
  accessibleName: TReadOnlyProperty<string>,
  maxLabelWidth: number = CONTROLS_SETTINGS.DEFAULT_MAX_LABEL_WIDTH,
): AquaRadioButtonGroup<T> {
  return new AquaRadioButtonGroup(
    property,
    choices.map((choice) => ({
      value: choice.value,
      options: { accessibleName: choice.accessibleNameProperty ?? choice.labelProperty },
      createNode: () =>
        new RichText(choice.labelProperty, {
          font: FONTS.LABEL,
          fill: HabitabilityLabColors.textColorProperty,
          maxWidth: maxLabelWidth,
        }),
    })),
    {
      spacing: CONTROLS_SETTINGS.CREATE_RADIO_GROUP_SPACING,
      radioButtonOptions: {
        radius: CONTROLS_SETTINGS.CREATE_RADIO_GROUP_RADIUS,
        selectedColor: HabitabilityLabColors.accentColorProperty,
        deselectedColor: HabitabilityLabColors.panelBackgroundColorProperty,
        stroke: HabitabilityLabColors.textColorProperty,
      },
      accessibleName: accessibleName,
    },
  );
}

/** A bold panel title. */
export function createTitle(
  labelProperty: TReadOnlyProperty<string>,
  maxWidth: number = CONTROLS_SETTINGS.DEFAULT_MAX_WIDTH,
): Text {
  return new Text(labelProperty, {
    font: FONTS.TITLE,
    fill: HabitabilityLabColors.textColorProperty,
    maxWidth: maxWidth,
  });
}

/** A rich-text readout line on a dark panel. */
export function createReadout(
  stringProperty: TReadOnlyProperty<string>,
  maxWidth: number = CONTROLS_SETTINGS.DEFAULT_MAX_WIDTH,
): RichText {
  return new RichText(stringProperty, {
    font: FONTS.READOUT,
    fill: HabitabilityLabColors.textColorProperty,
    maxWidth: maxWidth,
  });
}

/** An explanation button with its "What's going on?" label beside it. */
export function createExplanationRow(button: InfoButton, maxWidth = 180): HBox {
  return new HBox({
    spacing: CONTROLS_SETTINGS.CREATE_EXPLANATION_ROW_SPACING,
    children: [
      button,
      new Text(StringManager.getInstance().getCommonStrings().explanationButtonStringProperty, {
        font: FONTS.LABEL,
        fill: HabitabilityLabColors.textColorProperty,
        maxWidth: maxWidth,
      }),
    ],
  });
}
