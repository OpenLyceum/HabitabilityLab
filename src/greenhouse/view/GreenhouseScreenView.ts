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

const COLUMN_WIDTH = 270;
const DIAGRAM_WIDTH = 330;
const DIAGRAM_HEIGHT = 300;

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
        significantFigures: 3,
      },
    );
    const albedoControl = createNumberControl(strings.albedoStringProperty, model.albedoProperty, ALBEDO_RANGE, {
      significantFigures: 2,
      delta: 0.01,
    });
    const opticalDepthControl = createNumberControl(
      strings.opticalDepthStringProperty,
      model.opticalDepthProperty,
      OPTICAL_DEPTH_RANGE,
      { logarithmic: true, significantFigures: 2 },
    );
    const pressureControl = createNumberControl(
      strings.pressureStringProperty,
      model.pressureProperty,
      PRESSURE_RANGE,
      {
        logarithmic: true,
        unitsProperty: units.barStringProperty,
        significantFigures: 2,
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
        spacing: 8,
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
      { minWidth: CONTROL_PANEL_WIDTH + 24, maxWidth: CONTROL_PANEL_WIDTH + 24 },
    );
    controlPanel.right = bounds.maxX - SCREEN_VIEW_MARGIN;
    controlPanel.top = bounds.minY + SCREEN_VIEW_MARGIN;

    // ── Atmosphere column (left) ──────────────────────────────────────────────
    const columnTitle = createTitle(strings.columnTitleStringProperty, COLUMN_WIDTH);
    const column = new AtmosphereColumnNode(model, COLUMN_WIDTH, bounds.height - 2 * SCREEN_VIEW_MARGIN - 30);
    const columnBox = new VBox({ spacing: 8, align: "left", children: [columnTitle, column] });
    columnBox.left = bounds.minX + SCREEN_VIEW_MARGIN;
    columnBox.top = bounds.minY + SCREEN_VIEW_MARGIN;

    // ── Phase diagram and readouts (middle) ───────────────────────────────────
    const diagramTitle = createTitle(strings.phaseTitleStringProperty, DIAGRAM_WIDTH);
    const diagram = new PhaseDiagramNode(model, DIAGRAM_WIDTH, DIAGRAM_HEIGHT);
    const middleLeft = columnBox.right + 75;
    diagramTitle.left = middleLeft;
    diagramTitle.top = bounds.minY + SCREEN_VIEW_MARGIN;
    diagram.left = middleLeft;
    diagram.top = diagramTitle.bottom + 10;

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
      new VBox({ spacing: 5, align: "left", children: [bareText, surfaceText, warmingText, verdictText] }),
      { minWidth: DIAGRAM_WIDTH + 24, maxWidth: DIAGRAM_WIDTH + 24 },
    );
    readouts.left = middleLeft - 12;
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
