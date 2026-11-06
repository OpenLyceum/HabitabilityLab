/**
 * habitabilityLabQueryParameters.ts
 *
 * Sim-specific startup query parameters. This is the single place where every
 * sim-specific query parameter is declared and documented. Public-facing
 * parameters (intended for end users / sharing links) set `public: true`.
 *
 * Usage: append e.g. `?showEquations` to the sim URL.
 */

import { logGlobal } from "scenerystack/phet-core";
import { QueryStringMachine } from "scenerystack/query-string-machine";
import HabitabilityLabNamespace from "../HabitabilityLabNamespace.js";

const habitabilityLabQueryParameters = QueryStringMachine.getAll({
  /**
   * Shows the equations (energy balance, greenhouse, zone edges, escape) beside the readouts.
   * Off by default because the sim is pitched at introductory astronomy.
   */
  showEquations: {
    type: "flag",
    public: true,
  },
});

HabitabilityLabNamespace.register("habitabilityLabQueryParameters", habitabilityLabQueryParameters);

// Log query parameters (for the console / PhET-iO).
logGlobal("phet.chipper.queryParameters");

export default habitabilityLabQueryParameters;
