import { describe, it, expect } from 'vitest';
import {
  computeFitTransform,
  computeRevealPosition,
  unionExtents,
} from './viewportFit';
import { computeLegendBox, legendContentHeight, legendContentWidth } from './legendLayout';

const STAGE = { width: 1000, height: 800 };
const INSETS = { top: 100, right: 0, bottom: 60, left: 0 };

/** Screen-space rect of a canvas extent under a transform. */
function toScreen(
  e: { minX: number; minY: number; maxX: number; maxY: number },
  t: { scale: number; position: { x: number; y: number } },
) {
  return {
    left: e.minX * t.scale + t.position.x,
    right: e.maxX * t.scale + t.position.x,
    top: e.minY * t.scale + t.position.y,
    bottom: e.maxY * t.scale + t.position.y,
  };
}

describe('unionExtents', () => {
  it('returns the bounding union and skips nulls', () => {
    expect(
      unionExtents(
        { minX: 0, minY: 0, maxX: 10, maxY: 10 },
        null,
        { minX: -5, minY: 5, maxX: 4, maxY: 30 },
      ),
    ).toEqual({ minX: -5, minY: 0, maxX: 10, maxY: 30 });
    expect(unionExtents(null, undefined)).toBeNull();
  });
});

describe('computeFitTransform', () => {
  it('keeps fitted content clear of the toolbar and bottom islands', () => {
    const extent = { minX: -400, minY: -300, maxX: 400, maxY: 300 };
    const t = computeFitTransform(extent, STAGE, INSETS, 20);
    const s = toScreen(extent, t);
    expect(s.top).toBeGreaterThanOrEqual(INSETS.top + 20 - 1e-6);
    expect(s.bottom).toBeLessThanOrEqual(STAGE.height - INSETS.bottom - 20 + 1e-6);
    expect(s.left).toBeGreaterThanOrEqual(-1e-6);
    expect(s.right).toBeLessThanOrEqual(STAGE.width + 1e-6);
    // Height-bound: it fills the available vertical space exactly.
    expect(s.bottom - s.top).toBeCloseTo(STAGE.height - INSETS.top - INSETS.bottom - 40);
  });

  it('centres content in the uncovered area, not the raw stage', () => {
    const extent = { minX: 0, minY: 0, maxX: 10, maxY: 10 };
    const t = computeFitTransform(extent, STAGE, INSETS, 0);
    const s = toScreen(extent, t);
    const visibleCentreY = INSETS.top + (STAGE.height - INSETS.top - INSETS.bottom) / 2;
    expect((s.top + s.bottom) / 2).toBeCloseTo(visibleCentreY);
    expect((s.left + s.right) / 2).toBeCloseTo(STAGE.width / 2);
  });

  it('clamps scale to the zoom range', () => {
    const tiny = computeFitTransform({ minX: 0, minY: 0, maxX: 1, maxY: 1 }, STAGE);
    expect(tiny.scale).toBe(5);
    const huge = computeFitTransform({ minX: 0, minY: 0, maxX: 1e6, maxY: 1e6 }, STAGE);
    expect(huge.scale).toBe(0.1);
  });

  it('keeps the legend on screen when it is part of the fitted extent (#178)', () => {
    const content = { minX: 0, minY: 0, maxX: 300, maxY: 200 };
    const box = computeLegendBox(
      [{ applicableTo: undefined }],
      0,
      { x: -80, y: -80, width: 460, height: 360 },
      { x: 0, y: 0 },
    )!;
    const legendExtent = {
      minX: box.x,
      minY: box.y,
      maxX: box.x + box.width,
      maxY: box.y + box.height,
    };
    const t = computeFitTransform(unionExtents(content, legendExtent)!, STAGE, INSETS, 20);
    const legendScreen = toScreen(legendExtent, t);
    expect(legendScreen.bottom).toBeLessThanOrEqual(STAGE.height - INSETS.bottom);
    expect(legendScreen.top).toBeGreaterThanOrEqual(INSETS.top);
  });
});

describe('computeLegendBox', () => {
  it('is null with no entries and no investigations', () => {
    expect(computeLegendBox([], 0, null, { x: 0, y: 0 })).toBeNull();
  });

  it('sits just below the page bounds, sized like the rendered legend', () => {
    const box = computeLegendBox(
      [{ applicableTo: 'man' }, { applicableTo: undefined }],
      1,
      { x: 10, y: 20, width: 500, height: 300 },
      { x: 999, y: 999 },
    );
    expect(box).toEqual({
      x: 20,
      y: 336,
      width: legendContentWidth(true),
      height: legendContentHeight(2, 1),
    });
  });

  it('falls back to the stored position without bounds', () => {
    const box = computeLegendBox([{ applicableTo: 'man' }], 0, null, { x: 7, y: 8 });
    expect(box).toMatchObject({ x: 7, y: 8, width: legendContentWidth(false) });
  });
});

describe('computeRevealPosition', () => {
  const view = { scale: 1, position: { x: 0, y: 0 } };

  it('returns null when the content is already visible', () => {
    const extent = { minX: 100, minY: 300, maxX: 200, maxY: 400 };
    expect(computeRevealPosition(extent, view, STAGE, INSETS, 10)).toBeNull();
  });

  it('pans down just enough to bring parents out from under the toolbar', () => {
    // New parents at y 40..80 sit under the 100px toolbar inset.
    const extent = { minX: 100, minY: 40, maxX: 200, maxY: 80 };
    const next = computeRevealPosition(extent, view, STAGE, INSETS, 10);
    expect(next).toEqual({ x: 0, y: 70 }); // 40 + 70 = 110 = inset 100 + margin 10
  });

  it('pans up when content overflows the bottom chrome', () => {
    const extent = { minX: 100, minY: 700, maxX: 200, maxY: 760 };
    const next = computeRevealPosition(extent, view, STAGE, INSETS, 10);
    expect(next).toEqual({ x: 0, y: -30 }); // 760 - 30 = 730 = 800 - 60 - 10
  });

  it('respects the current zoom and pans horizontally too', () => {
    const zoomed = { scale: 2, position: { x: 0, y: 0 } };
    const extent = { minX: -50, minY: 100, maxX: -10, maxY: 120 };
    const next = computeRevealPosition(extent, zoomed, STAGE, INSETS, 10);
    expect(next).toEqual({ x: 110, y: 0 }); // -100 + 110 = 10
  });

  it('aligns oversized content to the top/left edge', () => {
    const extent = { minX: 0, minY: -1000, maxX: 10, maxY: 1000 };
    const next = computeRevealPosition(extent, view, STAGE, INSETS, 10);
    expect(next?.y).toBe(1110);
  });
});
