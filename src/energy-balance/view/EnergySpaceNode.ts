/**
 * EnergySpaceNode.ts
 *
 * The Energy Balance space view: the star at the left, the planet on a
 * logarithmic distance scale (draggable with the pointer or the arrow keys),
 * Solar System distances marked along the axis, and three kinds of arrow at the
 * planet — sunlight absorbed, sunlight reflected, infrared emitted — whose
 * widths follow the fluxes, so balance can be seen.
 */

import { DerivedProperty, Multilink, PatternStringProperty, type TReadOnlyProperty } from "scenerystack/axon";
import { Shape } from "scenerystack/kite";
import {
  Circle,
  Line,
  Node,
  Path,
  Rectangle,
  RichDragListener,
  RichText,
  type TColor,
  Text,
} from "scenerystack/scenery";
import { SOLAR_PLANETS } from "../../common/model/planets.js";
import { formatSignificant } from "../../common/view/chartUtils.js";
import { arrow, arrowWidthForFlux } from "../../common/view/fluxArrows.js";
import { bodyNameProperty, formatFlux, formatStarlight, unitDependencies } from "../../common/view/formatters.js";
import { StarNode } from "../../common/view/StarNode.js";
import HabitabilityLabColors from "../../HabitabilityLabColors.js";
import { ENERGY_DISTANCE_RANGE, FONTS, SOLAR_CONSTANT, SUN_TEMPERATURE_K } from "../../HabitabilityLabConstants.js";
import { StringManager } from "../../i18n/StringManager.js";
import type { EnergyBalanceModel } from "../model/EnergyBalanceModel.js";

const STAR_X = 42;
const AXIS_LEFT_MARGIN = 100;
const AXIS_RIGHT_MARGIN = 40;
const PLANET_RADIUS = 13;

/** Keyboard step of the planet, decades of distance (Shift: a quarter of it). */
const KEYBOARD_STEP_DECADES = 0.02;

export class EnergySpaceNode extends Node {
  public readonly planetNode: Node;

  public constructor(model: EnergyBalanceModel, width: number, height: number) {
    super();
    const strings = StringManager.getInstance().getEnergyBalanceStrings();
    const a11y = StringManager.getInstance().getEnergyBalanceA11yStrings();

    const background = new Rectangle(0, 0, width, height, {
      fill: HabitabilityLabColors.spaceColorProperty,
      stroke: HabitabilityLabColors.spaceBorderColorProperty,
      cornerRadius: 4,
    });

    const axisY = height - 34;
    const planetY = axisY - 78;
    const left = AXIS_LEFT_MARGIN;
    const right = width - AXIS_RIGHT_MARGIN;
    const logSpan = Math.log(ENERGY_DISTANCE_RANGE.max / ENERGY_DISTANCE_RANGE.min);
    const xForDistance = (d: number): number =>
      left + ((right - left) * Math.log(d / ENERGY_DISTANCE_RANGE.min)) / logSpan;
    const distanceForX = (x: number): number =>
      ENERGY_DISTANCE_RANGE.constrainValue(
        ENERGY_DISTANCE_RANGE.min * Math.exp(((x - left) / (right - left)) * logSpan),
      );

    // ── Distance axis ─────────────────────────────────────────────────────────
    const axisShape = new Shape().moveTo(left, axisY).lineTo(right, axisY);
    const tickLabels: Node[] = [];
    for (const d of [0.1, 0.2, 0.5, 1, 2, 5]) {
      const x = xForDistance(d);
      axisShape.moveTo(x, axisY).lineTo(x, axisY + 5);
      tickLabels.push(
        new Text(formatSignificant(d, 1), {
          font: FONTS.TICK_LABEL,
          fill: HabitabilityLabColors.spaceTextColorProperty,
          centerX: x,
          top: axisY + 6,
        }),
      );
    }
    const axis = new Path(axisShape, { stroke: HabitabilityLabColors.spaceTextColorProperty, lineWidth: 1 });
    const axisTitle = new Text(strings.distanceAxisStringProperty, {
      font: FONTS.SMALL,
      fill: HabitabilityLabColors.spaceTextColorProperty,
      maxWidth: right - left,
    });
    axisTitle.boundsProperty.link(() => {
      axisTitle.centerX = (left + right) / 2;
      axisTitle.top = axisY + 18;
    });

    // Solar System planets as small marks above the axis.
    const solarMarks = SOLAR_PLANETS.map((planet) => {
      const x = xForDistance(planet.distance);
      return new Node({
        children: [
          new Line(x, axisY - 6, x, axisY, { stroke: HabitabilityLabColors.earthColorProperty, lineWidth: 2 }),
          new Text(bodyNameProperty(planet.key), {
            font: FONTS.SMALL,
            fill: HabitabilityLabColors.mutedTextColorProperty,
            centerX: x,
            bottom: axisY - 8,
            maxWidth: 60,
          }),
        ],
      });
    });

    // ── Star ──────────────────────────────────────────────────────────────────
    const star = new StarNode(16, SUN_TEMPERATURE_K, { x: STAR_X, y: planetY });
    model.luminosityProperty.link((luminosity) => {
      // 12 px at 0.001 L☉ up to 26 px at 10 L☉ (a drawing scale, not true size).
      star.setRadius(12 + 3.5 * Math.log10(luminosity / 0.001));
    });

    // ── Planet and arrows ─────────────────────────────────────────────────────
    const absorbedArrow = new Path(null, { fill: HabitabilityLabColors.sunlightColorProperty });
    const reflectedArrow = new Path(null, { fill: HabitabilityLabColors.reflectedColorProperty });
    const infraredArrows = [0, 1, 2].map(() => new Path(null, { fill: HabitabilityLabColors.infraredColorProperty }));
    const planetDisc = new Circle(PLANET_RADIUS, {
      fill: HabitabilityLabColors.planetColorProperty,
      stroke: HabitabilityLabColors.spaceTextColorProperty,
      lineWidth: 1,
      cursor: "pointer",
    });
    // The night side, shading the half away from the star.
    const nightSide = new Path(new Shape().arc(0, 0, PLANET_RADIUS, -Math.PI / 2, Math.PI / 2, false).close(), {
      fill: "rgba(0,0,0,0.45)",
      pickable: false,
    });
    const planetNode = new Node({
      children: [planetDisc, nightSide],
      tagName: "div",
      focusable: true,
      accessibleName: a11y.controls.distanceStringProperty,
      y: planetY,
    });
    this.planetNode = planetNode;

    const dragListener = new RichDragListener({
      dragListenerOptions: {
        drag: (event) => {
          model.distanceProperty.value = distanceForX(this.globalToLocalPoint(event.pointer.point).x);
        },
      },
      keyboardDragListenerOptions: {
        dragDelta: 1,
        shiftDragDelta: 0.25,
        drag: (_event, listener) => {
          const decades = listener.modelDelta.x * KEYBOARD_STEP_DECADES;
          model.distanceProperty.value = ENERGY_DISTANCE_RANGE.constrainValue(
            model.distanceProperty.value * 10 ** decades,
          );
        },
      },
    });
    planetNode.addInputListener(dragListener);

    const arrowsLayer = new Node({ children: [absorbedArrow, reflectedArrow, ...infraredArrows], pickable: false });

    Multilink.multilink(
      [
        model.distanceProperty,
        model.absorbedProperty,
        model.emittedProperty,
        model.starlightProperty,
        model.albedoProperty,
      ],
      (distance, absorbed, emitted, s, albedo) => {
        const x = xForDistance(distance);
        planetNode.x = x;
        const inLength = Math.min(70, Math.max(30, x - STAR_X - 40));
        const absorbedWidth = arrowWidthForFlux(absorbed);
        absorbedArrow.shape = arrow(
          x - PLANET_RADIUS - inLength,
          planetY,
          x - PLANET_RADIUS - 1,
          planetY,
          absorbedWidth,
        );
        const reflected = (s * SOLAR_CONSTANT * albedo) / 4;
        const reflectedWidth = arrowWidthForFlux(reflected);
        reflectedArrow.visible = reflected > 1;
        reflectedArrow.shape = arrow(
          x - PLANET_RADIUS - 2,
          planetY - 14,
          x - PLANET_RADIUS - 40,
          planetY - 44,
          reflectedWidth,
        );
        const emittedWidth = arrowWidthForFlux(emitted);
        const irLength = 46;
        [0, -Math.PI / 4, Math.PI / 4].forEach((angle, i) => {
          const irArrow = infraredArrows[i] as Path;
          const cos = Math.cos(angle);
          const sin = Math.sin(angle);
          irArrow.shape = arrow(
            x + (PLANET_RADIUS + 3) * cos,
            planetY + (PLANET_RADIUS + 3) * sin,
            x + (PLANET_RADIUS + 3 + irLength) * cos,
            planetY + (PLANET_RADIUS + 3 + irLength) * sin,
            emittedWidth / (i === 0 ? 1 : 1.6),
          );
          irArrow.visible = emitted > 0.5;
        });
      },
    );

    // ── Starlight readout and legend ──────────────────────────────────────────
    const starlightReadout = new RichText(
      new PatternStringProperty(strings.starlightPatternStringProperty, {
        value: DerivedProperty.deriveAny([model.starlightProperty, ...unitDependencies()], () =>
          formatStarlight(model.starlightProperty.value),
        ),
        watts: DerivedProperty.deriveAny([model.starlightProperty, ...unitDependencies()], () =>
          formatFlux(model.starlightProperty.value * SOLAR_CONSTANT),
        ),
      }),
      {
        font: FONTS.READOUT,
        fill: HabitabilityLabColors.spaceTextColorProperty,
        left: 12,
        top: 10,
        maxWidth: width / 2,
      },
    );

    const legendItem = (fill: TColor, label: TReadOnlyProperty<string>): Node =>
      new Node({
        children: [
          new Rectangle(0, 0, 14, 6, { fill: fill, centerY: 0 }),
          new Text(label, {
            font: FONTS.SMALL,
            fill: HabitabilityLabColors.spaceTextColorProperty,
            left: 20,
            centerY: 0,
            maxWidth: 150,
          }),
        ],
      });
    const legend = new Node({
      children: [
        legendItem(HabitabilityLabColors.sunlightColorProperty, strings.absorbedStringProperty),
        legendItem(HabitabilityLabColors.reflectedColorProperty, strings.reflectedStringProperty),
        legendItem(HabitabilityLabColors.infraredColorProperty, strings.emittedStringProperty),
      ],
    });
    legend.children.forEach((child, i) => {
      child.y = i * 16;
    });
    legend.right = width - 12;
    legend.top = 14;

    this.children = [
      background,
      axis,
      ...tickLabels,
      axisTitle,
      ...solarMarks,
      star,
      arrowsLayer,
      planetNode,
      starlightReadout,
      legend,
    ];
  }
}
