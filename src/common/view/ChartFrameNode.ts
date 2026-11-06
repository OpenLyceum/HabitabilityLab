/**
 * ChartFrameNode.ts
 *
 * A chart frame shared by every chart in the sim: background, gridlines, ticks
 * and tick labels on the left and bottom edges, axis titles, a clipped plot
 * layer for curves and an unclipped overlay layer for markers.
 *
 * Unlike a bamboo ChartTransform, each axis may be logarithmic (pressures,
 * starlight and escape speeds span decades) and/or reversed (the habitable-zone
 * diagram puts high starlight on the left, as in the literature). Callers map
 * with {@link modelToViewX} / {@link modelToViewY} and redraw their curves when
 * {@link axesChangedEmitter} fires. Adapted from TransitHunter's ChartFrameNode.
 */

import { Emitter, type TReadOnlyProperty } from "scenerystack/axon";
import { Shape } from "scenerystack/kite";
import { Node, type NodeOptions, Path, Rectangle, RichText } from "scenerystack/scenery";
import HabitabilityLabColors from "../../HabitabilityLabColors.js";
import { FONTS } from "../../HabitabilityLabConstants.js";
import { decimalPlacesForStep, formatSignificant, formatTickValue, niceStep } from "./chartUtils.js";

/** One axis: its range in model units, and whether it is logarithmic and/or reversed. */
export type AxisSpec = {
  readonly min: number;
  readonly max: number;
  readonly log?: boolean;
  readonly reversed?: boolean;
};

export type ChartFrameNodeOptions = {
  viewWidth: number;
  viewHeight: number;
  xAxis: AxisSpec;
  yAxis: AxisSpec;
  xAxisLabelProperty: TReadOnlyProperty<string>;
  yAxisLabelProperty: TReadOnlyProperty<string>;
  /** Approximate number of grid divisions along a linear axis. */
  targetDivisions?: number;
  nodeOptions?: NodeOptions;
};

type Tick = { readonly value: number; readonly label: boolean };

/** Writes a power-of-ten tick as a plain number when short, else as 10ⁿ. */
export function formatLogTick(value: number): string {
  const exponent = Math.round(Math.log10(value));
  if (Math.abs(value - 10 ** exponent) < 1e-9 * value && (exponent < -3 || exponent > 4)) {
    return `10<sup>${String(exponent).replace("-", "−")}</sup>`;
  }
  return formatSignificant(value, 2);
}

/**
 * Tick values for an axis drawn `lengthPx` long. On a log axis the labels are at 1, 2 and 5 × 10ⁿ
 * when a decade is wide, at every decade otherwise (every other one when decades are very narrow),
 * with unlabelled minor gridlines at 2–9 when there is room. A linear axis gets nice steps.
 */
export function axisTicks(axis: AxisSpec, targetDivisions: number, lengthPx = 300): Tick[] {
  const ticks: Tick[] = [];
  if (axis.log) {
    const lowDecade = Math.floor(Math.log10(axis.min) + 1e-9);
    const highDecade = Math.ceil(Math.log10(axis.max) - 1e-9);
    const pxPerDecade = lengthPx / Math.log10(axis.max / axis.min);
    const decadeStep = pxPerDecade < 22 ? 2 : 1;
    for (let n = lowDecade; n <= highDecade; n++) {
      for (const m of [1, 2, 3, 4, 5, 6, 7, 8, 9]) {
        const value = m * 10 ** n;
        if (value < axis.min * (1 - 1e-9) || value > axis.max * (1 + 1e-9)) {
          continue;
        }
        const label = pxPerDecade >= 140 ? m === 1 || m === 2 || m === 5 : m === 1 && n % decadeStep === 0;
        if (m === 1 || pxPerDecade >= 60) {
          ticks.push({ value: value, label: label });
        }
      }
    }
    return ticks;
  }
  const step = niceStep(axis.max - axis.min, targetDivisions);
  const first = Math.ceil(axis.min / step - 1e-9);
  for (let i = first; i * step <= axis.max + step * 1e-9; i++) {
    ticks.push({ value: i * step, label: true });
  }
  return ticks;
}

export class ChartFrameNode extends Node {
  /** Curves go here; clipped to the plotting rectangle. */
  public readonly plotLayer: Node;

  /** Markers and labels that may overhang the frame go here; not clipped. */
  public readonly overlayLayer: Node;

  /** Fires after either axis changes, so callers can redraw. */
  public readonly axesChangedEmitter = new Emitter();

  public readonly viewWidth: number;
  public readonly viewHeight: number;

  private xAxis: AxisSpec;
  private yAxis: AxisSpec;
  private readonly targetDivisions: number;
  private readonly gridPath: Path;
  private readonly minorGridPath: Path;
  private readonly tickPath: Path;
  private readonly tickLabels: Node;

  public constructor(options: ChartFrameNodeOptions) {
    super();
    this.viewWidth = options.viewWidth;
    this.viewHeight = options.viewHeight;
    this.xAxis = options.xAxis;
    this.yAxis = options.yAxis;
    this.targetDivisions = options.targetDivisions ?? 5;

    const background = new Rectangle(0, 0, this.viewWidth, this.viewHeight, {
      fill: HabitabilityLabColors.chartBackgroundColorProperty,
    });
    const frame = new Rectangle(0, 0, this.viewWidth, this.viewHeight, {
      stroke: HabitabilityLabColors.chartAxisColorProperty,
      lineWidth: 1,
    });
    this.gridPath = new Path(null, { stroke: HabitabilityLabColors.chartGridColorProperty, lineWidth: 1 });
    this.minorGridPath = new Path(null, {
      stroke: HabitabilityLabColors.chartGridColorProperty,
      lineWidth: 0.5,
      opacity: 0.6,
    });
    this.tickPath = new Path(null, { stroke: HabitabilityLabColors.chartAxisColorProperty, lineWidth: 1 });
    this.tickLabels = new Node();
    this.plotLayer = new Node({ clipArea: Shape.rect(0, 0, this.viewWidth, this.viewHeight) });
    this.overlayLayer = new Node();

    const xAxisLabel = new RichText(options.xAxisLabelProperty, {
      font: FONTS.AXIS_LABEL,
      fill: HabitabilityLabColors.textColorProperty,
      maxWidth: this.viewWidth,
    });
    const yAxisLabel = new RichText(options.yAxisLabelProperty, {
      font: FONTS.AXIS_LABEL,
      fill: HabitabilityLabColors.textColorProperty,
      rotation: -Math.PI / 2,
      maxWidth: this.viewHeight,
    });
    const placeAxisLabels = (): void => {
      xAxisLabel.centerX = this.viewWidth / 2;
      xAxisLabel.top = this.viewHeight + 20;
      yAxisLabel.centerY = this.viewHeight / 2;
      const yLabels = this.tickLabels.children.filter((child) => child.centerX < 0);
      const labelsLeft = yLabels.length > 0 ? Math.min(...yLabels.map((child) => child.left)) : 0;
      yAxisLabel.right = Math.min(-30, labelsLeft - 6);
    };
    xAxisLabel.boundsProperty.lazyLink(placeAxisLabels);
    yAxisLabel.boundsProperty.lazyLink(placeAxisLabels);
    this.axesChangedEmitter.addListener(placeAxisLabels);

    this.children = [
      background,
      this.minorGridPath,
      this.gridPath,
      this.plotLayer,
      frame,
      this.tickPath,
      this.tickLabels,
      xAxisLabel,
      yAxisLabel,
      this.overlayLayer,
    ];
    this.redrawAxes();
    placeAxisLabels();
    if (options.nodeOptions) {
      this.mutate(options.nodeOptions);
    }
  }

  public getXAxis(): AxisSpec {
    return this.xAxis;
  }

  public getYAxis(): AxisSpec {
    return this.yAxis;
  }

  /** Replaces one or both axes and redraws the gridlines and labels. */
  public setAxes(xAxis: AxisSpec, yAxis: AxisSpec): void {
    this.xAxis = xAxis;
    this.yAxis = yAxis;
    this.redrawAxes();
  }

  /** Fraction (0 at the low end, 1 at the high end of the drawn axis) of a model value. */
  private static fraction(axis: AxisSpec, value: number): number {
    const f = axis.log
      ? Math.log(value / axis.min) / Math.log(axis.max / axis.min)
      : (value - axis.min) / (axis.max - axis.min);
    return axis.reversed ? 1 - f : f;
  }

  private static fromFraction(axis: AxisSpec, fraction: number): number {
    const f = axis.reversed ? 1 - fraction : fraction;
    return axis.log ? axis.min * (axis.max / axis.min) ** f : axis.min + f * (axis.max - axis.min);
  }

  public modelToViewX(x: number): number {
    return ChartFrameNode.fraction(this.xAxis, x) * this.viewWidth;
  }

  public modelToViewY(y: number): number {
    return (1 - ChartFrameNode.fraction(this.yAxis, y)) * this.viewHeight;
  }

  public viewToModelX(px: number): number {
    return ChartFrameNode.fromFraction(this.xAxis, px / this.viewWidth);
  }

  public viewToModelY(py: number): number {
    return ChartFrameNode.fromFraction(this.yAxis, 1 - py / this.viewHeight);
  }

  /** A polyline through model points, skipping non-finite ones (which break the line). */
  public polyline(points: readonly (readonly [number, number])[]): Shape {
    const shape = new Shape();
    let started = false;
    for (const [x, y] of points) {
      if (!(Number.isFinite(x) && Number.isFinite(y)) || (this.xAxis.log && x <= 0) || (this.yAxis.log && y <= 0)) {
        started = false;
        continue;
      }
      const px = this.modelToViewX(x);
      const py = this.modelToViewY(y);
      if (started) {
        shape.lineTo(px, py);
      } else {
        shape.moveTo(px, py);
        started = true;
      }
    }
    return shape;
  }

  private redrawAxes(): void {
    const grid = new Shape();
    const minorGrid = new Shape();
    const ticks = new Shape();
    for (const child of this.tickLabels.children) {
      child.dispose();
    }
    const labels: Node[] = [];
    const makeLabel = (text: string): RichText =>
      new RichText(text, { font: FONTS.TICK_LABEL, fill: HabitabilityLabColors.textColorProperty });

    const xTicks = axisTicks(this.xAxis, this.targetDivisions, this.viewWidth);
    const xDecimals = this.xAxis.log
      ? 0
      : decimalPlacesForStep(niceStep(this.xAxis.max - this.xAxis.min, this.targetDivisions));
    for (const tick of xTicks) {
      const px = this.modelToViewX(tick.value);
      (tick.label ? grid : minorGrid).moveTo(px, 0).lineTo(px, this.viewHeight);
      if (tick.label) {
        ticks.moveTo(px, this.viewHeight).lineTo(px, this.viewHeight + 5);
        const label = makeLabel(this.xAxis.log ? formatLogTick(tick.value) : formatTickValue(tick.value, xDecimals));
        label.centerX = px;
        label.top = this.viewHeight + 6;
        labels.push(label);
      }
    }
    const yTicks = axisTicks(this.yAxis, this.targetDivisions, this.viewHeight);
    const yDecimals = this.yAxis.log
      ? 0
      : decimalPlacesForStep(niceStep(this.yAxis.max - this.yAxis.min, this.targetDivisions));
    for (const tick of yTicks) {
      const py = this.modelToViewY(tick.value);
      (tick.label ? grid : minorGrid).moveTo(0, py).lineTo(this.viewWidth, py);
      if (tick.label) {
        ticks.moveTo(-5, py).lineTo(0, py);
        const label = makeLabel(this.yAxis.log ? formatLogTick(tick.value) : formatTickValue(tick.value, yDecimals));
        label.right = -7;
        label.centerY = py;
        labels.push(label);
      }
    }
    this.gridPath.shape = grid;
    this.minorGridPath.shape = minorGrid;
    this.tickPath.shape = ticks;
    this.tickLabels.children = labels;
    this.axesChangedEmitter.emit();
  }
}
