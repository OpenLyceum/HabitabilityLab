/**
 * AgingStarScreenView.ts
 *
 * The Aging Star screen (doc/model.md §4):
 *  - top left: a to-scale top view of the star, its zones, the continuously
 *    habitable zone, the tidal-lock distance and the planet;
 *  - top middle: the HR diagram and the readouts;
 *  - bottom: the timeline of the star's life with the planet's zone status;
 *  - right: presets, star mass, the planet's starting distance, the duration
 *    for the continuously habitable zone, the zoom toggle, an explanation, and
 *    the time controls.
 */

import { DerivedProperty, Multilink, PatternStringProperty, type TReadOnlyProperty } from "scenerystack/axon";
import { type EmptySelfOptions, optionize } from "scenerystack/phet-core";
import { HBox, Node, Rectangle, RichText, Text, VBox } from "scenerystack/scenery";
import { ResetAllButton, TimeControlNode, TimeSpeed } from "scenerystack/scenery-phet";
import { ScreenView, type ScreenViewOptions } from "scenerystack/sim";
import { ComboBox } from "scenerystack/sun";
import {
  FLAT_PLAY_PAUSE_STEP_BUTTON_OPTIONS,
  FLAT_RESET_ALL_BUTTON_OPTIONS,
  HABITABILITY_LAB_COMBO_BOX_OPTIONS,
  LIGHT_SURFACE_TEXT_FILL,
  TIME_CONTROL_SPEED_RADIO_OPTIONS,
} from "../../common/HabitabilityLabButtonOptions.js";
import { HabitabilityLabPanel } from "../../common/HabitabilityLabPanel.js";
import { TRACK_MASSES } from "../../common/model/stellarTracks.js";
import { formatSignificant } from "../../common/view/chartUtils.js";
import {
  createCheckbox,
  createExplanationButton,
  createExplanationRow,
  createNumberControl,
  createRadioGroup,
  createReadout,
  createTitle,
} from "../../common/view/controls.js";
import {
  formatAge,
  formatAU,
  formatKelvin,
  formatStarlight,
  formatTemperature,
  unitDependencies,
  valueWithUnits,
} from "../../common/view/formatters.js";
import { zoneStatusColor, zoneStatusDependencies, zoneStatusStringProperty } from "../../common/view/zoneStatusView.js";
import HabitabilityLabColors from "../../HabitabilityLabColors.js";
import {
  AGING_DISTANCE_RANGE,
  CHZ_DURATIONS_MYR,
  CONTROL_PANEL_WIDTH,
  FONTS,
  SCREEN_VIEW_MARGIN,
} from "../../HabitabilityLabConstants.js";
import { StringManager } from "../../i18n/StringManager.js";
import { AGING_PRESETS, type AgingStarModel } from "../model/AgingStarModel.js";
import { AgingStarScreenSummaryContent } from "./AgingStarScreenSummaryContent.js";
import { AgingSystemViewNode } from "./AgingSystemViewNode.js";
import { HRDiagramNode } from "./HRDiagramNode.js";
import { TimelineNode } from "./TimelineNode.js";

export type AgingStarScreenViewOptions = ScreenViewOptions;

const SYSTEM_SIZE = 290;
const HR_WIDTH = 250;
const HR_HEIGHT = 135;
const TIMELINE_HEIGHT = 95;
const READOUT_WIDTH = 330;

/** Seconds advanced by one press of the step button (a two-hundredth of the window). */
const STEP_SECONDS = 0.2;

export class AgingStarScreenView extends ScreenView {
  private readonly systemView: AgingSystemViewNode;

  public constructor(model: AgingStarModel, providedOptions?: AgingStarScreenViewOptions) {
    const options = optionize<AgingStarScreenViewOptions, EmptySelfOptions, ScreenViewOptions>()(
      {
        screenSummaryContent: new AgingStarScreenSummaryContent(model),
      },
      providedOptions,
    );
    super(options);

    const stringManager = StringManager.getInstance();
    const strings = stringManager.getAgingStarStrings();
    const units = stringManager.getUnits();
    const a11y = stringManager.getAgingStarA11yStrings();
    const bounds = this.layoutBounds;
    const listParent = new Node();

    // ── Controls (right) ──────────────────────────────────────────────────────
    const presetLabels: Record<(typeof AGING_PRESETS)[number], TReadOnlyProperty<string>> = {
      sunVenus: strings.sunVenusStringProperty,
      sunEarth: strings.sunEarthStringProperty,
      sunMars: strings.sunMarsStringProperty,
      redDwarf: strings.redDwarfStringProperty,
      kepler442: strings.kepler442StringProperty,
      kepler452: strings.kepler452StringProperty,
      aStar: strings.aStarStringProperty,
      custom: stringManager.getCommonStrings().customStringProperty,
    };
    const presetRadios = createRadioGroup(
      model.presetProperty,
      AGING_PRESETS.map((preset) => ({ value: preset, labelProperty: presetLabels[preset] })),
      a11y.controls.presetStringProperty,
      CONTROL_PANEL_WIDTH - 30,
    );
    const massLabel = (mass: number): TReadOnlyProperty<string> =>
      new DerivedProperty([units.solarMassesStringProperty, units.valueUnitsPatternStringProperty], () =>
        valueWithUnits(String(mass), units.solarMassesStringProperty.value),
      );
    const massComboBox = new ComboBox(
      model.trackMassProperty,
      TRACK_MASSES.map((mass) => ({
        value: mass,
        createNode: () => new RichText(massLabel(mass), { font: FONTS.LABEL, fill: LIGHT_SURFACE_TEXT_FILL }),
        accessibleName: massLabel(mass),
      })),
      listParent,
      { ...HABITABILITY_LAB_COMBO_BOX_OPTIONS, accessibleName: a11y.controls.starMassStringProperty, yMargin: 3 },
    );
    const distanceControl = createNumberControl(
      strings.distanceStringProperty,
      model.distanceProperty,
      AGING_DISTANCE_RANGE,
      {
        logarithmic: true,
        unitsProperty: units.auStringProperty,
        significantFigures: 3,
      },
    );
    const chzRadios = new HBox({
      spacing: 6,
      children: [
        createRadioGroup(
          model.chzDurationProperty,
          CHZ_DURATIONS_MYR.map((myr) => ({
            value: myr,
            labelProperty: new DerivedProperty([units.gyrStringProperty, units.valueUnitsPatternStringProperty], () =>
              valueWithUnits(String(myr / 1000), units.gyrStringProperty.value),
            ),
          })),
          a11y.controls.chzDurationStringProperty,
        ),
      ],
    });
    const zoomCheckbox = createCheckbox(model.zoomLateProperty, strings.zoomLateStringProperty);
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
        spacing: 6,
        align: "left",
        children: [
          createTitle(strings.presetStringProperty),
          presetRadios,
          new HBox({
            spacing: 8,
            children: [
              new Text(strings.starMassStringProperty, {
                font: FONTS.LABEL,
                fill: HabitabilityLabColors.textColorProperty,
                maxWidth: 100,
              }),
              massComboBox,
            ],
          }),
          distanceControl,
          new Text(strings.chzDurationStringProperty, {
            font: FONTS.LABEL,
            fill: HabitabilityLabColors.textColorProperty,
            maxWidth: CONTROL_PANEL_WIDTH,
          }),
          chzRadios,
          zoomCheckbox,
          createExplanationRow(explanationButton),
        ],
      }),
      { minWidth: CONTROL_PANEL_WIDTH + 24, maxWidth: CONTROL_PANEL_WIDTH + 24 },
    );
    controlPanel.right = bounds.maxX - SCREEN_VIEW_MARGIN;
    controlPanel.top = bounds.minY + SCREEN_VIEW_MARGIN;

    // ── Top view (top left) ───────────────────────────────────────────────────
    this.systemView = new AgingSystemViewNode(model, SYSTEM_SIZE);
    this.systemView.left = bounds.minX + SCREEN_VIEW_MARGIN;
    this.systemView.top = bounds.minY + SCREEN_VIEW_MARGIN;

    // Legend under the top view.
    const legendItem = (
      fill: typeof HabitabilityLabColors.conservativeZoneColorProperty,
      label: TReadOnlyProperty<string>,
      dashed = false,
    ): HBox =>
      new HBox({
        spacing: 4,
        children: [
          dashed
            ? new Rectangle(0, 0, 14, 3, { fill: fill })
            : new Rectangle(0, 0, 14, 9, {
                fill: fill,
                opacity: fill === HabitabilityLabColors.continuousZoneColorProperty ? 0.6 : 1,
              }),
          new RichText(label, { font: FONTS.SMALL, fill: HabitabilityLabColors.textColorProperty, maxWidth: 120 }),
        ],
      });
    const common = stringManager.getCommonStrings();
    const chzLabel = new PatternStringProperty(strings.chzPatternStringProperty, {
      duration: DerivedProperty.deriveAny([model.chzDurationProperty, ...unitDependencies()], () =>
        formatAge(model.chzDurationProperty.value),
      ),
    });
    const legend = new VBox({
      spacing: 2,
      align: "left",
      children: [
        new HBox({
          spacing: 10,
          children: [
            legendItem(HabitabilityLabColors.conservativeZoneColorProperty, common.conservativeZoneStringProperty),
            legendItem(HabitabilityLabColors.optimisticZoneColorProperty, common.optimisticZoneStringProperty),
          ],
        }),
        new HBox({
          spacing: 10,
          children: [
            legendItem(HabitabilityLabColors.continuousZoneColorProperty, chzLabel),
            legendItem(HabitabilityLabColors.tidalLockColorProperty, strings.lockDistanceStringProperty, true),
          ],
        }),
      ],
    });
    legend.left = this.systemView.left;
    legend.top = this.systemView.bottom + 4;

    // ── HR diagram and readouts (top middle) ──────────────────────────────────
    const hrDiagram = new HRDiagramNode(model, HR_WIDTH, HR_HEIGHT);
    hrDiagram.left = this.systemView.right + 62;
    hrDiagram.top = this.systemView.top + 4;

    const dependencies = unitDependencies();
    const derived = (format: () => string, extra: TReadOnlyProperty<unknown>[]): TReadOnlyProperty<string> =>
      DerivedProperty.deriveAny([...extra, ...dependencies], format);
    const stageNames = strings.stage;
    const ageText = createReadout(
      new PatternStringProperty(strings.agePatternStringProperty, {
        value: derived(() => formatAge(model.ageProperty.value), [model.ageProperty]),
      }),
      READOUT_WIDTH,
    );
    ageText.font = FONTS.TITLE;
    const stageText = createReadout(
      new PatternStringProperty(strings.stagePatternStringProperty, {
        value: DerivedProperty.deriveAny(
          [model.stageProperty, ...Object.values(stageNames)],
          () => stageNames[`${model.stageProperty.value}StringProperty`].value,
        ),
      }),
      READOUT_WIDTH,
    );
    const starText = createReadout(
      new PatternStringProperty(strings.starPatternStringProperty, {
        luminosity: derived(
          () =>
            valueWithUnits(
              formatSignificant(model.starProperty.value.luminosity, 3),
              units.solarLuminosityStringProperty.value,
            ),
          [model.starProperty, units.solarLuminosityStringProperty],
        ),
        temperature: derived(() => formatKelvin(model.starProperty.value.temperature), [model.starProperty]),
        radius: derived(
          () =>
            valueWithUnits(formatSignificant(model.starProperty.value.radius, 3), units.solarRadiiStringProperty.value),
          [model.starProperty, units.solarRadiiStringProperty],
        ),
      }),
      READOUT_WIDTH,
    );
    const planetText = createReadout(
      new PatternStringProperty(strings.planetPatternStringProperty, {
        distance: derived(() => formatAU(model.planetDistanceProperty.value), [model.planetDistanceProperty]),
        starlight: derived(() => formatStarlight(model.starlightProperty.value), [model.starlightProperty]),
      }),
      READOUT_WIDTH,
    );
    const bareRockText = createReadout(
      new PatternStringProperty(strings.bareRockPatternStringProperty, {
        value: derived(
          () => formatTemperature(model.bareRockTemperatureProperty.value),
          [model.bareRockTemperatureProperty],
        ),
      }),
      READOUT_WIDTH,
    );
    const statusText = new RichText("", { font: FONTS.TITLE, lineWrap: READOUT_WIDTH });
    Multilink.multilinkAny(
      [model.statusProperty, model.engulfedProperty, strings.engulfedStringProperty, ...zoneStatusDependencies()],
      () => {
        if (model.engulfedProperty.value) {
          statusText.string = strings.engulfedStringProperty.value;
          statusText.fill = HabitabilityLabColors.tooHotColorProperty;
        } else {
          statusText.string = zoneStatusStringProperty(model.statusProperty.value).value;
          statusText.fill = zoneStatusColor(model.statusProperty.value);
        }
      },
    );
    const timeInZoneText = createReadout(
      new PatternStringProperty(strings.timeInZonePatternStringProperty, {
        value: derived(() => formatAge(model.timeInZoneProperty.value), [model.timeInZoneProperty]),
      }),
      READOUT_WIDTH,
    );
    const lockedWithAge = new PatternStringProperty(strings.lockedPatternStringProperty, {
      age: derived(
        () =>
          Number.isFinite(model.historyProperty.value.lockAge) ? formatAge(model.historyProperty.value.lockAge) : "",
        [model.historyProperty],
      ),
    });
    const lockText = createReadout(
      new DerivedProperty([model.lockedProperty, lockedWithAge, strings.notLockedStringProperty], (locked, yes, no) =>
        locked ? yes : no,
      ),
      READOUT_WIDTH,
    );
    lockText.fill = HabitabilityLabColors.tidalLockColorProperty;
    const extrapolatedText = new RichText(strings.extrapolatedStringProperty, {
      font: FONTS.SMALL,
      fill: HabitabilityLabColors.mutedTextColorProperty,
      maxWidth: READOUT_WIDTH,
      visibleProperty: model.extrapolatedProperty,
    });
    const readouts = new VBox({
      spacing: 2,
      align: "left",
      children: [
        ageText,
        stageText,
        starText,
        planetText,
        bareRockText,
        statusText,
        timeInZoneText,
        lockText,
        extrapolatedText,
      ],
    });
    readouts.left = this.systemView.right + 16;
    readouts.top = hrDiagram.bottom + 34;

    // ── Timeline (bottom) ─────────────────────────────────────────────────────
    const timelineLeft = this.systemView.left + 58;
    const timeline = new TimelineNode(model, controlPanel.left - 20 - timelineLeft, TIMELINE_HEIGHT);
    timeline.left = timelineLeft;
    timeline.bottom = bounds.maxY - SCREEN_VIEW_MARGIN - 32;

    // ── Time controls and Reset All ───────────────────────────────────────────
    const timeControlNode = new TimeControlNode(model.timer.isPlayingProperty, {
      timeSpeedProperty: model.timeSpeedProperty,
      timeSpeeds: [TimeSpeed.FAST, TimeSpeed.NORMAL, TimeSpeed.SLOW],
      ...TIME_CONTROL_SPEED_RADIO_OPTIONS,
      playPauseStepButtonOptions: {
        ...FLAT_PLAY_PAUSE_STEP_BUTTON_OPTIONS,
        stepForwardButtonOptions: {
          ...FLAT_PLAY_PAUSE_STEP_BUTTON_OPTIONS.stepForwardButtonOptions,
          listener: () => model.advance(STEP_SECONDS),
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

    this.children = [
      this.systemView,
      legend,
      hrDiagram,
      readouts,
      timeline,
      controlPanel,
      timeControlNode,
      resetAllButton,
      listParent,
    ];
    this.addChild(
      new Node({
        pdomOrder: [
          presetRadios,
          massComboBox,
          distanceControl,
          chzRadios,
          zoomCheckbox,
          timeline.cursorNode,
          explanationButton,
          timeControlNode,
          resetAllButton,
        ],
      }),
    );
  }

  public override step(dt: number): void {
    this.systemView.step(dt);
  }
}
