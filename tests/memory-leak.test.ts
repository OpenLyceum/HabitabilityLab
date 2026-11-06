/**
 * Memory-leak regression suite (fleet standard).
 *
 * List every model/view object that links Properties, adds listeners, or owns child
 * nodes, with a factory that builds a fresh instance. The shared harness in
 * tests/helpers/memoryLeak.ts (template-owned) checks that each one is garbage
 * collected after dispose() and leaves no survivors across repeated cycles
 * (idempotentDispose: true also checks a second dispose()). Add sim-specific leak
 * tests below using forceGC().
 *
 * The sim's only runtime-disposed objects are the Zone Edges planet radio groups (rebuilt when
 * the star changes) and the star and orbit nodes redrawn in the top views.
 */

import { Property } from "scenerystack/axon";
import { TimeModel } from "../src/common/TimeModel.js";
import { createRadioGroup } from "../src/common/view/controls.js";
import { StarNode } from "../src/common/view/StarNode.js";
import { describeDisposalLeaks } from "./helpers/memoryLeak.js";

const choiceProperty = new Property<string>("a");

describeDisposalLeaks([
  { name: "TimeModel", create: () => new TimeModel(), idempotentDispose: true },
  {
    name: "planet radio group",
    create: () =>
      createRadioGroup(
        choiceProperty,
        [
          { value: "a", labelProperty: "Planet a" },
          { value: "b", labelProperty: "Planet b" },
        ],
        new Property("Planet"),
      ),
  },
  { name: "StarNode", create: () => new StarNode(10, 5772) },
]);
