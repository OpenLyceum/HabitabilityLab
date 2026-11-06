/**
 * HabitabilityLabPreferencesModel.ts
 *
 * Model for the simulation-specific preferences shown in Preferences →
 * Simulation. Each preference Property takes its initial value from the
 * corresponding query parameter in habitabilityLabQueryParameters.
 *
 * A single instance is shared by every screen (see {@link habitabilityLabPreferences}).
 */

import { BooleanProperty } from "scenerystack/axon";
import { Tandem } from "scenerystack/tandem";
import HabitabilityLabNamespace from "../HabitabilityLabNamespace.js";
import habitabilityLabQueryParameters from "./habitabilityLabQueryParameters.js";

export class HabitabilityLabPreferencesModel {
  /** Show the equations beside the readouts (T_eq, the grey greenhouse, the zone edges, Jeans escape). */
  public readonly showEquationsProperty: BooleanProperty;

  public constructor(tandem?: Tandem) {
    this.showEquationsProperty = new BooleanProperty(
      habitabilityLabQueryParameters.showEquations,
      tandem ? { tandem: tandem.createTandem("showEquationsProperty") } : undefined,
    );
  }

  public reset(): void {
    this.showEquationsProperty.reset();
  }
}

/** The sim-wide preferences, shared by main.ts (the Preferences dialog) and the screen views. */
export const habitabilityLabPreferences = new HabitabilityLabPreferencesModel(Tandem.ROOT.createTandem("preferences"));

HabitabilityLabNamespace.register("HabitabilityLabPreferencesModel", HabitabilityLabPreferencesModel);
