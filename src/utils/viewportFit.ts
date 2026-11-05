import { MIN_ZOOM, MAX_ZOOM } from './constants';
import type { ContentExtent } from './boundsCalculation';

/**
 * Viewport maths for "fit to screen" and "keep new people visible" (#178).
 *
 * The canvas is full-bleed and the islands float over it, so the area a user
 * can actually *see* is the stage minus the chrome along its edges. These pure
 * helpers take those insets explicitly so they can be unit-tested; the DOM
 * measurement lives in `viewportChrome.ts`.
 */

/** Screen-space size of the Konva stage. */
export interface StageSize {
  width: number;
  height: number;
}

/** Pixels of the stage covered by floating chrome on each edge. */
export interface ViewportInsets {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

/** A viewport transform: `screen = canvas * scale + position`. */
export interface ViewportTransform {
  scale: number;
  position: { x: number; y: number };
}

/** No chrome at all — the whole stage is usable. */
export const ZERO_INSETS: ViewportInsets = { top: 0, right: 0, bottom: 0, left: 0 };

/** Breathing room (screen px) kept between fitted content and the chrome. */
export const FIT_PADDING = 32;

/** Smallest union rectangle containing every extent given (nulls skipped). */
export function unionExtents(
  ...extents: Array<ContentExtent | null | undefined>
): ContentExtent | null {
  let out: ContentExtent | null = null;
  for (const e of extents) {
    if (!e) continue;
    out = out
      ? {
          minX: Math.min(out.minX, e.minX),
          minY: Math.min(out.minY, e.minY),
          maxX: Math.max(out.maxX, e.maxX),
          maxY: Math.max(out.maxY, e.maxY),
        }
      : { ...e };
  }
  return out;
}

/**
 * Scale and position that fit `extent` centred inside the visible part of the
 * stage — the stage shrunk by `insets` and then by `padding` on every side.
 * Scale is clamped to the app's zoom range.
 */
export function computeFitTransform(
  extent: ContentExtent,
  stage: StageSize,
  insets: ViewportInsets = ZERO_INSETS,
  padding: number = FIT_PADDING,
): ViewportTransform {
  const availW = Math.max(1, stage.width - insets.left - insets.right - padding * 2);
  const availH = Math.max(1, stage.height - insets.top - insets.bottom - padding * 2);
  const contentW = Math.max(1, extent.maxX - extent.minX);
  const contentH = Math.max(1, extent.maxY - extent.minY);
  const scale = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, availW / contentW, availH / contentH));

  const centreScreenX = insets.left + (stage.width - insets.left - insets.right) / 2;
  const centreScreenY = insets.top + (stage.height - insets.top - insets.bottom) / 2;
  const centreX = (extent.minX + extent.maxX) / 2;
  const centreY = (extent.minY + extent.maxY) / 2;

  return {
    scale,
    position: {
      x: centreScreenX - centreX * scale,
      y: centreScreenY - centreY * scale,
    },
  };
}

/**
 * The smallest pan (scale unchanged) that brings `extent` fully into the
 * visible part of the stage, or `null` when it is already visible.
 *
 * Per axis: if the content is larger than the visible span it is aligned to
 * the leading (top/left) edge; otherwise it is nudged just far enough to clear
 * whichever edge it overflows. Used after "Add parents" so a couple created
 * above the top generation does not land under the toolbar.
 */
export function computeRevealPosition(
  extent: ContentExtent,
  view: ViewportTransform,
  stage: StageSize,
  insets: ViewportInsets = ZERO_INSETS,
  margin: number = FIT_PADDING / 2,
): { x: number; y: number } | null {
  const axis = (
    min: number,
    max: number,
    offset: number,
    lo: number,
    hi: number,
  ): number => {
    const sMin = min * view.scale + offset;
    const sMax = max * view.scale + offset;
    if (sMax - sMin > hi - lo) return offset + (lo - sMin);
    if (sMin < lo) return offset + (lo - sMin);
    if (sMax > hi) return offset - (sMax - hi);
    return offset;
  };

  const x = axis(
    extent.minX, extent.maxX, view.position.x,
    insets.left + margin, stage.width - insets.right - margin,
  );
  const y = axis(
    extent.minY, extent.maxY, view.position.y,
    insets.top + margin, stage.height - insets.bottom - margin,
  );
  if (x === view.position.x && y === view.position.y) return null;
  return { x, y };
}
