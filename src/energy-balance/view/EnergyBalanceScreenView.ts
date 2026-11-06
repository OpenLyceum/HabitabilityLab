/**
 * EnergyBalanceScreenView.ts
 *
 * The Energy Balance screen (doc/model.md §1):
 *  - top: the star and the planet on a distance scale, with sunlight absorbed,
 *    reflected and infrared emitted drawn as arrows;
 *  - bottom left: the planet's temperature over the last 30 years;
 *  - bottom middle: absorbed and emitted energy as bars, a thermometer, and
 *    the temperature readouts (now, equilibrium, measured);
 *  - right: planet presets, star brightness, distance, albedo, heat spread,
 *    the equation, an explanation, and time controls.
 */

import { DerivedProperty, PatternStringProperty } from "scenerystack/axon";
import { type EmptySelfOptions, optionize } from "scenerystack/phet-core";
import { Node, VBox } from "scenerystack/scenery";
import { ResetAllButton, TimeControlNode, TimeSpeed } from "scenerystack/scenery-phet";
import { ScreenView, type ScreenViewOptions } from "scenerystack/sim";
import {
  FLAT_PLAY_PAUSE_STEP_BUTTON_OPTIONS,
  FLAT_RESET_ALL_BUTTON_OPTIONS,
  TIME_CONTROL_SPEED_RADIO_OPTIONS,
} from "../../common/HabitabilityLabButtonOptions.js";
import { HabitabilityLabPanel } from "../../common/HabitabilityLabPanel.js";
import {
  createEquationNode,
  createExplanationButton,
  createExplanationRow,
  createNumberControl,
  createPushButton,
  createRadioGroup,
  createReadout,
  createTitle,
} from "../../common/view/controls.js";
import { bodyNameProperty, formatKelvin, formatTemperature, unitDependencies } from "../../common/view/formatters.js";
import {
  ALBEDO_RANGE,
  CONTROL_PANEL_WIDTH,
  ENERGY_DISTANCE_RANGE,
  LUMINOSITY_RANGE,
  SCREEN_VIEW_MARGIN,
} from "../../HabitabilityLabConstants.js";
import { StringManager } from "../../i18n/StringManager.js";
import { ENERGY_PRESETS, type EnergyBalanceModel } from "../model/EnergyBalanceModel.js";
import { EnergyBalanceScreenSummaryContent } from "./EnergyBalanceScreenSummaryContent.js";
import { EnergyBarsNode } from "./EnergyBarsNode.js";
import { EnergySpaceNode } from "./EnergySpaceNode.js";
import { TemperatureHistoryNode } from "./TemperatureHistoryNode.js";

export type EnergyBalanceScreenViewOptions = ScreenViewOptions;

/** Years advanced by one press of the step button. */
const STEP_YEARS = 1;

const SPACE_HEIGHT = 215;
const CHART_WIDTH = 320;
const CHART_HEIGHT = 230;
const BARS_PANEL_WIDTH = 220;

export class EnergyBalanceScreenView extends ScreenView {
  public constructor(model: EnergyBalanceModel, providedOptions?: EnergyBalanceScreenViewOptions) {
    const options = optionize<EnergyBalanceScreenViewOptions, EmptySelfOptions, ScreenViewOptions>()(
      {
        screenSummaryContent: new EnergyBalanceScreenSummaryContent(model),
      },
      providedOptions,
    );
    super(options);

    const stringManager = StringManager.getInstance();
    const strings = stringManager.getEnergyBalanceStrings();
    const common = stringManager.getCommonStrings();
    const units = stringManager.getUnits();
    const a11y = stringManager.getEnergyBalanceA11yStrings();
    const bounds = this.layoutBounds;

    // ── Controls (right) ──────────────────────────────────────────────────────
    const presetRadios = createRadioGroup(
      model.presetProperty,
      ENERGY_PRESETS.map((preset) => ({
        value: preset,
        labelProperty: preset === "custom" ? common.customStringProperty : bodyNameProperty(preset),
      })),
      a11y.controls.planetStringProperty,
    );
    const luminosityControl = createNumberControl(
      strings.starLuminosityStringProperty,
      model.luminosityProperty,
      LUMINOSITY_RANGE,
      { logarithmic: true, unitsProperty: units.solarLuminosityStringProperty, significantFigures: 2 },
    );
    const distanceControl = createNumberControl(
      strings.distanceStringProperty,
      model.distanceProperty,
      ENERGY_DISTANCE_RANGE,
      {
        logarithmic: true,
        unitsProperty: units.auStringProperty,
        significantFigures: 3,
      },
    );
    const albedoControl = createNumberControl(strings.albedoStringProperty, model.albedoProperty, ALBEDO_RANGE, {
      significantFigures: 2,
      delta: 0.01,
    });
    const heatSpreadRadios = createRadioGroup(
      model.heatSpreadProperty,
      [
        { value: "wholePlanet" as const, labelProperty: strings.wholePlanetStringProperty },
        { value: "daySide" as const, labelProperty: strings.daySideStringProperty },
      ],
      a11y.controls.heatSpreadStringProperty,
    );
    const equation = createEquationNode(
      new DerivedProperty(
        [model.heatSpreadProperty, strings.equationStringProperty, strings.equationDaySideStringProperty],
        (spread, whole, day) => (spread === "wholePlanet" ? whole : day),
      ),
      CONTROL_PANEL_WIDTH,
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
          luminosityControl,
          distanceControl,
          albedoControl,
          createTitle(strings.heatSpreadStringProperty),
          heatSpreadRadios,
          equation,
          createExplanationRow(explanationButton),
        ],
      }),
      { minWidth: CONTROL_PANEL_WIDTH + 24, maxWidth: CONTROL_PANEL_WIDTH + 24 },
    );
    controlPanel.right = bounds.maxX - SCREEN_VIEW_MARGIN;
    controlPanel.top = bounds.minY + SCREEN_VIEW_MARGIN;

    // ── Space view (top) ──────────────────────────────────────────────────────
    const spaceWidth = controlPanel.left - 12 - SCREEN_VIEW_MARGIN;
    const spaceNode = new EnergySpaceNode(model, spaceWidth, SPACE_HEIGHT);
    spaceNode.left = bounds.minX + SCREEN_VIEW_MARGIN;
    spaceNode.top = bounds.minY + SCREEN_VIEW_MARGIN;

    // ── Temperature history (bottom left) ─────────────────────────────────────
    const historyNode = new TemperatureHistoryNode(model, CHART_WIDTH, CHART_HEIGHT);
    historyNode.left = spaceNode.left + 58;
    historyNode.top = spaceNode.bottom + 24;

    // ── Bars and temperatures (bottom middle) ─────────────────────────────────
    const temperatureDependencies = unitDependencies();
    const nowText = createReadout(
      new PatternStringProperty(strings.temperatureNowPatternStringProperty, {
        value: DerivedProperty.deriveAny([model.temperatureProperty, ...temperatureDependencies], () =>
          formatTemperature(model.temperatureProperty.value),
        ),
      }),
      BARS_PANEL_WIDTH,
    );
    const equilibriumText = createReadout(
      new PatternStringProperty(strings.equilibriumPatternStringProperty, {
        value: DerivedProperty.deriveAny([model.equilibriumTemperatureProperty, ...temperatureDependencies], () =>
          formatTemperature(model.equilibriumTemperatureProperty.value),
        ),
      }),
      BARS_PANEL_WIDTH,
    );
    const measuredText = createReadout(
      new PatternStringProperty(strings.measuredPatternStringProperty, {
        value: DerivedProperty.deriveAny([model.measuredTemperatureProperty, ...temperatureDependencies], () =>
          formatTemperature(model.measuredTemperatureProperty.value ?? 0),
        ),
      }),
      BARS_PANEL_WIDTH,
    );
    const gapText = createReadout(
      DerivedProperty.deriveAny(
        [
          model.measuredTemperatureProperty,
          model.equilibriumTemperatureProperty,
          strings.gapPatternStringProperty,
          strings.gapColderPatternStringProperty,
          ...temperatureDependencies,
        ],
        () => {
          const gap = (model.measuredTemperatureProperty.value ?? 0) - model.equilibriumTemperatureProperty.value;
          const pattern =
            gap >= 0 ? strings.gapPatternStringProperty.value : strings.gapColderPatternStringProperty.value;
          return pattern.replace("{{value}}", formatKelvin(Math.abs(gap)));
        },
      ),
      BARS_PANEL_WIDTH,
    );
    const measuredVisibleProperty = new DerivedProperty([model.measuredTemperatureProperty], (t) => t !== null);
    measuredText.visibleProperty = measuredVisibleProperty;
    gapText.visibleProperty = measuredVisibleProperty;
    gapText.fill = "#ce93d8";
    measuredText.fill = gapText.fill;
    const jumpButton = createPushButton(
      strings.jumpToEquilibriumStringProperty,
      () => model.jumpToEquilibrium(),
      BARS_PANEL_WIDTH - 10,
      true,
    );
    jumpButton.accessibleName = a11y.controls.jumpStringProperty;

    const barsPanel = new HabitabilityLabPanel(
      new VBox({
        spacing: 6,
        align: "left",
        children: [
          new EnergyBarsNode(model, BARS_PANEL_WIDTH),
          nowText,
          equilibriumText,
          measuredText,
          gapText,
          jumpButton,
        ],
      }),
      { minWidth: BARS_PANEL_WIDTH + 24, maxWidth: BARS_PANEL_WIDTH + 24 },
    );
    barsPanel.right = spaceNode.right;
    barsPanel.top = spaceNode.bottom + 10;

    // ── Time controls and Reset All ───────────────────────────────────────────
    const timeControlNode = new TimeControlNode(model.timer.isPlayingProperty, {
      timeSpeedProperty: model.timeSpeedProperty,
      timeSpeeds: [TimeSpeed.FAST, TimeSpeed.NORMAL, TimeSpeed.SLOW],
      ...TIME_CONTROL_SPEED_RADIO_OPTIONS,
      playPauseStepButtonOptions: {
        ...FLAT_PLAY_PAUSE_STEP_BUTTON_OPTIONS,
        stepForwardButtonOptions: {
          ...FLAT_PLAY_PAUSE_STEP_BUTTON_OPTIONS.stepForwardButtonOptions,
          listener: () => model.advance(STEP_YEARS),
        },
      },
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
    timeControlNode.right = resetAllButton.left - 20;
    timeControlNode.centerY = resetAllButton.centerY;

    this.children = [spaceNode, historyNode, barsPanel, controlPanel, timeControlNode, resetAllButton];
    this.addChild(
      new Node({
        pdomOrder: [
          presetRadios,
          luminosityControl,
          distanceControl,
          albedoControl,
          heatSpreadRadios,
          spaceNode.planetNode,
          jumpButton,
          explanationButton,
          timeControlNode,
          resetAllButton,
        ],
      }),
    );
  }
}
