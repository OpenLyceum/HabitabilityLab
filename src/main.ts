/**
 * main.ts
 *
 * Entry point for the simulation. Initializes SceneryStack, creates the
 * screens, and starts the main event loop.
 *
 * !! CRITICAL IMPORT ORDER !!
 * brand.js MUST be the first import. Each module imports the next, so the import nesting is
 *
 *   main → brand → splash → assert → init
 *
 * and therefore the actual EXECUTION order (deepest import runs first) is the reverse:
 *
 *   init → assert → splash → brand → main
 *
 * SceneryStack requires this exact load order. Never reorder these imports.
 */

// brand.js MUST be first; importing it runs the whole chain (init→assert→splash→brand) before main.
import "./brand.js";

import { onReadyToLaunch, PreferencesModel, Sim } from "scenerystack/sim";
import { Tandem } from "scenerystack/tandem";
import { AgingStarScreen } from "./aging-star/AgingStarScreen.js";
import { EnergyBalanceScreen } from "./energy-balance/EnergyBalanceScreen.js";
import { EscapeScreen } from "./escape/EscapeScreen.js";
import { GreenhouseScreen } from "./greenhouse/GreenhouseScreen.js";
import HabitabilityLabColors from "./HabitabilityLabColors.js";
import { StringManager } from "./i18n/StringManager.js";
import { HabitabilityLabPreferencesModel } from "./preferences/HabitabilityLabPreferencesModel.js";
import { HabitabilityLabPreferencesNode } from "./preferences/HabitabilityLabPreferencesNode.js";
import { ZoneEdgesScreen } from "./zone-edges/ZoneEdgesScreen.js";

onReadyToLaunch(() => {
  const stringManager = StringManager.getInstance();

  // Simulation-specific preferences; initial values come from habitabilityLabQueryParameters.
  const simPreferences = new HabitabilityLabPreferencesModel(Tandem.ROOT.createTandem("preferences"));

  const screens = [
    new EnergyBalanceScreen({
      name: stringManager.getScreenNames().energyBalanceStringProperty,
      tandem: Tandem.ROOT.createTandem("energyBalanceScreen"),
      backgroundColorProperty: HabitabilityLabColors.backgroundColorProperty,
    }),
    new GreenhouseScreen({
      name: stringManager.getScreenNames().greenhouseStringProperty,
      tandem: Tandem.ROOT.createTandem("greenhouseScreen"),
      backgroundColorProperty: HabitabilityLabColors.backgroundColorProperty,
    }),
    new ZoneEdgesScreen({
      name: stringManager.getScreenNames().zoneEdgesStringProperty,
      tandem: Tandem.ROOT.createTandem("zoneEdgesScreen"),
      backgroundColorProperty: HabitabilityLabColors.backgroundColorProperty,
    }),
    new AgingStarScreen({
      name: stringManager.getScreenNames().agingStarStringProperty,
      tandem: Tandem.ROOT.createTandem("agingStarScreen"),
      backgroundColorProperty: HabitabilityLabColors.backgroundColorProperty,
    }),
    new EscapeScreen({
      name: stringManager.getScreenNames().escapeStringProperty,
      tandem: Tandem.ROOT.createTandem("escapeScreen"),
      backgroundColorProperty: HabitabilityLabColors.backgroundColorProperty,
    }),
  ];

  const sim = new Sim(stringManager.getTitleStringProperty(), screens, {
    preferencesModel: new PreferencesModel({
      visualOptions: {
        // Adds a "Projector Mode" toggle in Preferences → Visual
        supportsProjectorMode: true,
        // Enables keyboard-navigation highlight outlines
        supportsInteractiveHighlights: true,
      },
      simulationOptions: {
        customPreferences: [
          {
            createContent: (tandem: Tandem) => new HabitabilityLabPreferencesNode(simPreferences, tandem),
          },
        ],
      },
      localizationOptions: {
        // Adds a language picker in Preferences → Language
        supportsDynamicLocale: true,
      },
    }),

    // Optional: fill in credits shown in Help → About
    credits: {
      leadDesign: "",
      softwareDevelopment: "",
      team: "",
      qualityAssurance: "",
    },
  });

  sim.start();
});
