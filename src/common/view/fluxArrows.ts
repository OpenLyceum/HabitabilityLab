/**
 * fluxArrows.ts
 *
 * Energy-flow arrows shared by the Energy Balance and Greenhouse screens: one
 * width scale for every flux (W/m²), growing like √F so both Mars's dim
 * sunlight and Venus's surface infrared stay drawable, and arrow shapes whose
 * heads grow with their tails.
 */

import { ArrowShape } from "scenerystack/scenery-phet";

/** Arrow tail width, px, for a flux in W/m². */
export const arrowWidthForFlux = (flux: number): number => Math.min(26, 1.5 + 2.2 * Math.sqrt(Math.max(flux, 0) / 20));

/** An arrow shape whose head grows with its tail width. */
export const arrow = (tailX: number, tailY: number, tipX: number, tipY: number, tailWidth: number): ArrowShape =>
  new ArrowShape(tailX, tailY, tipX, tipY, {
    tailWidth: tailWidth,
    headWidth: tailWidth + 9,
    headHeight: Math.min(14, 6 + tailWidth / 2),
  });
