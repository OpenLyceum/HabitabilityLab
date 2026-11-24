/**
 * HabitabilityLabPreferencesModel.ts
 *
 * Model for the simulation-specific preferences shown in Preferences →
 * Simulation. Each preference Property takes its initial value from the
 * corresponding query parameter in habitabilityLabQueryParameters.
 *
 * main.ts shares one instance with the dialog and screens.
 */

import { BooleanProperty } from "scenerystack/axon";
import type { Tandem } from "scenerystack/tandem";
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

HabitabilityLabNamespace.register("HabitabilityLabPreferencesModel", HabitabilityLabPreferencesModel);
