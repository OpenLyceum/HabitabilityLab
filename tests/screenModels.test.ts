/**
 * screenModels.test.ts
 *
 * Behaviour of the screen models: presets, derived readouts, and the Aging Star
 * history (zone status over time, engulfment, tidal locking, the continuously
 * habitable zone).
 */

import { describe, expect, it } from "vitest";
import { AgingStarModel, computeHistory, continuouslyHabitableZone } from "../src/aging-star/model/AgingStarModel.js";
import { nearestTrack } from "../src/common/model/stellarTracks.js";
import { EnergyBalanceModel } from "../src/energy-balance/model/EnergyBalanceModel.js";
import { EscapeModel } from "../src/escape/model/EscapeModel.js";
import { GreenhouseModel } from "../src/greenhouse/model/GreenhouseModel.js";
import { ZoneEdgesModel } from "../src/zone-edges/model/ZoneEdgesModel.js";

describe("Energy Balance model", () => {
  it("settles Earth at 255 K and marks slider changes as custom", () => {
    const model = new EnergyBalanceModel();
    for (let i = 0; i < 600; i++) {
      model.step(0.1);
    }
    expect(model.temperatureProperty.value).toBeCloseTo(254.6, 0);
    expect(model.trendProperty.value).toBe("balanced");
    model.albedoProperty.value = 0.5;
    expect(model.presetProperty.value).toBe("custom");
    expect(model.measuredTemperatureProperty.value).toBeNull();
    model.presetProperty.value = "venus";
    expect(model.distanceProperty.value).toBe(0.723);
    expect(model.measuredTemperatureProperty.value).toBe(737);
  });
});

describe("Greenhouse model", () => {
  it("reproduces the presets' phases", () => {
    const model = new GreenhouseModel();
    expect(model.surfaceTemperatureProperty.value).toBeCloseTo(288, 0);
    expect(model.phaseProperty.value).toBe("liquid");
    model.presetProperty.value = "venus";
    expect(model.surfaceTemperatureProperty.value).toBeCloseTo(737, 0);
    expect(model.phaseProperty.value).toBe("vapour");
    model.presetProperty.value = "mars";
    expect(model.phaseProperty.value).toBe("ice");
    model.presetProperty.value = "earlyMars";
    expect(model.phaseProperty.value).toBe("ice");
    model.reset();
    expect(model.presetProperty.value).toBe("earth");
    expect(model.phaseProperty.value).toBe("liquid");
  });
});

describe("Zone Edges model", () => {
  it("starts on TRAPPIST-1 e in the conservative zone", () => {
    const model = new ZoneEdgesModel();
    expect(model.selectedPlanetProperty.value?.name).toBe("TRAPPIST-1 e");
    expect(model.selectedStatusProperty.value).toBe("conservative");
    expect(model.starLuminosityProperty.value).toBeCloseTo(0.00055, 4);
  });

  it("switches star with a planet and picks Earth for the Sun", () => {
    const model = new ZoneEdgesModel();
    model.selectByName("Kepler-452 b");
    expect(model.systemProperty.value.key).toBe("Kepler-452");
    model.systemProperty.value = ZoneEdgesModel.systemOf("TRAPPIST-1 b") ?? model.systemProperty.value;
    model.selectByName("Proxima Cen b");
    expect(model.selectedStatusProperty.value).toBe("conservative");
  });
});

describe("Aging Star", () => {
  it("keeps Earth in the conservative zone until about 1 Gyr from now, and never engulfs it", () => {
    const sun = nearestTrack(1);
    const history = computeHistory(sun, 1);
    const leaves = history.rows.find((row) => row.star.ageMyr > 4600 && row.status !== "conservative");
    expect(leaves?.star.ageMyr).toBeGreaterThan(5100);
    expect(leaves?.star.ageMyr).toBeLessThan(6600);
    expect(history.engulfAge).toBe(Number.POSITIVE_INFINITY);
    expect(history.lockAge).toBe(Number.POSITIVE_INFINITY);
  });

  it("engulfs a close planet in the giant phase", () => {
    const history = computeHistory(nearestTrack(1), 0.3);
    expect(history.engulfAge).toBeGreaterThan(10000);
    expect(history.engulfAge).toBeLessThan(12100);
  });

  it("gives Earth's distance a continuously habitable zone for the last 4 Gyr today", () => {
    const sun = nearestTrack(1);
    const history = computeHistory(sun, 1);
    const chz = continuouslyHabitableZone(history, sun, 4600, 4000);
    expect(chz).not.toBeNull();
    expect(chz?.inner).toBeLessThan(1);
    expect(chz?.outer).toBeGreaterThan(1);
    expect(continuouslyHabitableZone(history, sun, 1000, 4000)).toBeNull();
  });

  it("plays to the end of the window and stops", () => {
    const model = new AgingStarModel();
    model.timer.isPlayingProperty.value = true;
    for (let i = 0; i < 500; i++) {
      model.step(0.1);
    }
    expect(model.timer.isPlayingProperty.value).toBe(false);
    expect(model.ageProperty.value).toBeCloseTo(model.windowProperty.value.max, 6);
    expect(model.stageProperty.value).toBe("whiteDwarf");
  });

  it("applies presets and resets the age when the star changes", () => {
    const model = new AgingStarModel();
    model.setAge(3000);
    model.presetProperty.value = "redDwarf";
    expect(model.trackProperty.value.mass).toBe(0.3);
    expect(model.ageProperty.value).toBe(0);
    expect(model.statusProperty.value).toBe("conservative");
    model.distanceProperty.value = 0.2;
    expect(model.presetProperty.value).toBe("custom");
  });
});

describe("Escape model", () => {
  it("keeps Earth's air and loses the Moon's", () => {
    const model = new EscapeModel();
    expect(model.retainedProperty.value).toBe(true);
    expect(model.retainedGasesProperty.value).toEqual(["h2o", "n2", "o2", "co2"]);
    model.presetProperty.value = "moon";
    model.gasProperty.value = "h2";
    expect(model.retainedProperty.value).toBe(false);
    expect(10 ** model.log10EscapingFractionProperty.value).toBeCloseTo(0.139, 2);
    model.temperatureProperty.value = 300;
    expect(model.presetProperty.value).toBe("custom");
  });

  it("lets fast molecules escape and keeps slow ones bound", () => {
    const model = new EscapeModel();
    model.presetProperty.value = "moon";
    model.gasProperty.value = "h2";
    for (let i = 0; i < 200; i++) {
      model.step(0.05);
    }
    expect(model.escapedCountProperty.value).toBeGreaterThan(0);
    for (const molecule of model.molecules) {
      expect(molecule.r).toBeGreaterThanOrEqual(0.99);
    }
    model.reset();
    for (let i = 0; i < 200; i++) {
      model.step(0.05);
    }
    expect(model.escapedCountProperty.value).toBe(0);
  });
});
