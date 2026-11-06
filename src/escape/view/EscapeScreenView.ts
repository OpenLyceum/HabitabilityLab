/**
 * EscapeScreenView.ts
 *
 * The Escape screen (doc/model.md §5), with two views:
 *  - Molecules: molecules rising from the surface (left), their speed
 *    distribution with the escape speed (middle), readouts and the verdict for
 *    every gas; body presets, gas, escape speed and temperature on the right.
 *  - Cosmic shoreline: escape speed against starlight for the Solar System and
 *    exoplanets, with the dividing line.
 */

import { DerivedProperty, PatternStringProperty, type TReadOnlyProperty } from "scenerystack/axon";
import { type EmptySelfOptions, optionize } from "scenerystack/phet-core";
import { HBox, Node, RichText, VBox } from "scenerystack/scenery";
import { ResetAllButton } from "scenerystack/scenery-phet";
import { ScreenView, type ScreenViewOptions } from "scenerystack/sim";
import { FLAT_RESET_ALL_BUTTON_OPTIONS } from "../../common/HabitabilityLabButtonOptions.js";
import { HabitabilityLabPanel } from "../../common/HabitabilityLabPanel.js";
import { formatSignificant } from "../../common/view/chartUtils.js";
import {
  createCheckbox,
  createEquationNode,
  createExplanationButton,
  createExplanationRow,
  createNumberControl,
  createRadioGroup,
  createReadout,
  createTitle,
} from "../../common/view/controls.js";
import {
  bodyNameProperty,
  formatPowerFraction,
  unitDependencies,
  valueWithUnits,
} from "../../common/view/formatters.js";
import HabitabilityLabColors from "../../HabitabilityLabColors.js";
import {
  CONTROL_PANEL_WIDTH,
  ESCAPE_SPEED_RANGE,
  FONTS,
  GAS_TEMPERATURE_RANGE,
  SCREEN_VIEW_MARGIN,
} from "../../HabitabilityLabConstants.js";
import { StringManager } from "../../i18n/StringManager.js";
import { ESCAPE_PRESETS, type EscapeModel, GASES } from "../model/EscapeModel.js";
import { EscapeScreenSummaryContent } from "./EscapeScreenSummaryContent.js";
import { MoleculesNode } from "./MoleculesNode.js";
import { ShorelineNode } from "./ShorelineNode.js";
import { SpeedDistributionNode } from "./SpeedDistributionNode.js";

export type EscapeScreenViewOptions = ScreenViewOptions;

const MOLECULES_WIDTH = 210;
const DISTRIBUTION_WIDTH = 360;
const DISTRIBUTION_HEIGHT = 200;
const READOUT_WIDTH = 420;

export class EscapeScreenView extends ScreenView {
  public constructor(model: EscapeModel, providedOptions?: EscapeScreenViewOptions) {
    const options = optionize<EscapeScreenViewOptions, EmptySelfOptions, ScreenViewOptions>()(
      {
        screenSummaryContent: new EscapeScreenSummaryContent(model),
      },
      providedOptions,
    );
    super(options);

    const stringManager = StringManager.getInstance();
    const strings = stringManager.getEscapeStrings();
    const units = stringManager.getUnits();
    const a11y = stringManager.getEscapeA11yStrings();
    const bounds = this.layoutBounds;
    const moleculesVisibleProperty = new DerivedProperty([model.viewProperty], (view) => view === "molecules");
    const shorelineVisibleProperty = new DerivedProperty([model.viewProperty], (view) => view === "shoreline");

    // ── Controls (right) ──────────────────────────────────────────────────────
    const viewRadios = createRadioGroup(
      model.viewProperty,
      [
        { value: "molecules" as const, labelProperty: strings.moleculesViewStringProperty },
        { value: "shoreline" as const, labelProperty: strings.shorelineViewStringProperty },
      ],
      a11y.controls.viewStringProperty,
    );
    const bodyRadios = createRadioGroup(
      model.presetProperty,
      ESCAPE_PRESETS.map((preset) => ({
        value: preset,
        labelProperty:
          preset === "custom" ? stringManager.getCommonStrings().customStringProperty : bodyNameProperty(preset),
      })),
      a11y.controls.bodyStringProperty,
    );
    const gasNames = strings.gases;
    const gasRadios = createRadioGroup(
      model.gasProperty,
      GASES.map((gas) => ({
        value: gas,
        labelProperty: strings.gasFormulas[`${gas}StringProperty`],
        accessibleNameProperty: gasNames[`${gas}StringProperty`],
      })),
      a11y.controls.gasStringProperty,
      80,
    );
    const escapeSpeedControl = createNumberControl(
      strings.escapeSpeedStringProperty,
      model.escapeSpeedProperty,
      ESCAPE_SPEED_RANGE,
      { logarithmic: true, unitsProperty: units.kmPerSecondStringProperty, significantFigures: 3 },
    );
    const temperatureControl = createNumberControl(
      strings.temperatureStringProperty,
      model.temperatureProperty,
      GAS_TEMPERATURE_RANGE,
      { logarithmic: true, unitsProperty: units.kelvinStringProperty, significantFigures: 3 },
    );
    const exoplanetsCheckbox = createCheckbox(model.showExoplanetsProperty, strings.showExoplanetsStringProperty);
    const shorelineNote = new RichText(strings.shorelineNoteStringProperty, {
      font: FONTS.SMALL,
      fill: HabitabilityLabColors.mutedTextColorProperty,
      lineWrap: CONTROL_PANEL_WIDTH,
    });
    const explanationButton = createExplanationButton(
      strings.explanationTitleStringProperty,
      [
        strings.explanation1StringProperty,
        strings.explanation2StringProperty,
        strings.explanation3StringProperty,
        strings.explanation4StringProperty,
      ],
      a11y.controls.explanationStringProperty,
    );

    // Bodies and gases side by side, so the panel fits above Reset All.
    const moleculeControls = new VBox({
      spacing: 6,
      align: "left",
      visibleProperty: moleculesVisibleProperty,
      children: [
        new HBox({
          spacing: 18,
          align: "top",
          children: [
            new VBox({
              spacing: 6,
              align: "left",
              children: [createTitle(strings.bodyStringProperty, 110), bodyRadios],
            }),
            new VBox({ spacing: 6, align: "left", children: [createTitle(strings.gasStringProperty, 90), gasRadios] }),
          ],
        }),
        escapeSpeedControl,
        temperatureControl,
        createEquationNode(strings.equationStringProperty, CONTROL_PANEL_WIDTH),
      ],
    });
    const shorelineControls = new VBox({
      spacing: 8,
      align: "left",
      visibleProperty: shorelineVisibleProperty,
      children: [
        exoplanetsCheckbox,
        shorelineNote,
        createEquationNode(strings.shorelineEquationStringProperty, CONTROL_PANEL_WIDTH),
      ],
    });
    const controlPanel = new HabitabilityLabPanel(
      new VBox({
        spacing: 8,
        align: "left",
        children: [
          createTitle(strings.viewStringProperty),
          viewRadios,
          moleculeControls,
          shorelineControls,
          createExplanationRow(explanationButton),
        ],
      }),
      { minWidth: CONTROL_PANEL_WIDTH + 24, maxWidth: CONTROL_PANEL_WIDTH + 24 },
    );
    controlPanel.right = bounds.maxX - SCREEN_VIEW_MARGIN;
    controlPanel.top = bounds.minY + SCREEN_VIEW_MARGIN;

    // ── Molecules view ────────────────────────────────────────────────────────
    const moleculesTitle = createTitle(strings.atmosphereTitleStringProperty, MOLECULES_WIDTH);
    const molecules = new MoleculesNode(model, MOLECULES_WIDTH, bounds.height - 2 * SCREEN_VIEW_MARGIN - 28);
    moleculesTitle.left = bounds.minX + SCREEN_VIEW_MARGIN;
    moleculesTitle.top = bounds.minY + SCREEN_VIEW_MARGIN;
    molecules.left = moleculesTitle.left;
    molecules.top = moleculesTitle.bottom + 8;

    const distributionTitle = createTitle(strings.distributionTitleStringProperty, DISTRIBUTION_WIDTH);
    const distribution = new SpeedDistributionNode(model, DISTRIBUTION_WIDTH, DISTRIBUTION_HEIGHT);
    distribution.left = molecules.right + 70;
    distribution.top = molecules.top;
    distributionTitle.left = distribution.left;
    distributionTitle.top = moleculesTitle.top;

    const dependencies = unitDependencies();
    const speed = (property: TReadOnlyProperty<number>): TReadOnlyProperty<string> =>
      DerivedProperty.deriveAny([property, units.kmPerSecondStringProperty, ...dependencies], () =>
        valueWithUnits(formatSignificant(property.value, 3), units.kmPerSecondStringProperty.value),
      );
    const gasFormulas = strings.gasFormulas;
    const gasList = (keep: boolean): TReadOnlyProperty<string> =>
      DerivedProperty.deriveAny(
        [model.retainedGasesProperty, strings.noneStringProperty, ...Object.values(gasFormulas)],
        () => {
          const list = GASES.filter((gas) => model.retainedGasesProperty.value.includes(gas) === keep).map(
            (gas) => gasFormulas[`${gas}StringProperty`].value,
          );
          return list.length > 0 ? list.join(", ") : strings.noneStringProperty.value;
        },
      );
    const verdictText = new RichText(
      new DerivedProperty(
        [model.retainedProperty, strings.retainedStringProperty, strings.lostStringProperty],
        (retained, kept, lost) => (retained ? kept : lost),
      ),
      { font: FONTS.TITLE, maxWidth: READOUT_WIDTH },
    );
    model.retainedProperty.link((retained) => {
      verdictText.fill = retained
        ? HabitabilityLabColors.habitableColorProperty
        : HabitabilityLabColors.escapingColorProperty;
    });
    const readouts = new HabitabilityLabPanel(
      new VBox({
        spacing: 4,
        align: "left",
        children: [
          createReadout(
            new PatternStringProperty(strings.rmsPatternStringProperty, { value: speed(model.rmsSpeedProperty) }),
            READOUT_WIDTH,
          ),
          createReadout(
            new PatternStringProperty(strings.ratioPatternStringProperty, {
              value: DerivedProperty.deriveAny([model.escapeSpeedProperty, model.rmsSpeedProperty], () =>
                formatSignificant(model.escapeSpeedProperty.value / model.rmsSpeedProperty.value, 3),
              ),
            }),
            READOUT_WIDTH,
          ),
          createReadout(
            new PatternStringProperty(strings.jeansPatternStringProperty, {
              value: new DerivedProperty([model.jeansParameterProperty], (lambda) => formatSignificant(lambda, 3)),
            }),
            READOUT_WIDTH,
          ),
          createReadout(
            new PatternStringProperty(strings.fractionPatternStringProperty, {
              value: new DerivedProperty([model.log10EscapingFractionProperty], (log) => formatPowerFraction(log)),
            }),
            READOUT_WIDTH,
          ),
          verdictText,
          createReadout(
            new PatternStringProperty(strings.keptPatternStringProperty, { gases: gasList(true) }),
            READOUT_WIDTH,
          ),
          createReadout(
            new PatternStringProperty(strings.lostPatternStringProperty, { gases: gasList(false) }),
            READOUT_WIDTH,
          ),
        ],
      }),
      { minWidth: READOUT_WIDTH + 24, maxWidth: READOUT_WIDTH + 24 },
    );
    readouts.left = distribution.left - 50;
    readouts.top = distribution.bottom + 50;

    const moleculesView = new Node({
      visibleProperty: moleculesVisibleProperty,
      children: [moleculesTitle, molecules, distributionTitle, distribution, readouts],
    });

    // ── Shoreline view ────────────────────────────────────────────────────────
    const shorelineTitle = createTitle(strings.shorelineTitleStringProperty, 400);
    const shorelineLeft = bounds.minX + SCREEN_VIEW_MARGIN + 66;
    const shoreline = new ShorelineNode(
      model,
      controlPanel.left - 24 - shorelineLeft,
      bounds.height - 2 * SCREEN_VIEW_MARGIN - 80,
    );
    shorelineTitle.left = shorelineLeft;
    shorelineTitle.top = bounds.minY + SCREEN_VIEW_MARGIN;
    shoreline.left = shorelineLeft;
    shoreline.top = shorelineTitle.bottom + 10;
    const shorelineView = new Node({
      visibleProperty: shorelineVisibleProperty,
      children: [shorelineTitle, shoreline],
    });

    const resetAllButton = new ResetAllButton({
      ...FLAT_RESET_ALL_BUTTON_OPTIONS,
      listener: () => {
        this.interruptSubtreeInput();
        model.reset();
      },
      right: bounds.maxX - SCREEN_VIEW_MARGIN,
      bottom: bounds.maxY - SCREEN_VIEW_MARGIN,
    });

    this.children = [moleculesView, shorelineView, controlPanel, resetAllButton];
    this.addChild(
      new Node({
        pdomOrder: [
          viewRadios,
          bodyRadios,
          gasRadios,
          escapeSpeedControl,
          temperatureControl,
          exoplanetsCheckbox,
          explanationButton,
          resetAllButton,
        ],
      }),
    );
  }
}
