import { roundSymmetric } from "scenerystack/dot";
import { FORMATTERS_SETTINGS } from "../../HabitabilityLabConstants.js";
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
const formatWhole = (value: number): string => String(roundSymmetric(value)).replace("-", "−");

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
    formatSignificant(starlightEarth, FORMATTERS_SETTINGS.FORMAT_STARLIGHT_DIGITS),
    StringManager.getInstance().getUnits().earthFluxStringProperty.value,
  );
}

/** A flux in W/m², to the watt above 100 W/m² and to three significant figures below. */
export function formatFlux(watts: number): string {
  return valueWithUnits(
    watts >= 100 ? String(roundSymmetric(watts)) : formatSignificant(watts, FORMATTERS_SETTINGS.FORMAT_FLUX_DIGITS),
    StringManager.getInstance().getUnits().wattsPerSquareMetreStringProperty.value,
  );
}

/** A distance in AU to three significant figures. */
export function formatAU(au: number): string {
  return valueWithUnits(
    formatSignificant(au, FORMATTERS_SETTINGS.FORMAT_AU_DIGITS),
    StringManager.getInstance().getUnits().auStringProperty.value,
  );
}

/** An age given in Myr: in Myr below 1000, else in Gyr. */
export function formatAge(myr: number): string {
  const units = StringManager.getInstance().getUnits();
  return myr < 1000
    ? valueWithUnits(formatSignificant(myr, FORMATTERS_SETTINGS.FORMAT_AGE_DIGITS), units.myrStringProperty.value)
    : valueWithUnits(
        formatSignificant(myr / 1000, FORMATTERS_SETTINGS.FORMAT_AGE_DIGITS),
        units.gyrStringProperty.value,
      );
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

/**
 * A fraction given as its log₁₀, readable across hundreds of decades: plainly down to 10⁻⁴
 * ("0.14"), as a power of ten below ("1.2 × 10<sup>−6</sup>", rich text).
 */
export function formatPowerFraction(log10: number): string {
  if (!Number.isFinite(log10)) {
    return "0";
  }
  if (log10 >= -4) {
    return formatSignificant(10 ** log10, FORMATTERS_SETTINGS.FORMAT_POWER_FRACTION_DIGITS);
  }
  const exponent = Math.floor(log10);
  let mantissa = Number((10 ** (log10 - exponent)).toPrecision(FORMATTERS_SETTINGS.MANTISSA_SIGNIFICANT_FIGURES));
  let shown = exponent;
  if (mantissa >= 10) {
    mantissa = 1;
    shown += 1;
  }
  return `${mantissa} × 10<sup>${String(shown).replace("-", "−")}</sup>`;
}
