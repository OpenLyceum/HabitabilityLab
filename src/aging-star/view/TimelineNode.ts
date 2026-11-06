/**
 * TimelineNode.ts
 *
 * The star's life along a time axis: luminosity (log) against age, a strip
 * above it coloured by the planet's zone status at each age (grey once it is
 * engulfed), marks for the end of the main sequence, tidal locking, engulfment,
 * the Sun's present age and the age of the universe, and an age cursor that
 * can be dragged with the pointer or moved with the arrow keys.
 */

import { DerivedProperty, Multilink, type TReadOnlyProperty } from "scenerystack/axon";
import { Shape } from "scenerystack/kite";
import {
  DragListener,
  KeyboardDragListener,
  Node,
  Path,
  Rectangle,
  type SceneryEvent,
  Text,
} from "scenerystack/scenery";
import { mainSequenceEndMyr } from "../../common/model/stellarTracks.js";
import { ChartFrameNode } from "../../common/view/ChartFrameNode.js";
import { zoneStatusColor } from "../../common/view/zoneStatusView.js";
import HabitabilityLabColors from "../../HabitabilityLabColors.js";
import { FONTS, SUN_AGE_MYR, UNIVERSE_AGE_MYR } from "../../HabitabilityLabConstants.js";
import { StringManager } from "../../i18n/StringManager.js";
import type { AgingStarModel, HistoryRow } from "../model/AgingStarModel.js";

const STRIP_HEIGHT = 10;
const STRIP_GAP = 4;

/** Keyboard step of the cursor, as a fraction of the window (Shift: a fifth of it). */
const KEYBOARD_STEP = 1 / 200;

export class TimelineNode extends Node {
  /** The focusable cursor (for the PDOM order). */
  public readonly cursorNode: Node;

  public constructor(model: AgingStarModel, width: number, height: number) {
    super();
    const strings = StringManager.getInstance().getAgingStarStrings();
    const a11y = StringManager.getInstance().getAgingStarA11yStrings();

    /** Model x is in Gyr when the window spans at least 2 Gyr, else in Myr. */
    const usesGyr = (): boolean => model.windowProperty.value.max >= 2000;
    const axisLabelProperty = new DerivedProperty(
      [model.windowProperty, strings.ageAxisStringProperty, strings.ageAxisMyrStringProperty],
      (window, gyr, myr) => (window.max >= 2000 ? gyr : myr),
    );
    const chart = new ChartFrameNode({
      viewWidth: width,
      viewHeight: height,
      xAxis: { min: 0, max: 1 },
      yAxis: { min: 0.1, max: 10, log: true },
      xAxisLabelProperty: axisLabelProperty,
      yAxisLabelProperty: strings.luminosityAxisStringProperty,
      targetDivisions: 8,
    });
    const xOfAge = (age: number): number => chart.modelToViewX(usesGyr() ? age / 1000 : age);
    const ageOfX = (x: number): number => chart.viewToModelX(x) * (usesGyr() ? 1000 : 1);

    const curve = new Path(null, { stroke: HabitabilityLabColors.luminosityCurveColorProperty, lineWidth: 2 });
    const strip = new Node({ y: -STRIP_GAP - STRIP_HEIGHT });
    const markers = new Node();

    const redraw = (): void => {
      const window = model.windowProperty.value;
      const history = model.historyProperty.value;
      const rows = history.rows.filter((r) => r.star.ageMyr >= window.min && r.star.ageMyr <= window.max);
      const luminosities = rows.map((r) => r.star.luminosity);
      const lMin = Math.max(1e-5, Math.min(...luminosities) / 1.5);
      const lMax = Math.max(...luminosities) * 1.5;
      const scale = usesGyr() ? 1000 : 1;
      chart.setAxes(
        { min: window.min / scale, max: window.max / scale },
        { min: 10 ** Math.floor(Math.log10(lMin)), max: 10 ** Math.ceil(Math.log10(lMax)), log: true },
      );
      curve.shape = chart.polyline(rows.map((r) => [r.star.ageMyr / scale, r.star.luminosity] as const));

      // Status strip: one rectangle per run of equal status.
      for (const child of strip.children) {
        child.dispose();
      }
      const segments: Node[] = [];
      let runStart: HistoryRow | null = null;
      let runKey = "";
      const keyOf = (row: HistoryRow): string => (row.star.ageMyr >= history.engulfAge ? "engulfed" : row.status);
      const closeRun = (endAge: number): void => {
        if (runStart) {
          const x0 = Math.max(0, xOfAge(runStart.star.ageMyr));
          const x1 = Math.min(width, xOfAge(endAge));
          segments.push(
            new Rectangle(x0, 0, Math.max(0.5, x1 - x0), STRIP_HEIGHT, {
              fill:
                runKey === "engulfed" ? HabitabilityLabColors.mutedTextColorProperty : zoneStatusColor(runStart.status),
            }),
          );
        }
      };
      for (const row of history.rows) {
        if (row.star.ageMyr > window.max) {
          break;
        }
        if (keyOf(row) !== runKey) {
          closeRun(row.star.ageMyr);
          runStart = row;
          runKey = keyOf(row);
        }
      }
      closeRun(window.max);
      strip.children = segments;

      // Milestones.
      for (const child of markers.children) {
        child.dispose();
      }
      const track = model.trackProperty.value;
      const milestones: [number, TReadOnlyProperty<string>, typeof HabitabilityLabColors.textColorProperty][] = [
        [mainSequenceEndMyr(track), strings.msEndStringProperty, HabitabilityLabColors.mutedTextColorProperty],
        [history.lockAge, strings.lockMarkerStringProperty, HabitabilityLabColors.tidalLockColorProperty],
        [history.engulfAge, strings.engulfMarkerStringProperty, HabitabilityLabColors.tooHotColorProperty],
        [UNIVERSE_AGE_MYR, strings.universeAgeStringProperty, HabitabilityLabColors.mutedTextColorProperty],
      ];
      if (track.mass === 1) {
        milestones.push([SUN_AGE_MYR, strings.sunTodayStringProperty, HabitabilityLabColors.earthColorProperty]);
      }
      let labelRow = 0;
      markers.children = milestones
        .filter(([age]) => age > window.min && age < window.max)
        .sort(([a], [b]) => a - b)
        .map(([age, label, color]) => {
          const x = xOfAge(age);
          const text = new Text(label, { font: FONTS.SMALL, fill: color, maxWidth: 110 });
          text.left = x + 3;
          text.top = 2 + 13 * (labelRow++ % 3);
          if (text.right > width) {
            text.right = x - 3;
          }
          return new Node({
            children: [new Path(new Shape().moveTo(x, 0).lineTo(x, height), { stroke: color, lineDash: [3, 3] }), text],
          });
        });
    };
    Multilink.multilink([model.historyProperty, model.windowProperty], redraw);

    // ── Age cursor ────────────────────────────────────────────────────────────
    const cursorLine = new Path(null, { stroke: HabitabilityLabColors.cursorColorProperty, lineWidth: 2 });
    const handle = new Path(new Shape().moveTo(0, 0).lineTo(-7, 11).lineTo(7, 11).close(), {
      fill: HabitabilityLabColors.cursorColorProperty,
      cursor: "ew-resize",
      touchArea: Shape.rect(-12, -4, 24, 20),
    });
    const cursorNode = new Node({
      children: [handle],
      tagName: "div",
      focusable: true,
      accessibleName: a11y.controls.ageStringProperty,
    });
    this.cursorNode = cursorNode;
    Multilink.multilink([model.ageProperty, model.windowProperty], (age) => {
      const x = Math.min(width, Math.max(0, xOfAge(age)));
      cursorLine.shape = new Shape().moveTo(x, -STRIP_GAP - STRIP_HEIGHT - 4).lineTo(x, height);
      cursorNode.x = x;
      cursorNode.y = height;
    });

    // Pressing anywhere on the plot (or the handle) moves the cursor there.
    const pressArea = new Rectangle(0, -STRIP_GAP - STRIP_HEIGHT, width, height + STRIP_GAP + STRIP_HEIGHT, {
      fill: "rgba(0,0,0,0)",
      cursor: "ew-resize",
    });
    const setFromPointer = (event: SceneryEvent): void => {
      model.timer.isPlayingProperty.value = false;
      model.setAge(ageOfX(chart.globalToLocalPoint(event.pointer.point).x));
    };
    pressArea.addInputListener(new DragListener({ press: setFromPointer, drag: setFromPointer }));
    handle.addInputListener(new DragListener({ press: setFromPointer, drag: setFromPointer }));
    cursorNode.addInputListener(
      new KeyboardDragListener({
        dragDelta: 1,
        shiftDragDelta: 0.2,
        drag: (_event, listener) => {
          const window = model.windowProperty.value;
          model.timer.isPlayingProperty.value = false;
          model.setAge(model.ageProperty.value + listener.modelDelta.x * KEYBOARD_STEP * window.getLength());
        },
      }),
    );

    chart.plotLayer.children = [curve];
    chart.overlayLayer.children = [strip, markers, pressArea, cursorLine, cursorNode];
    this.children = [chart];
  }
}
