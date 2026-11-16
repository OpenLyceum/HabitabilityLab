import { GREENHOUSE_SCREEN_VIEW_SETTINGS } from "../../HabitabilityLabConstants.js";
/**
 * GreenhouseScreenView.ts
 *
 * The Greenhouse screen (doc/model.md §2):
 *  - left: a column of atmosphere with sunlight in, surface infrared up,
 *    infrared sent back down, and infrared out to space;
 *  - middle: the water phase diagram with the planet's surface as a dot, and
 *    the temperature readouts with the water verdict;
 *  - right: presets (Venus, Earth, Mars, early Mars), starlight, albedo,
 *    greenhouse strength τ and surface pressure, the equation and an explanation.
 */

import { DerivedProperty, PatternStringProperty } from "scenerystack/axon";
import { type EmptySelfOptions, optionize } from "scenerystack/phet-core";
import { Node, VBox } from "scenerystack/scenery";
import { ResetAllButton } from "scenerystack/scenery-phet";
import { ScreenView, type ScreenViewOptions } from "scenerystack/sim";
import { FLAT_RESET_ALL_BUTTON_OPTIONS } from "../../common/HabitabilityLabButtonOptions.js";
import { HabitabilityLabPanel } from "../../common/HabitabilityLabPanel.js";
import type { WaterPhase } from "../../common/model/water.js";
import {
  createEquationNode,
  createExplanationButton,
  createExplanationRow,
  createNumberControl,
  createRadioGroup,
  createReadout,
  createTitle,
} from "../../common/view/controls.js";
import { bodyNameProperty, formatKelvin, formatTemperature, unitDependencies } from "../../common/view/formatters.js";
import HabitabilityLabColors from "../../HabitabilityLabColors.js";
import {
  ALBEDO_RANGE,
  CONTROL_PANEL_WIDTH,
  FONTS,
  OPTICAL_DEPTH_RANGE,
  PRESSURE_RANGE,
  SCREEN_VIEW_MARGIN,
  STARLIGHT_RANGE,
} from "../../HabitabilityLabConstants.js";
import { StringManager } from "../../i18n/StringManager.js";
import { GREENHOUSE_PRESETS, type GreenhouseModel } from "../model/GreenhouseModel.js";
import { AtmosphereColumnNode } from "./AtmosphereColumnNode.js";
import { GreenhouseScreenSummaryContent } from "./GreenhouseScreenSummaryContent.js";
import { PhaseDiagramNode } from "./PhaseDiagramNode.js";

export type GreenhouseScreenViewOptions = ScreenViewOptions;

const COLUMN_WIDTH: number = GREENHOUSE_SCREEN_VIEW_SETTINGS.COLUMN_WIDTH;
const DIAGRAM_WIDTH: number = GREENHOUSE_SCREEN_VIEW_SETTINGS.DIAGRAM_WIDTH;
const DIAGRAM_HEIGHT: number = GREENHOUSE_SCREEN_VIEW_SETTINGS.DIAGRAM_HEIGHT;

/** The verdict colour for each phase. */
const phaseColor = (phase: WaterPhase) =>
  phase === "liquid"
    ? HabitabilityLabColors.habitableColorProperty
    : phase === "ice"
      ? HabitabilityLabColors.tooColdColorProperty
      : HabitabilityLabColors.tooHotColorProperty;

export class GreenhouseScreenView extends ScreenView {
  public constructor(model: GreenhouseModel, providedOptions?: GreenhouseScreenViewOptions) {
    const options = optionize<GreenhouseScreenViewOptions, EmptySelfOptions, ScreenViewOptions>()(
      {
        screenSummaryContent: new GreenhouseScreenSummaryContent(model),
      },
      providedOptions,
    );
    super(options);

    const stringManager = StringManager.getInstance();
    const strings = stringManager.getGreenhouseStrings();
    const common = stringManager.getCommonStrings();
    const units = stringManager.getUnits();
    const a11y = stringManager.getGreenhouseA11yStrings();
    const bounds = this.layoutBounds;

    // ── Controls (right) ──────────────────────────────────────────────────────
    const presetRadios = createRadioGroup(
      model.presetProperty,
      GREENHOUSE_PRESETS.map((preset) => ({
        value: preset,
        labelProperty:
          preset === "custom"
            ? common.customStringProperty
            : preset === "earlyMars"
              ? strings.earlyMarsStringProperty
              : bodyNameProperty(preset),
      })),
      a11y.controls.planetStringProperty,
    );
    const starlightControl = createNumberControl(
      strings.starlightStringProperty,
      model.starlightProperty,
      STARLIGHT_RANGE,
      {
        logarithmic: true,
        unitsProperty: units.earthFluxStringProperty,
        significantFigures: GREENHOUSE_SCREEN_VIEW_SETTINGS.STARLIGHT_CONTROL_SIGNIFICANT_FIGURES,
      },
    );
    const albedoControl = createNumberControl(strings.albedoStringProperty, model.albedoProperty, ALBEDO_RANGE, {
      significantFigures: GREENHOUSE_SCREEN_VIEW_SETTINGS.ALBEDO_CONTROL_SIGNIFICANT_FIGURES,
      delta: GREENHOUSE_SCREEN_VIEW_SETTINGS.ALBEDO_CONTROL_DELTA,
    });
    const opticalDepthControl = createNumberControl(
      strings.opticalDepthStringProperty,
      model.opticalDepthProperty,
      OPTICAL_DEPTH_RANGE,
      {
        logarithmic: true,
        significantFigures: GREENHOUSE_SCREEN_VIEW_SETTINGS.OPTICAL_DEPTH_CONTROL_SIGNIFICANT_FIGURES,
      },
    );
    const pressureControl = createNumberControl(
      strings.pressureStringProperty,
      model.pressureProperty,
      PRESSURE_RANGE,
      {
        logarithmic: true,
        unitsProperty: units.barStringProperty,
        significantFigures: GREENHOUSE_SCREEN_VIEW_SETTINGS.PRESSURE_CONTROL_SIGNIFICANT_FIGURES,
      },
    );
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
    const controlPanel = new HabitabilityLabPanel(
      new VBox({
        spacing: GREENHOUSE_SCREEN_VIEW_SETTINGS.CONTROL_PANEL_SPACING,
        align: "left",
        children: [
          createTitle(strings.planetStringProperty),
          presetRadios,
          starlightControl,
          albedoControl,
          opticalDepthControl,
          pressureControl,
          createEquationNode(strings.equationStringProperty, CONTROL_PANEL_WIDTH),
          createExplanationRow(explanationButton),
        ],
      }),
      {
        minWidth: CONTROL_PANEL_WIDTH + GREENHOUSE_SCREEN_VIEW_SETTINGS.CONTROL_PANEL_MIN_WIDTH_OFFSET,
        maxWidth: CONTROL_PANEL_WIDTH + GREENHOUSE_SCREEN_VIEW_SETTINGS.CONTROL_PANEL_MAX_WIDTH_OFFSET,
      },
    );
    controlPanel.right = bounds.maxX - SCREEN_VIEW_MARGIN;
    controlPanel.top = bounds.minY + SCREEN_VIEW_MARGIN;

    // ── Atmosphere column (left) ──────────────────────────────────────────────
    const columnTitle = createTitle(strings.columnTitleStringProperty, COLUMN_WIDTH);
    const column = new AtmosphereColumnNode(model, COLUMN_WIDTH, bounds.height - 2 * SCREEN_VIEW_MARGIN - 30);
    const columnBox = new VBox({
      spacing: GREENHOUSE_SCREEN_VIEW_SETTINGS.COLUMN_BOX_SPACING,
      align: "left",
      children: [columnTitle, column],
    });
    columnBox.left = bounds.minX + SCREEN_VIEW_MARGIN;
    columnBox.top = bounds.minY + SCREEN_VIEW_MARGIN;

    // ── Phase diagram and readouts (middle) ───────────────────────────────────
    const diagramTitle = createTitle(strings.phaseTitleStringProperty, DIAGRAM_WIDTH);
    const diagram = new PhaseDiagramNode(model, DIAGRAM_WIDTH, DIAGRAM_HEIGHT);
    const middleLeft = columnBox.right + 75;
    diagramTitle.left = middleLeft;
    diagramTitle.top = bounds.minY + SCREEN_VIEW_MARGIN;
    diagram.left = middleLeft;
    diagram.top = diagramTitle.bottom + GREENHOUSE_SCREEN_VIEW_SETTINGS.CONSTRUCTOR_TOP_OFFSET;

    const dependencies = unitDependencies();
    const bareText = createReadout(
      new PatternStringProperty(strings.bareRockPatternStringProperty, {
        value: DerivedProperty.deriveAny([model.equilibriumTemperatureProperty, ...dependencies], () =>
          formatTemperature(model.equilibriumTemperatureProperty.value),
        ),
      }),
      DIAGRAM_WIDTH,
    );
    const surfaceText = createReadout(
      new PatternStringProperty(strings.surfacePatternStringProperty, {
        value: DerivedProperty.deriveAny([model.surfaceTemperatureProperty, ...dependencies], () =>
          formatTemperature(model.surfaceTemperatureProperty.value),
        ),
      }),
      DIAGRAM_WIDTH,
    );
    const warmingText = createReadout(
      new PatternStringProperty(strings.warmingPatternStringProperty, {
        value: DerivedProperty.deriveAny(
          [model.surfaceTemperatureProperty, model.equilibriumTemperatureProperty, ...dependencies],
          () => formatKelvin(model.surfaceTemperatureProperty.value - model.equilibriumTemperatureProperty.value),
        ),
      }),
      DIAGRAM_WIDTH,
    );
    const verdictText = createReadout(
      new DerivedProperty(
        [
          model.phaseProperty,
          strings.verdictIceStringProperty,
          strings.verdictLiquidStringProperty,
          strings.verdictVapourStringProperty,
          strings.verdictSupercriticalStringProperty,
        ],
        (phase, ice, liquid, vapour, supercritical) =>
          phase === "ice" ? ice : phase === "liquid" ? liquid : phase === "vapour" ? vapour : supercritical,
      ),
      DIAGRAM_WIDTH,
    );
    verdictText.font = FONTS.TITLE;
    model.phaseProperty.link((phase) => {
      verdictText.fill = phaseColor(phase);
    });
    const readouts = new HabitabilityLabPanel(
      new VBox({
        spacing: GREENHOUSE_SCREEN_VIEW_SETTINGS.READOUTS_SPACING,
        align: "left",
        children: [bareText, surfaceText, warmingText, verdictText],
      }),
      {
        minWidth: DIAGRAM_WIDTH + GREENHOUSE_SCREEN_VIEW_SETTINGS.READOUTS_MIN_WIDTH_OFFSET,
        maxWidth: DIAGRAM_WIDTH + GREENHOUSE_SCREEN_VIEW_SETTINGS.READOUTS_MAX_WIDTH_OFFSET,
      },
    );
    readouts.left = middleLeft - GREENHOUSE_SCREEN_VIEW_SETTINGS.CONSTRUCTOR_LEFT_OFFSET;
    readouts.top = diagram.bottom + 48;

    const resetAllButton = new ResetAllButton({
      ...FLAT_RESET_ALL_BUTTON_OPTIONS,
      listener: () => {
        this.interruptSubtreeInput();
        model.reset();
      },
      right: bounds.maxX - SCREEN_VIEW_MARGIN,
      bottom: bounds.maxY - SCREEN_VIEW_MARGIN,
    });

    this.children = [columnBox, diagramTitle, diagram, readouts, controlPanel, resetAllButton];
    this.addChild(
      new Node({
        pdomOrder: [
          presetRadios,
          starlightControl,
          albedoControl,
          opticalDepthControl,
          pressureControl,
          explanationButton,
          resetAllButton,
        ],
      }),
    );
  }
}
