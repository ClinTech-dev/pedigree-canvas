import type {
  FillPatternType,
  LegendEntry,
  QuarterPosition,
} from '../types/pedigree';
import { ALL_QUARTERS } from './quarterClashes';

/**
 * Default fill patterns, in the order new conditions are given them. Matches
 * the Pattern picker's order so the first condition stays solid.
 */
export const DEFAULT_PATTERN_ORDER: readonly FillPatternType[] = [
  'solid',
  'diagonalLines',
  'dots',
  'crosshatch',
  'horizontalStripes',
  'verticalStripes',
] as const;

/**
 * Default fill colours, in the order they are used once every pattern is taken.
 * Black comes first so a pedigree stays print-safe (black and white) for as
 * long as patterns alone can tell the conditions apart. Matches the Colour
 * picker's swatches.
 */
export const DEFAULT_COLOR_ORDER: readonly string[] = [
  '#1a1a1a',
  '#dc2626',
  '#16a34a',
  '#2563eb',
] as const;

/** The quarter, colour and pattern a new legend entry should start with. */
export interface ConditionDefaults {
  quarter: QuarterPosition;
  fillColor: string;
  fillPattern: FillPatternType;
}

/** The fields that decide how a legend entry looks on the chart and in the key. */
type Appearance = Pick<LegendEntry, 'quarter' | 'fillColor' | 'fillPattern'>;

function normaliseColor(color: string): string {
  return color.trim().toLowerCase();
}

/** Count how often each value appears, with every candidate starting at 0. */
function countUses<T>(candidates: readonly T[], used: T[]): Map<T, number> {
  const counts = new Map<T, number>(candidates.map((c) => [c, 0]));
  for (const value of used) {
    if (counts.has(value)) counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  return counts;
}

/** The least-used candidate; ties go to the earliest in `candidates`. */
function leastUsed<T>(candidates: readonly T[], counts: Map<T, number>): T {
  let best = candidates[0];
  for (const candidate of candidates) {
    if ((counts.get(candidate) ?? 0) < (counts.get(best) ?? 0)) best = candidate;
  }
  return best;
}

/**
 * Pick the quarter, colour and pattern for a new legend entry so it does not
 * look like any entry already in the legend (issue #174).
 *
 * - **Quarter:** the first unused quarter in {@link ALL_QUARTERS} order (so the
 *   first condition still gets top-right). If all four are used, the least-used
 *   quarter, ties going to that same order.
 * - **Pattern:** the first pattern no entry uses yet, in
 *   {@link DEFAULT_PATTERN_ORDER}. If every pattern is used, the least-used one.
 * - **Colour:** black, unless that pattern is already used in black; then the
 *   first colour in {@link DEFAULT_COLOR_ORDER} not yet paired with the pattern
 *   (falling back to the least-used colour for it).
 *
 * The result is only a starting point: the user can change any field. Pure, so
 * it is unit-tested directly.
 *
 * @param entries - The legend entries already in the document.
 * @returns The defaults for the next entry.
 */
export function pickConditionDefaults(entries: LegendEntry[]): ConditionDefaults {
  const quarterCounts = countUses(
    ALL_QUARTERS,
    entries.map((e) => e.quarter),
  );
  const quarter = leastUsed(ALL_QUARTERS, quarterCounts);

  const patternCounts = countUses(
    DEFAULT_PATTERN_ORDER,
    entries.map((e) => e.fillPattern),
  );
  const fillPattern = leastUsed(DEFAULT_PATTERN_ORDER, patternCounts);

  const colorsWithPattern = entries
    .filter((e) => e.fillPattern === fillPattern)
    .map((e) => normaliseColor(e.fillColor));
  const colorCounts = countUses(DEFAULT_COLOR_ORDER, colorsWithPattern);
  const fillColor = leastUsed(DEFAULT_COLOR_ORDER, colorCounts);

  return { quarter, fillColor, fillPattern };
}

/**
 * Whether two legend entries would render identically: same quarter, same
 * colour (case-insensitive) and same pattern. Name and "applies to" don't
 * change how the shading looks, so they are ignored.
 */
export function looksIdentical(a: Appearance, b: Appearance): boolean {
  return (
    a.quarter === b.quarter &&
    a.fillPattern === b.fillPattern &&
    normaliseColor(a.fillColor) === normaliseColor(b.fillColor)
  );
}

/**
 * Group legend entries that would render identically on the chart and in the
 * key, so the legend editor can warn about them.
 *
 * @param entries - All legend entries in the document.
 * @returns One group per look shared by two or more entries, each group in
 *   `entries` order, groups ordered by their first entry. Empty when every
 *   entry looks distinct.
 */
export function findIdenticalEntryGroups(entries: LegendEntry[]): LegendEntry[][] {
  const groups: LegendEntry[][] = [];
  for (const entry of entries) {
    const group = groups.find((g) => looksIdentical(g[0], entry));
    if (group) group.push(entry);
    else groups.push([entry]);
  }
  return groups.filter((g) => g.length >= 2);
}

/**
 * The existing entries a not-yet-created condition would look identical to,
 * for warning in the inline "add condition" form.
 *
 * @param candidate - The quarter, colour and pattern chosen for the new entry.
 * @param entries - The legend entries already in the document.
 * @returns The matching entries, in `entries` order.
 */
export function entriesIdenticalTo(
  candidate: Appearance,
  entries: LegendEntry[],
): LegendEntry[] {
  return entries.filter((e) => looksIdentical(candidate, e));
}
