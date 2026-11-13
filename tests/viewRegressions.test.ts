import { expect, it } from "vitest";
import { AgingStarModel } from "../src/aging-star/model/AgingStarModel.js";
import { TimelineNode } from "../src/aging-star/view/TimelineNode.js";
import { ChartFrameNode } from "../src/common/view/ChartFrameNode.js";
import { EnergyBalanceModel } from "../src/energy-balance/model/EnergyBalanceModel.js";
import { TemperatureHistoryNode } from "../src/energy-balance/view/TemperatureHistoryNode.js";
import {
  ALBEDO_RANGE,
  ENERGY_DISTANCE_RANGE,
  HISTORY_YEARS,
  LUMINOSITY_RANGE,
  TEMPERATURE_DISPLAY_RANGE,
} from "../src/HabitabilityLabConstants.js";
import { StringManager } from "../src/i18n/StringManager.js";
import { forceGC } from "./helpers/memoryLeak.js";

it("collects replaced timeline milestones while their localized string remains live", async () => {
  const model = new AgingStarModel();
  const timeline = new TimelineNode(model, 400, 200);
  const chart = timeline.children[0];
  if (!(chart instanceof ChartFrameNode)) {
    throw new Error("Timeline chart missing");
  }
  const markers = chart.overlayLayer.children[1];
  if (!markers) {
    throw new Error("Milestone layer missing");
  }
  // Capture the old labels without keeping strong references to them in this test's frame.
  const oldLabels = (): WeakRef<object>[] =>
    markers.children.map((marker) => {
      const text = marker.children[1];
      if (!text) {
        throw new Error("Milestone label missing");
      }
      return new WeakRef(text);
    });
  const labels = oldLabels();
  const strings = StringManager.getInstance().getAgingStarStrings();
  for (let i = 0; i < 20; i++) {
    model.zoomLateProperty.value = !model.zoomLateProperty.value;
    model.distanceProperty.value = i % 2 === 0 ? 0.3 : 1;
  }
  await forceGC(labels);
  expect(labels.every((label) => label.deref() === undefined)).toBe(true);
  // Keep both the source and owner alive until after GC; disposing them would mask the leak.
  expect(strings.msEndStringProperty.value.length).toBeGreaterThan(0);
  expect(timeline.isDisposed).toBe(false);
});

it("keeps extreme temperatures and their reference lines within the real history chart", () => {
  const model = new EnergyBalanceModel();
  model.timer.isPlayingProperty.value = false;
  const view = new TemperatureHistoryNode(model, 320, 230);
  const chart = view.children[0];
  if (!(chart instanceof ChartFrameNode)) {
    throw new Error("Temperature chart missing");
  }
  model.luminosityProperty.value = LUMINOSITY_RANGE.max;
  model.distanceProperty.value = ENERGY_DISTANCE_RANGE.min;
  model.albedoProperty.value = ALBEDO_RANGE.min;
  for (const spread of ["wholePlanet", "daySide"] as const) {
    model.heatSpreadProperty.value = spread;
    model.jumpToEquilibrium();
    model.advance(1);
    const temperature = model.temperatureProperty.value;
    expect(temperature).toBeGreaterThan(1500);
    expect(chart.getYAxis().max).toBeGreaterThan(temperature);
    expect(TEMPERATURE_DISPLAY_RANGE.contains(temperature)).toBe(true);
    const reference = chart.plotLayer.children[0];
    const curve = chart.plotLayer.children[2];
    expect(reference?.centerY).toBeCloseTo(chart.modelToViewY(temperature), 6);
    expect(curve?.top).toBeGreaterThanOrEqual(0);
    expect(curve?.bottom).toBeLessThanOrEqual(chart.viewHeight);
  }
  model.presetProperty.value = "earth";
  model.heatSpreadProperty.value = "wholePlanet";
  // Retain an axis large enough for hot samples until they leave the history window.
  expect(chart.getYAxis().max).toBeGreaterThan(1800);
  model.jumpToEquilibrium();
  model.advance(HISTORY_YEARS + 1);
  model.advance(1);
  expect(chart.getYAxis().max).toBe(400);
  model.reset();
  expect(chart.getYAxis().max).toBe(400);
});
