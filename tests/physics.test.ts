/**
 * physics.test.ts
 *
 * Checks the physics modules against the numbers quoted in doc/model.md:
 * equilibrium temperatures, the grey greenhouse, IAPWS water curves, Kopparapu
 * edges, stellar tracks, tidal locking and Jeans escape.
 */

import { describe, expect, it } from "vitest";
import {
  absorbedFlux,
  equilibriumTemperature,
  greenhouseSurfaceTemperature,
  opticalDepthFor,
  relaxationTimeYears,
  starlight,
  stepTemperature,
} from "../src/common/model/climate.js";
import {
  fractionFasterThan,
  isRetained,
  jeansParameter,
  log10FractionFasterThan,
  shorelineEscapeSpeed,
  shorelineStarlight,
} from "../src/common/model/escape.js";
import { dwarfStar, edgeDistance, edgeStarlight, zoneStatus } from "../src/common/model/habitableZone.js";
import { CURATED_PLANETS, SHORELINE_BODIES, SHORELINE_PLANETS } from "../src/common/model/planets.js";
import { mainSequenceEndMyr, nearestTrack, sampleTrack } from "../src/common/model/stellarTracks.js";
import { tidalLockDistance, tidalLockYears } from "../src/common/model/tidalLock.js";
import { meltingTemperature, saturationPressure, sublimationPressure, waterPhase } from "../src/common/model/water.js";

describe("energy balance", () => {
  it("gives the quoted bare-rock temperatures", () => {
    expect(equilibriumTemperature(1, 0.3)).toBeCloseTo(254.6, 0);
    expect(equilibriumTemperature(starlight(1, 0.723), 0.76)).toBeCloseTo(229, 0);
    expect(equilibriumTemperature(starlight(1, 1.524), 0.25)).toBeCloseTo(210, 0);
    expect(equilibriumTemperature(starlight(1, 0.387), 0.088)).toBeCloseTo(437, 0);
  });

  it("is hotter by 2^¼ when only the day side radiates", () => {
    const ratio = equilibriumTemperature(1, 0.3, "daySide") / equilibriumTemperature(1, 0.3);
    expect(ratio).toBeCloseTo(2 ** 0.25, 6);
  });

  it("relaxes in about 3.4 years near Earth's equilibrium", () => {
    expect(relaxationTimeYears(255)).toBeCloseTo(3.4, 1);
  });

  it("settles to equilibrium from cold and from hot", () => {
    const absorbed = absorbedFlux(1, 0.3);
    expect(stepTemperature(150, absorbed, 60)).toBeCloseTo(254.6, 1);
    expect(stepTemperature(700, absorbed, 60)).toBeCloseTo(254.6, 1);
  });
});

describe("grey greenhouse", () => {
  it("reproduces Earth, Venus and Mars with the quoted optical depths", () => {
    expect(greenhouseSurfaceTemperature(254.6, 0.85)).toBeCloseTo(288, 0);
    expect(opticalDepthFor(737, equilibriumTemperature(starlight(1, 0.723), 0.76))).toBeCloseTo(141.5, 0);
    expect(greenhouseSurfaceTemperature(210, 0)).toBe(210);
  });
});

describe("water", () => {
  it("boils at 1 atm at 373.12 K and meets ice at the triple point", () => {
    expect(saturationPressure(373.124)).toBeCloseTo(101324, -1);
    expect(saturationPressure(273.16)).toBeCloseTo(611.657, 0);
    expect(sublimationPressure(273.16)).toBeCloseTo(611.657, 0);
    expect(sublimationPressure(200)).toBeCloseTo(0.1626, 3);
  });

  it("melts 1.5 K lower at 200 bar", () => {
    expect(meltingTemperature(611.657)).toBeCloseTo(273.16, 3);
    expect(meltingTemperature(200e5)).toBeCloseTo(271.61, 1);
  });

  it("classifies the planets", () => {
    expect(waterPhase(288, 1.013e5)).toBe("liquid");
    expect(waterPhase(737, 92e5)).toBe("vapour");
    expect(waterPhase(210, 600)).toBe("ice");
    expect(waterPhase(280, 600)).toBe("vapour"); // warm Mars: below the triple point, no liquid
    expect(waterPhase(700, 300e5)).toBe("supercritical");
    expect(waterPhase(150, 1e-6)).toBe("vapour");
  });
});

describe("habitable zone", () => {
  it("puts the Sun's edges where Kopparapu et al. do", () => {
    expect(edgeDistance("runawayGreenhouse", 1, 5772)).toBeCloseTo(0.95, 2);
    expect(edgeDistance("maximumGreenhouse", 1, 5772)).toBeCloseTo(1.68, 2);
    expect(edgeDistance("recentVenus", 1, 5772)).toBeCloseTo(0.75, 2);
    expect(edgeDistance("earlyMars", 1, 5772)).toBeCloseTo(1.77, 2);
  });

  it("moves the runaway edge with planet mass", () => {
    expect(edgeStarlight("runawayGreenhouse", 5772, 5)).toBeGreaterThan(edgeStarlight("runawayGreenhouse", 5772, 1));
    expect(edgeStarlight("runawayGreenhouse", 5772, 0.1)).toBeLessThan(edgeStarlight("runawayGreenhouse", 5772, 1));
  });

  it("classifies the Solar System and TRAPPIST-1 e", () => {
    expect(zoneStatus(1, 5772)).toBe("conservative");
    expect(zoneStatus(1.91, 5772)).toBe("tooHot");
    expect(zoneStatus(0.431, 5772)).toBe("conservative");
    expect(zoneStatus(0.646, 2566)).toBe("conservative");
  });

  it("gives a Sun-like dwarf at 5770 K", () => {
    const star = dwarfStar(5770);
    expect(star.luminosity).toBeCloseTo(1, 3);
    expect(star.spectralType).toBe("G2 V");
  });
});

describe("stellar tracks", () => {
  const sun = nearestTrack(1);

  it("brightens the Sun from 0.74 to 1 L☉ by 4.6 Gyr", () => {
    expect(sun.mass).toBe(1);
    expect(sampleTrack(sun, 0).luminosity).toBeCloseTo(0.74, 2);
    expect(sampleTrack(sun, 4600).luminosity).toBeGreaterThan(0.95);
    expect(sampleTrack(sun, 4600).luminosity).toBeLessThan(1.05);
    expect(mainSequenceEndMyr(sun)).toBeCloseTo(10630, -1);
  });

  it("pushes Earth past the runaway edge roughly 1 Gyr from now", () => {
    let age = 4600;
    while (age < 10000) {
      const star = sampleTrack(sun, age);
      if (star.luminosity > edgeStarlight("runawayGreenhouse", star.temperature)) {
        break;
      }
      age += 10;
    }
    expect(age - 4600).toBeGreaterThan(500);
    expect(age - 4600).toBeLessThan(2000);
  });

  it("snaps to the nearest catalog mass", () => {
    expect(nearestTrack(0.61).mass).toBe(0.6);
    expect(nearestTrack(1.04).mass).toBe(1);
  });
});

describe("tidal locking", () => {
  it("scales with the inverse square of stellar mass at fixed orbit", () => {
    expect(tidalLockYears(0.1, 0.3) / tidalLockYears(0.1, 0.6)).toBeCloseTo(4, 10);
    // Independent evaluation of Gladman's full relation with the documented Earth-like inputs.
    expect(tidalLockYears(0.1, 0.3)).toBeCloseTo(815080, -1);
    expect(tidalLockYears(1, 1)).toBeGreaterThan(7e10);
  });

  it("gives the quoted orders of magnitude", () => {
    expect(Math.log10(tidalLockYears(0.0293, 0.09))).toBeCloseTo(3.76, 1);
    expect(Math.log10(tidalLockYears(0.1, 0.3))).toBeCloseTo(5.91, 1);
    expect(tidalLockDistance(tidalLockYears(0.2, 0.5), 0.5)).toBeCloseTo(0.2, 6);
  });
});

describe("escape", () => {
  it("matches the rule of thumb with exosphere temperatures", () => {
    const earth = 11186;
    expect(isRetained(earth, 1000, 28.014)).toBe(true);
    expect(isRetained(earth, 1000, 18.015)).toBe(true);
    expect(isRetained(earth, 1000, 4.003)).toBe(false);
    expect(isRetained(earth, 1000, 2.016)).toBe(false);
    expect(isRetained(2380, 250, 28.014)).toBe(false); // the Moon
  });

  it("computes the Jeans parameter and tail", () => {
    expect(jeansParameter(11186, 1000, 2.016)).toBeCloseTo(15.2, 1);
    expect(fractionFasterThan(11186, 1000, 2.016)).toBeCloseTo(1.17e-6, 7);
    expect(fractionFasterThan(0, 300, 28)).toBeCloseTo(1, 6);
    // Far tail: log stays finite and continuous across the switch to the asymptotic form.
    expect(log10FractionFasterThan(11186, 288, 44.01)).toBeLessThan(-400);
    expect(Number.isFinite(log10FractionFasterThan(60000, 50, 44.01))).toBe(true);
  });

  it("places the Solar System on the right sides of the shoreline", () => {
    for (const body of SHORELINE_BODIES) {
      if (body.key === "mars") {
        continue; // sits on the line, as in Zahnle & Catling
      }
      const above = body.escapeSpeed > shorelineEscapeSpeed(body.insolation);
      expect(above, body.key).toBe(body.hasAtmosphere);
    }
    expect(shorelineStarlight(6.5)).toBeCloseTo(1, 10);
  });
});

describe("planet data", () => {
  it("has the curated planets with starlight and star temperatures", () => {
    expect(CURATED_PLANETS.length).toBeGreaterThan(20);
    for (const planet of CURATED_PLANETS) {
      expect(planet.insolation, planet.name).toBeGreaterThan(0);
      expect(planet.starTemperature, planet.name).toBeGreaterThan(2000);
    }
    for (const name of ["Kepler-62 c", "Kepler-62 e", "Kepler-62 f", "Kepler-37 b"]) {
      expect(
        SHORELINE_PLANETS.some((p) => p.name === name),
        name,
      ).toBe(false);
    }
    const upperBound = CURATED_PLANETS.find((p) => p.name === "Kepler-62 f");
    expect(upperBound?.mass).toBe(35);
    expect(upperBound?.massLimit).toBe(1);
    expect(upperBound?.massMeasured).toBe(false);
    expect(SHORELINE_PLANETS.some((p) => p.name === "LHS 3844 b")).toBe(true);
  });
});
