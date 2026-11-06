/**
 * zoneStatusView.ts
 *
 * The colour and localized description of a habitable-zone status, shared by
 * the Zone Edges and Aging Star screens.
 */

import type { TReadOnlyProperty } from "scenerystack/axon";
import type { ProfileColorProperty } from "scenerystack/scenery";
import HabitabilityLabColors from "../../HabitabilityLabColors.js";
import { StringManager } from "../../i18n/StringManager.js";
import type { ZoneStatus } from "../model/habitableZone.js";

/** Colour of a status: red too hot, blue too cold, green in the conservative zone, pale green optimistic. */
export function zoneStatusColor(status: ZoneStatus): ProfileColorProperty {
  switch (status) {
    case "tooHot":
      return HabitabilityLabColors.tooHotColorProperty;
    case "tooCold":
      return HabitabilityLabColors.tooColdColorProperty;
    case "conservative":
      return HabitabilityLabColors.habitableColorProperty;
    default:
      return HabitabilityLabColors.continuousZoneColorProperty;
  }
}

/** The localized description of a status. */
export function zoneStatusStringProperty(status: ZoneStatus): TReadOnlyProperty<string> {
  return StringManager.getInstance().getCommonStrings().zoneStatus[`${status}StringProperty`];
}

/** Every status string, for DerivedProperty dependencies. */
export function zoneStatusDependencies(): TReadOnlyProperty<string>[] {
  const statuses = StringManager.getInstance().getCommonStrings().zoneStatus;
  return [
    statuses.tooHotStringProperty,
    statuses.optimisticInnerStringProperty,
    statuses.conservativeStringProperty,
    statuses.optimisticOuterStringProperty,
    statuses.tooColdStringProperty,
  ];
}
