/**
 * ZoneEdgesScreenView.ts
 *
 * The Zone Edges screen (doc/model.md §3):
 *  - left: the habitable-zone diagram (starlight against star temperature);
 *  - middle: a to-scale top view of the chosen star, and the selected planet's card;
 *  - right: the star (a real host, the Sun, or any main-sequence star by
 *    temperature), its planets, the planet mass for the inner edge, the archive
 *    population toggle, the equation and an explanation.
 */

import { DerivedProperty, Multilink, PatternStringProperty } from "scenerystack/axon";
import { type EmptySelfOptions, optionize } from "scenerystack/phet-core";
import { Node, RichText, Text, VBox } from "scenerystack/scenery";
import { ResetAllButton } from "scenerystack/scenery-phet";
import { ScreenView, type ScreenViewOptions } from "scenerystack/sim";
import { type AquaRadioButtonGroup, ComboBox } from "scenerystack/sun";
import {
  FLAT_RESET_ALL_BUTTON_OPTIONS,
  HABITABILITY_LAB_COMBO_BOX_OPTIONS,
  LIGHT_SURFACE_TEXT_FILL,
} from "../../common/HabitabilityLabButtonOptions.js";
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
  formatAU,
  formatKelvin,
  formatStarlight,
  unitDependencies,
  valueWithUnits,
} from "../../common/view/formatters.js";
import { zoneStatusColor, zoneStatusDependencies, zoneStatusStringProperty } from "../../common/view/zoneStatusView.js";
import HabitabilityLabColors from "../../HabitabilityLabColors.js";
import {
  CONTROL_PANEL_WIDTH,
  FONTS,
  KOPPARAPU_TEMPERATURE_RANGE,
  PLANET_MASS_CHOICES,
  SCREEN_VIEW_MARGIN,
} from "../../HabitabilityLabConstants.js";
import { StringManager } from "../../i18n/StringManager.js";
import { CUSTOM_SYSTEM_KEY, ZONE_SYSTEMS, type ZoneEdgesModel, type ZonePlanet } from "../model/ZoneEdgesModel.js";
import { ZoneDiagramNode } from "./ZoneDiagramNode.js";
import { ZoneEdgesScreenSummaryContent } from "./ZoneEdgesScreenSummaryContent.js";
import { ZoneSystemViewNode } from "./ZoneSystemViewNode.js";

export type ZoneEdgesScreenViewOptions = ScreenViewOptions;

const DIAGRAM_WIDTH = 340;
const DIAGRAM_HEIGHT = 420;
const SYSTEM_SIZE = 250;
const CARD_WIDTH = SYSTEM_SIZE;

const limitSymbol = (limit: number): string => (limit === 1 ? "≤" : limit === -1 ? "≥" : "");

function massSourceKey(
  planet: ZonePlanet,
):
  | "upperLimitStringProperty"
  | "lowerLimitStringProperty"
  | "minimumStringProperty"
  | "measuredStringProperty"
  | "estimatedStringProperty" {
  if (planet.massLimit !== 0) {
    return planet.massLimit === 1 ? "upperLimitStringProperty" : "lowerLimitStringProperty";
  }
  return planet.massIsMinimum
    ? "minimumStringProperty"
    : planet.massMeasured
      ? "measuredStringProperty"
      : "estimatedStringProperty";
}

function massPrefix(planet: ZonePlanet): string {
  if (planet.massLimit === 1 && planet.massIsMinimum) {
    return "M sin i ≤";
  }
  return limitSymbol(planet.massLimit) || (planet.massIsMinimum ? "≥" : "");
}

export class ZoneEdgesScreenView extends ScreenView {
  public constructor(model: ZoneEdgesModel, providedOptions?: ZoneEdgesScreenViewOptions) {
    const options = optionize<ZoneEdgesScreenViewOptions, EmptySelfOptions, ScreenViewOptions>()(
      {
        screenSummaryContent: new ZoneEdgesScreenSummaryContent(model),
      },
      providedOptions,
    );
    super(options);

    const stringManager = StringManager.getInstance();
    const strings = stringManager.getZoneEdgesStrings();
    const units = stringManager.getUnits();
    const a11y = stringManager.getZoneEdgesA11yStrings();
    const bounds = this.layoutBounds;
    const listParent = new Node();

    // ── Controls (right) ──────────────────────────────────────────────────────
    const systemComboBox = new ComboBox(
      model.systemProperty,
      ZONE_SYSTEMS.map((system) => {
        const labelProperty =
          system.key === "sun"
            ? strings.solarSystemStringProperty
            : system.key === CUSTOM_SYSTEM_KEY
              ? strings.mainSequenceStarStringProperty
              : null;
        return {
          value: system,
          createNode: () =>
            new Text(labelProperty ?? system.key, {
              font: FONTS.LABEL,
              fill: LIGHT_SURFACE_TEXT_FILL,
              maxWidth: CONTROL_PANEL_WIDTH - 50,
            }),
          ...(labelProperty ? { accessibleName: labelProperty } : { accessibleName: system.key }),
        };
      }),
      listParent,
      { ...HABITABILITY_LAB_COMBO_BOX_OPTIONS, accessibleName: a11y.controls.systemStringProperty, yMargin: 4 },
    );
    const temperatureControl = createNumberControl(
      strings.starTemperatureStringProperty,
      model.customTemperatureProperty,
      KOPPARAPU_TEMPERATURE_RANGE,
      { unitsProperty: units.kelvinStringProperty, significantFigures: 4, delta: 10 },
    );
    temperatureControl.visibleProperty = model.isCustomProperty;
    const starText = createReadout(
      new PatternStringProperty(strings.starPatternStringProperty, {
        type: model.spectralTypeProperty,
        temperature: DerivedProperty.deriveAny([model.starTemperatureProperty, ...unitDependencies()], () =>
          formatKelvin(model.starTemperatureProperty.value),
        ),
        luminosity: DerivedProperty.deriveAny([model.starLuminosityProperty, ...unitDependencies()], () =>
          valueWithUnits(
            formatSignificant(model.starLuminosityProperty.value, 2),
            units.solarLuminosityStringProperty.value,
          ),
        ),
      }),
      CONTROL_PANEL_WIDTH,
    );
    const outsideFitText = new RichText(strings.outsideFitStringProperty, {
      font: FONTS.SMALL,
      fill: HabitabilityLabColors.mutedTextColorProperty,
      lineWrap: CONTROL_PANEL_WIDTH,
      visibleProperty: new DerivedProperty([model.starTemperatureProperty], (t) => t < KOPPARAPU_TEMPERATURE_RANGE.min),
    });

    // Radio buttons for the chosen star's planets, rebuilt when the star changes.
    const planetsHolder = new Node();
    let planetRadios: AquaRadioButtonGroup<ZonePlanet | null> | null = null;
    const noPlanetsText = new RichText(strings.noPlanetsStringProperty, {
      font: FONTS.SMALL,
      fill: HabitabilityLabColors.mutedTextColorProperty,
      lineWrap: CONTROL_PANEL_WIDTH,
    });
    model.systemProperty.link((system) => {
      if (planetRadios) {
        planetRadios.dispose();
        planetRadios = null;
      }
      if (system.planets.length === 0) {
        planetsHolder.children = [noPlanetsText];
        return;
      }
      planetRadios = createRadioGroup<ZonePlanet | null>(
        model.selectedPlanetProperty,
        system.planets.map((planet) => ({
          value: planet,
          labelProperty: planet.bodyKey ? bodyNameProperty(planet.bodyKey) : planet.name,
        })),
        a11y.controls.planetsStringProperty,
        CONTROL_PANEL_WIDTH - 30,
      );
      planetsHolder.children = [planetRadios];
    });

    const massRadios = createRadioGroup(
      model.planetMassProperty,
      PLANET_MASS_CHOICES.map((mass) => ({
        value: mass,
        labelProperty: new DerivedProperty(
          [units.earthMassesStringProperty, units.valueUnitsPatternStringProperty],
          () => valueWithUnits(String(mass), units.earthMassesStringProperty.value),
        ),
      })),
      a11y.controls.planetMassStringProperty,
    );
    const archiveCheckbox = createCheckbox(model.showArchiveProperty, strings.showArchiveStringProperty);
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
        spacing: 7,
        align: "left",
        children: [
          createTitle(strings.systemStringProperty),
          systemComboBox,
          temperatureControl,
          starText,
          outsideFitText,
          createTitle(strings.planetsStringProperty),
          planetsHolder,
          createTitle(strings.planetMassStringProperty),
          massRadios,
          archiveCheckbox,
          createEquationNode(strings.equationStringProperty, CONTROL_PANEL_WIDTH),
          createExplanationRow(explanationButton),
        ],
      }),
      { minWidth: CONTROL_PANEL_WIDTH + 24, maxWidth: CONTROL_PANEL_WIDTH + 24 },
    );
    controlPanel.right = bounds.maxX - SCREEN_VIEW_MARGIN;
    controlPanel.top = bounds.minY + SCREEN_VIEW_MARGIN;

    // ── Diagram (left) ────────────────────────────────────────────────────────
    const diagramTitle = createTitle(strings.diagramTitleStringProperty, DIAGRAM_WIDTH);
    const diagram = new ZoneDiagramNode(model, DIAGRAM_WIDTH, DIAGRAM_HEIGHT);
    diagram.left = bounds.minX + SCREEN_VIEW_MARGIN + 62;
    diagramTitle.left = diagram.left;
    diagramTitle.top = bounds.minY + SCREEN_VIEW_MARGIN;
    diagram.top = diagramTitle.bottom + 10;

    // ── Top view and planet card (middle) ─────────────────────────────────────
    const systemTitle = createTitle(strings.systemTitleStringProperty, SYSTEM_SIZE);
    const systemView = new ZoneSystemViewNode(model, SYSTEM_SIZE);
    const middleLeft = diagram.right + 30;
    systemTitle.left = middleLeft;
    systemTitle.top = diagramTitle.top;
    systemView.left = middleLeft;
    systemView.top = diagram.top;

    const cardName = new Text("", {
      font: FONTS.TITLE,
      fill: HabitabilityLabColors.textColorProperty,
      maxWidth: CARD_WIDTH,
    });
    const cardStatus = new RichText("", { font: FONTS.LABEL, lineWrap: CARD_WIDTH, leading: 2 });
    const cardLines = new RichText("", {
      font: FONTS.READOUT,
      fill: HabitabilityLabColors.textColorProperty,
      leading: 4,
      maxWidth: CARD_WIDTH,
    });
    Multilink.multilinkAny(
      [
        model.selectedPlanetProperty,
        model.selectedStatusProperty,
        model.systemProperty,
        strings.radiusPatternStringProperty,
        strings.massPatternStringProperty,
        strings.upperLimitStringProperty,
        strings.lowerLimitStringProperty,
        strings.massUnknownStringProperty,
        strings.measuredStringProperty,
        strings.estimatedStringProperty,
        strings.minimumStringProperty,
        strings.starlightPatternStringProperty,
        strings.orbitPatternStringProperty,
        units.earthRadiiStringProperty,
        units.earthMassesStringProperty,
        ...unitDependencies(),
        ...zoneStatusDependencies(),
      ],
      () => {
        const planet = model.selectedPlanetProperty.value;
        const status = model.selectedStatusProperty.value;
        if (!(planet && status)) {
          cardName.string = "";
          cardStatus.string = "";
          cardLines.string = "";
          return;
        }
        cardName.string = planet.bodyKey ? bodyNameProperty(planet.bodyKey).value : planet.name;
        cardStatus.string = zoneStatusStringProperty(status).value;
        cardStatus.fill = zoneStatusColor(status);
        const source = strings[massSourceKey(planet)].value;
        const lines = [
          strings.starlightPatternStringProperty.value.replace("{{value}}", formatStarlight(planet.insolation)),
          strings.orbitPatternStringProperty.value.replace("{{value}}", formatAU(planet.distance)),
          strings.radiusPatternStringProperty.value.replace(
            "{{value}}",
            valueWithUnits(
              `${limitSymbol(planet.radiusLimit)}${formatSignificant(planet.radius, 3)}`,
              units.earthRadiiStringProperty.value,
            ),
          ),
          planet.mass === null
            ? strings.massUnknownStringProperty.value
            : strings.massPatternStringProperty.value
                .replace(
                  "{{value}}",
                  valueWithUnits(
                    `${massPrefix(planet)}${formatSignificant(planet.mass, 3)}`,
                    units.earthMassesStringProperty.value,
                  ),
                )
                .replace("{{source}}", source),
        ];
        cardLines.string = lines.join("<br>");
      },
    );
    const rangeText = (
      pattern: typeof strings.conservativeRangePatternStringProperty,
      inner: "runawayGreenhouse" | "recentVenus",
      outer: "maximumGreenhouse" | "earlyMars",
    ): RichText =>
      createReadout(
        new PatternStringProperty(pattern, {
          inner: DerivedProperty.deriveAny([model.distancesProperty, ...unitDependencies()], () =>
            formatAU(model.distancesProperty.value[inner]),
          ),
          outer: DerivedProperty.deriveAny([model.distancesProperty, ...unitDependencies()], () =>
            formatAU(model.distancesProperty.value[outer]),
          ),
        }),
        CARD_WIDTH - 20,
      );
    const conservativeRange = rangeText(
      strings.conservativeRangePatternStringProperty,
      "runawayGreenhouse",
      "maximumGreenhouse",
    );
    conservativeRange.fill = HabitabilityLabColors.habitableColorProperty;
    const optimisticRange = rangeText(strings.optimisticRangePatternStringProperty, "recentVenus", "earlyMars");
    const planetInfo = new VBox({
      spacing: 6,
      align: "left",
      children: [cardName, cardStatus, cardLines],
      visibleProperty: new DerivedProperty([model.selectedPlanetProperty], (planet) => planet !== null),
    });
    const card = new HabitabilityLabPanel(
      new VBox({ spacing: 8, align: "left", children: [conservativeRange, optimisticRange, planetInfo] }),
      {
        minWidth: CARD_WIDTH,
        maxWidth: CARD_WIDTH,
      },
    );
    card.left = middleLeft;
    card.top = systemView.bottom + 12;

    const resetAllButton = new ResetAllButton({
      ...FLAT_RESET_ALL_BUTTON_OPTIONS,
      listener: () => {
        this.interruptSubtreeInput();
        model.reset();
      },
      right: bounds.maxX - SCREEN_VIEW_MARGIN,
      bottom: bounds.maxY - SCREEN_VIEW_MARGIN,
    });

    this.children = [diagramTitle, diagram, systemTitle, systemView, card, controlPanel, resetAllButton, listParent];
    this.addChild(
      new Node({
        pdomOrder: [
          systemComboBox,
          temperatureControl,
          planetsHolder,
          massRadios,
          archiveCheckbox,
          explanationButton,
          resetAllButton,
        ],
      }),
    );
  }
}
