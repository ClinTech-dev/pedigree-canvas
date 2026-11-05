/** Shared legend layout constants and row-position helpers.
 *
 * Both `LegendLayer.tsx` (Konva canvas) and `svgExport.ts` (SVG export)
 * consume these so their renderers stay visually aligned. Change values here
 * and both renderers update automatically.
 */

export const PADDING = 12;
export const ROW_HEIGHT = 28;
export const TITLE_HEIGHT = 24;
export const SWATCH_SIZE = 20;
/** Label text area width. Bumped from 120 to accommodate longer investigation strings. */
export const LABEL_WIDTH = 160;

/** Width of the swatch column (one or two swatches with gap). */
export function legendSwatchWidth(hasBothGender: boolean): number {
  return hasBothGender ? SWATCH_SIZE * 2 + 4 : SWATCH_SIZE;
}

/** Total width of the legend box. */
export function legendContentWidth(hasBothGender: boolean): number {
  return PADDING * 2 + legendSwatchWidth(hasBothGender) + 8 + LABEL_WIDTH;
}

/** Total height of the legend box. */
export function legendContentHeight(
  entryCount: number,
  investigationCount: number,
): number {
  return PADDING * 2 + TITLE_HEIGHT + (entryCount + investigationCount) * ROW_HEIGHT;
}

/** Y of the top edge of a condition entry row (0-based index). */
export function legendEntryRowY(idx: number): number {
  return PADDING + TITLE_HEIGHT + idx * ROW_HEIGHT;
}

/**
 * Y of the top edge of an investigation row, continuing below all condition entries.
 * Apply a +4 inner offset at the call site for the text element itself.
 */
export function legendInvestigationRowY(entryCount: number, idx: number): number {
  return PADDING + TITLE_HEIGHT + (entryCount + idx) * ROW_HEIGHT;
}

/** Gap between the dashed page bounds and the on-canvas legend below it. */
export const LEGEND_BOUNDS_GAP = 16;
/** Horizontal inset of the legend from the page bounds' left edge. */
export const LEGEND_BOUNDS_INSET_X = 10;

/** Canvas-space rectangle of the on-canvas legend. */
export interface LegendBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Where the on-canvas legend ("Key") is drawn, in canvas space — the single
 * source for `LegendLayer`'s placement and for "fit to screen", which must
 * include it (#178).
 *
 * With page `bounds` the legend sits just below them, left-aligned; without,
 * it uses its stored (draggable) `fallbackPosition`.
 *
 * @returns The legend rectangle, or `null` when there is nothing to show
 *   (no condition entries and no investigations).
 */
export function computeLegendBox(
  entries: ReadonlyArray<{ applicableTo?: unknown }>,
  investigationCount: number,
  bounds: { x: number; y: number; width: number; height: number } | null | undefined,
  fallbackPosition: { x: number; y: number },
): LegendBox | null {
  if (entries.length === 0 && investigationCount === 0) return null;
  const hasBothGender = entries.some((e) => !e.applicableTo);
  return {
    x: bounds ? bounds.x + LEGEND_BOUNDS_INSET_X : fallbackPosition.x,
    y: bounds ? bounds.y + bounds.height + LEGEND_BOUNDS_GAP : fallbackPosition.y,
    width: legendContentWidth(hasBothGender),
    height: legendContentHeight(entries.length, investigationCount),
  };
}
