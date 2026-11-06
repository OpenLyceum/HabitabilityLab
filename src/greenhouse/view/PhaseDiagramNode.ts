/**
 * PhaseDiagramNode.ts
 *
 * The phase diagram of water: surface temperature (linear) against surface
 * pressure (log), with the ice, liquid, vapour and supercritical regions shaded
 * from the IAPWS curves, the triple and critical points marked, Venus, Earth and
 * Mars as reference dots, and the planet's surface as a larger dot.
 */

import { Multilink, type TReadOnlyProperty } from "scenerystack/axon";
import { Shape } from "scenerystack/kite";
import { Circle, Node, Path, Rectangle, Text } from "scenerystack/scenery";
import { SOLAR_PLANETS } from "../../common/model/planets.js";
import { meltingTemperature, saturationPressure, sublimationPressure } from "../../common/model/water.js";
import { ChartFrameNode } from "../../common/view/ChartFrameNode.js";
import { bodyNameProperty } from "../../common/view/formatters.js";
import HabitabilityLabColors from "../../HabitabilityLabColors.js";
import {
  FONTS,
  PA_PER_BAR,
  WATER_CRITICAL_POINT_K,
  WATER_CRITICAL_POINT_PA,
  WATER_TRIPLE_POINT_K,
  WATER_TRIPLE_POINT_PA,
} from "../../HabitabilityLabConstants.js";
import { StringManager } from "../../i18n/StringManager.js";
import type { GreenhouseModel } from "../model/GreenhouseModel.js";

const T_MIN = 150;
const T_MAX = 800;
const P_MIN_BAR = 1e-4;
const P_MAX_BAR = 1000;
const SAMPLES = 120;

export class PhaseDiagramNode extends Node {
  public constructor(model: GreenhouseModel, width: number, height: number) {
    super();
    const strings = StringManager.getInstance().getGreenhouseStrings();

    const chart = new ChartFrameNode({
      viewWidth: width,
      viewHeight: height,
      xAxis: { min: T_MIN, max: T_MAX },
      yAxis: { min: P_MIN_BAR, max: P_MAX_BAR, log: true },
      xAxisLabelProperty: strings.temperatureAxisStringProperty,
      yAxisLabelProperty: strings.pressureAxisStringProperty,
    });
    const x = (kelvin: number): number => chart.modelToViewX(kelvin);
    const y = (bar: number): number => chart.modelToViewY(Math.min(Math.max(bar, P_MIN_BAR / 10), P_MAX_BAR * 10));

    const tripleBar = WATER_TRIPLE_POINT_PA / PA_PER_BAR;
    const criticalBar = WATER_CRITICAL_POINT_PA / PA_PER_BAR;

    // Melting line from the triple point to the top of the chart.
    const meltingPoints: [number, number][] = [];
    for (let i = 0; i <= SAMPLES; i++) {
      const bar = tripleBar * (P_MAX_BAR / tripleBar) ** (i / SAMPLES);
      meltingPoints.push([meltingTemperature(bar * PA_PER_BAR), bar]);
    }
    // Sublimation curve from the left edge to the triple point.
    const sublimationPoints: [number, number][] = [];
    for (let i = 0; i <= SAMPLES; i++) {
      const kelvin = T_MIN + ((WATER_TRIPLE_POINT_K - T_MIN) * i) / SAMPLES;
      sublimationPoints.push([kelvin, sublimationPressure(kelvin) / PA_PER_BAR]);
    }
    // Boiling curve from the triple point to the critical point.
    const boilingPoints: [number, number][] = [];
    for (let i = 0; i <= SAMPLES; i++) {
      const kelvin = WATER_TRIPLE_POINT_K + ((WATER_CRITICAL_POINT_K - WATER_TRIPLE_POINT_K) * i) / SAMPLES;
      boilingPoints.push([kelvin, saturationPressure(kelvin) / PA_PER_BAR]);
    }

    const polygon = (points: readonly (readonly [number, number])[]): Shape => {
      const shape = new Shape();
      points.forEach(([kelvin, bar], i) => {
        if (i === 0) {
          shape.moveTo(x(kelvin), y(bar));
        } else {
          shape.lineTo(x(kelvin), y(bar));
        }
      });
      return shape.close();
    };

    const vapourRegion = new Rectangle(0, 0, width, height, { fill: HabitabilityLabColors.vapourRegionColorProperty });
    const iceRegion = new Path(
      polygon([[T_MIN, P_MIN_BAR / 10], ...sublimationPoints, ...meltingPoints, [T_MIN, P_MAX_BAR * 10]]),
      { fill: HabitabilityLabColors.iceRegionColorProperty },
    );
    const liquidRegion = new Path(
      polygon([...boilingPoints, [WATER_CRITICAL_POINT_K, P_MAX_BAR * 10], ...[...meltingPoints].reverse()]),
      { fill: HabitabilityLabColors.liquidRegionColorProperty },
    );
    const supercriticalRegion = new Rectangle(
      x(WATER_CRITICAL_POINT_K),
      0,
      width - x(WATER_CRITICAL_POINT_K),
      y(criticalBar),
      {
        fill: HabitabilityLabColors.supercriticalRegionColorProperty,
      },
    );
    const boundaryShape = new Shape();
    for (const points of [sublimationPoints, meltingPoints, boilingPoints]) {
      points.forEach(([kelvin, bar], i) => {
        if (i === 0) {
          boundaryShape.moveTo(x(kelvin), y(bar));
        } else {
          boundaryShape.lineTo(x(kelvin), y(bar));
        }
      });
    }
    const boundaries = new Path(boundaryShape, {
      stroke: HabitabilityLabColors.phaseBoundaryColorProperty,
      lineWidth: 1.5,
    });

    const regionLabel = (
      stringProperty: TReadOnlyProperty<string>,
      kelvin: number,
      bar: number,
      maxWidth = 100,
    ): Text => {
      const text = new Text(stringProperty, {
        font: FONTS.LABEL,
        fill: HabitabilityLabColors.textColorProperty,
        opacity: 0.85,
        maxWidth: maxWidth,
      });
      text.boundsProperty.link(() => {
        text.centerX = x(kelvin);
        text.centerY = y(bar);
      });
      return text;
    };
    const labels = [
      regionLabel(strings.iceStringProperty, 200, 30, 50),
      regionLabel(strings.liquidStringProperty, 380, 100),
      regionLabel(strings.vapourStringProperty, 500, 0.003),
      regionLabel(
        strings.supercriticalStringProperty,
        (WATER_CRITICAL_POINT_K + T_MAX) / 2,
        500,
        x(T_MAX) - x(WATER_CRITICAL_POINT_K) - 8,
      ),
    ];

    const pointMarker = (
      kelvin: number,
      bar: number,
      stringProperty: TReadOnlyProperty<string>,
      labelBelow: boolean,
      labelLeft: boolean,
    ): Node => {
      const dot = new Circle(3, { fill: HabitabilityLabColors.phaseBoundaryColorProperty, x: x(kelvin), y: y(bar) });
      const text = new Text(stringProperty, {
        font: FONTS.SMALL,
        fill: HabitabilityLabColors.textColorProperty,
        maxWidth: 90,
      });
      text.boundsProperty.link(() => {
        if (labelLeft) {
          text.right = dot.x - 6;
        } else {
          text.left = dot.x + 6;
        }
        if (labelBelow) {
          text.top = dot.y + 3;
        } else {
          text.bottom = dot.y - 3;
        }
      });
      return new Node({ children: [dot, text] });
    };
    const triple = pointMarker(WATER_TRIPLE_POINT_K, tripleBar, strings.triplePointStringProperty, true, false);
    const critical = pointMarker(WATER_CRITICAL_POINT_K, criticalBar, strings.criticalPointStringProperty, false, true);

    // Venus, Earth and Mars as they are measured today.
    const references = SOLAR_PLANETS.filter((planet) => planet.surfacePressure > 0).map((planet) => {
      const dot = new Circle(3.5, {
        stroke: HabitabilityLabColors.earthColorProperty,
        lineWidth: 1.5,
        x: x(planet.surfaceTemperature),
        y: y(planet.surfacePressure),
      });
      const name = new Text(bodyNameProperty(planet.key), {
        font: FONTS.SMALL,
        fill: HabitabilityLabColors.earthColorProperty,
        maxWidth: 60,
      });
      name.boundsProperty.link(() => {
        name.right = dot.x - 5;
        name.centerY = dot.y;
      });
      return new Node({ children: [dot, name] });
    });

    const planetDot = new Circle(7, {
      fill: HabitabilityLabColors.planetColorProperty,
      stroke: HabitabilityLabColors.selectedColorProperty,
      lineWidth: 2,
    });
    Multilink.multilink([model.surfaceTemperatureProperty, model.pressureProperty], (kelvin, bar) => {
      planetDot.x = Math.min(width, Math.max(0, x(kelvin)));
      planetDot.y = y(bar);
    });

    chart.plotLayer.children = [vapourRegion, iceRegion, liquidRegion, supercriticalRegion, boundaries, ...labels];
    chart.overlayLayer.children = [triple, critical, ...references, planetDot];
    this.children = [chart];
  }
}
