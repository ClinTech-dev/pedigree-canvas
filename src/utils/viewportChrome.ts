import { usePedigreeStore } from '../stores/pedigreeStore';
import { useViewportStore } from '../stores/viewportStore';
import { computeBounds, computeContentExtent, type ContentExtent } from './boundsCalculation';
import { collectInvestigations } from './investigations';
import { computeLegendBox } from './legendLayout';
import {
  computeFitTransform,
  computeRevealPosition,
  unionExtents,
  ZERO_INSETS,
  type ViewportInsets,
} from './viewportFit';

/**
 * DOM glue for {@link computeFitTransform} / {@link computeRevealPosition}:
 * measures the stage and the floating chrome over it, then drives the
 * viewport store. Chrome opts in with a `data-viewport-chrome="top|bottom|
 * left|right"` attribute naming the stage edge it covers (App's island slots,
 * the properties panel).
 */

/** Attribute that marks floating chrome covering an edge of the canvas. */
export const VIEWPORT_CHROME_ATTR = 'data-viewport-chrome';

/** Measured screen rect of the Konva stage, or null before it mounts. */
export function getStageRect(): DOMRect | null {
  const el = document.querySelector('.konvajs-content');
  const rect = el?.getBoundingClientRect();
  if (!rect || rect.width === 0 || rect.height === 0) return null;
  return rect;
}

/**
 * How far the visible chrome reaches into the stage from each edge. Hidden or
 * empty chrome (zero-size, e.g. islands removed in zen mode) is ignored.
 */
export function measureViewportInsets(stage: DOMRect): ViewportInsets {
  const insets = { ...ZERO_INSETS };
  document.querySelectorAll<HTMLElement>(`[${VIEWPORT_CHROME_ATTR}]`).forEach((el) => {
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) return;
    switch (el.getAttribute(VIEWPORT_CHROME_ATTR)) {
      case 'top':
        insets.top = Math.max(insets.top, r.bottom - stage.top);
        break;
      case 'bottom':
        insets.bottom = Math.max(insets.bottom, stage.bottom - r.top);
        break;
      case 'left':
        insets.left = Math.max(insets.left, r.right - stage.left);
        break;
      case 'right':
        insets.right = Math.max(insets.right, stage.right - r.left);
        break;
    }
  });
  return insets;
}

/**
 * Canvas-space extent of everything "fit to screen" should show: symbols with
 * their labels, text annotations, and the on-canvas legend ("Key"), which
 * hangs below the page bounds and used to be left off-screen (#178).
 */
export function computeFitExtent(): ContentExtent | null {
  const doc = usePedigreeStore.getState().document;
  const individuals = Object.values(doc.individuals);
  const content = computeContentExtent(individuals, Object.values(doc.textAnnotations));
  if (!content) return null;
  const legend = computeLegendBox(
    doc.legendConfig.entries,
    collectInvestigations(individuals).length,
    computeBounds(individuals),
    doc.legendConfig.position,
  );
  return unionExtents(
    content,
    legend && {
      minX: legend.x,
      minY: legend.y,
      maxX: legend.x + legend.width,
      maxY: legend.y + legend.height,
    },
  );
}

/**
 * Zoom and pan so all content (legend included) fits inside the part of the
 * canvas not covered by the toolbar and other islands.
 *
 * @returns false when there is nothing to fit or the stage is unmeasured.
 */
export function fitViewportToContent(): boolean {
  const extent = computeFitExtent();
  const stage = getStageRect();
  if (!extent || !stage) return false;
  const { scale, position } = computeFitTransform(
    extent,
    { width: stage.width, height: stage.height },
    measureViewportInsets(stage),
  );
  useViewportStore.setState({ scale, position });
  return true;
}

/**
 * Pan (never zoom) just enough that the given people — e.g. parents just added
 * above the top generation — are not hidden under the toolbar or off-screen.
 * No-op when they are already visible.
 */
export function revealIndividuals(ids: string[]): void {
  const individuals = usePedigreeStore.getState().document.individuals;
  const people = ids.map((id) => individuals[id]).filter(Boolean);
  const extent = computeContentExtent(people);
  const stage = getStageRect();
  if (!extent || !stage) return;
  const { scale, position } = useViewportStore.getState();
  const next = computeRevealPosition(
    extent,
    { scale, position },
    { width: stage.width, height: stage.height },
    measureViewportInsets(stage),
  );
  if (next) useViewportStore.getState().setPosition(next);
}
