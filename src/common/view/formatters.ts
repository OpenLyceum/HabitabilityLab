/**
 * formatters.ts
 *
 * Readout formatting with localized units built from the "{{value}} {{units}}"
 * pattern (so a locale can reorder them): temperatures in kelvin with Celsius
 * alongside, starlight, pressures, distances and times.
 */

import type { TReadOnlyProperty } from "scenerystack/axon";
import { StringUtils } from "scenerystack/phetcommon";
import { StringManager } from "../../i18n/StringManager.js";
import type { BodyKey } from "../model/planets.js";
import { formatSignificant } from "./chartUtils.js";

/** "{{value}} {{units}}" with the localized pattern. */
export function valueWithUnits(value: string, units: string): string {
  return StringUtils.fillIn(StringManager.getInstance().getUnits().valueUnitsPatternStringProperty.value, {
    value: value,
    units: units,
  });
}

/** Rounds to the nearest whole number and writes a true minus sign. */
const formatWhole = (value: number): string => String(Math.round(value)).replace("-", "−");

/** A temperature in kelvin: "288 K". */
export function formatKelvin(kelvin: number): string {
  return valueWithUnits(formatWhole(kelvin), StringManager.getInstance().getUnits().kelvinStringProperty.value);
}

/** A temperature with Celsius alongside: "288 K (15 °C)". */
export function formatTemperature(kelvin: number): string {
  const strings = StringManager.getInstance();
  return StringUtils.fillIn(strings.getCommonStrings().temperaturePatternStringProperty.value, {
    kelvin: formatKelvin(kelvin),
    celsius: valueWithUnits(formatWhole(kelvin - 273.15), strings.getUnits().celsiusStringProperty.value),
  });
}

/** Starlight in Earth units: "1.91 S⊕" (rich text). */
export function formatStarlight(starlightEarth: number): string {
  return valueWithUnits(
    formatSignificant(starlightEarth, 3),
    StringManager.getInstance().getUnits().earthFluxStringProperty.value,
  );
}

/** A flux in W/m², to the watt above 100 W/m² and to three significant figures below. */
export function formatFlux(watts: number): string {
  return valueWithUnits(
    watts >= 100 ? String(Math.round(watts)) : formatSignificant(watts, 3),
    StringManager.getInstance().getUnits().wattsPerSquareMetreStringProperty.value,
  );
}

/** A pressure in bar to two significant figures. */
export function formatBar(bar: number): string {
  return valueWithUnits(formatSignificant(bar, 2), StringManager.getInstance().getUnits().barStringProperty.value);
}

/** A distance in AU to three significant figures. */
export function formatAU(au: number): string {
  return valueWithUnits(formatSignificant(au, 3), StringManager.getInstance().getUnits().auStringProperty.value);
}

/** An age given in Myr: in Myr below 1000, else in Gyr. */
export function formatAge(myr: number): string {
  const units = StringManager.getInstance().getUnits();
  return myr < 1000
    ? valueWithUnits(formatSignificant(myr, 3), units.myrStringProperty.value)
    : valueWithUnits(formatSignificant(myr / 1000, 3), units.gyrStringProperty.value);
}

/** The unit StringProperties a formatter reads, for DerivedProperty dependencies. */
export function unitDependencies(): TReadOnlyProperty<string>[] {
  const strings = StringManager.getInstance();
  const units = strings.getUnits();
  return [
    units.valueUnitsPatternStringProperty,
    units.kelvinStringProperty,
    units.celsiusStringProperty,
    units.earthFluxStringProperty,
    units.wattsPerSquareMetreStringProperty,
    units.barStringProperty,
    units.auStringProperty,
    units.myrStringProperty,
    units.gyrStringProperty,
    strings.getCommonStrings().temperaturePatternStringProperty,
  ];
}

/** The localized name of a Solar System body. */
export function bodyNameProperty(key: BodyKey): TReadOnlyProperty<string> {
  const bodies = StringManager.getInstance().getCommonStrings().bodies;
  return bodies[`${key}StringProperty`];
}
