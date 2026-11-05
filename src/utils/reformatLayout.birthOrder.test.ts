import { describe, it, expect } from 'vitest';
import { reformatLayout } from './reformatLayout';
import { DEFAULT_LAYOUT_SPACING } from './treeLayout';
import type { LayoutDoc } from './treeLayout';
import {
  birthOrderSibship,
  coupleWithSibship,
  crossBranchMarriage,
  marriedInWithParents,
} from './__fixtures__/pedigrees';
import {
  finalPositions,
  checkAllInvariants,
  noNodeBetweenPartners,
  twinContiguity,
  siblingBirthOrder,
} from './__fixtures__/invariants';
import type { Positions } from './__fixtures__/invariants';

// Issue #172 — Bennett/NSGC: siblings left to right in birth order, oldest left.
// Reformat used to tie-break a sibship by id (it once put a son aged 11 left of
// his sister aged 14). The ordering phase now permutes each sibship into birth
// order among the slots it already holds; unknown-age siblings stay put.

function reformatted(doc: LayoutDoc): Positions {
  return finalPositions(doc, reformatLayout(doc));
}

function settle(doc: LayoutDoc, moves: Record<string, { x: number; y: number }>): LayoutDoc {
  return {
    ...doc,
    individuals: Object.fromEntries(
      Object.entries(doc.individuals).map(([id, node]) => [
        id,
        moves[id] ? { ...node, position: { x: moves[id].x, y: moves[id].y } } : node,
      ]),
    ),
  };
}

/** Left-to-right order of the given ids by final x. */
function leftToRight(pos: Positions, ids: string[]): string[] {
  return [...ids].sort((a, b) => pos[a].x - pos[b].x);
}

/** Copy `doc` with the given ages set (any value — the field may hold strings). */
function withAges(doc: LayoutDoc, ages: Record<string, unknown>): LayoutDoc {
  const individuals = { ...doc.individuals };
  for (const [id, age] of Object.entries(ages)) {
    individuals[id] = { ...individuals[id], age: age as number };
  }
  return { ...doc, individuals };
}

describe('reformatLayout — sibling birth order (#172)', () => {
  it('birthOrderSibship: oldest left; unknowns, the deceased and the twin unit handled', () => {
    const { doc, twinGroups } = birthOrderSibship();
    const pos = reformatted(doc);
    expect(leftToRight(pos, ['c11', 'c14', 'cu', 'ta', 'tb', 'c20', 'cd'])).toEqual([
      'c20', 'c14', 'cu', 'c11', 'ta', 'tb', 'cd',
    ]);
    expect(siblingBirthOrder(pos, doc).violations).toEqual([]);
    expect(twinContiguity(pos, doc, twinGroups ?? {}).ok).toBe(true);
    expect(checkAllInvariants(pos, doc).violations).toEqual([]);
    expect(noNodeBetweenPartners(pos, doc).ok).toBe(true);
    // The married sibling's spouse stays beside her and their child below them.
    expect(Math.abs(pos.sp.x - pos.c14.x)).toBeLessThanOrEqual(
      DEFAULT_LAYOUT_SPACING.partnerSpacing + 1,
    );
    expect(pos.gk.x).toBeGreaterThan(Math.min(pos.sp.x, pos.c14.x) - 1);
    expect(pos.gk.x).toBeLessThan(Math.max(pos.sp.x, pos.c14.x) + 1);
  });

  it('birthOrderSibship: the seed is out of order (the invariant bites) and a second pass moves nothing', () => {
    const { doc } = birthOrderSibship();
    expect(siblingBirthOrder(finalPositions(doc, {}), doc).ok).toBe(false);
    const settled = settle(doc, reformatLayout(doc));
    for (const [id, p] of Object.entries(reformatLayout(settled))) {
      expect(Math.abs(p.x - settled.individuals[id].position.x)).toBeLessThan(1);
      expect(Math.abs(p.y - settled.individuals[id].position.y)).toBeLessThan(1);
    }
  });

  it('the reported case: a son (11) is moved right of his sister (14)', () => {
    const { doc } = coupleWithSibship(); // c1, c2, c3 left to right
    const pos = reformatted(withAges(doc, { c1: 11, c3: 14 }));
    // c2 has no age and keeps the middle slot; the known pair swaps ends.
    expect(leftToRight(pos, ['c1', 'c2', 'c3'])).toEqual(['c3', 'c2', 'c1']);
  });

  it('treats an unparseable age string ("60s") as unknown rather than reordering on it', () => {
    const { doc } = coupleWithSibship();
    const pos = reformatted(withAges(doc, { c1: '60s', c2: 30, c3: 40 }));
    expect(leftToRight(pos, ['c1', 'c2', 'c3'])).toEqual(['c1', 'c3', 'c2']);
  });

  it('reads a numeric age string and a date of birth', () => {
    const { doc } = coupleWithSibship();
    const d = withAges(doc, { c1: '5', c2: undefined, c3: undefined });
    d.individuals.c2 = { ...d.individuals.c2, dateOfBirth: '1990-01-01' };
    d.individuals.c3 = { ...d.individuals.c3, dateOfBirth: '1980-06-30' };
    const pos = reformatted(d);
    expect(leftToRight(pos, ['c1', 'c2', 'c3'])).toEqual(['c3', 'c2', 'c1']);
  });

  it('keeps a sibship with no known ages exactly as before (no reorder)', () => {
    const { doc } = coupleWithSibship();
    const plain = reformatted(doc);
    const unknown = reformatted(withAges(doc, { c1: '60s', c2: 'adult', c3: undefined }));
    expect(unknown).toEqual(plain);
  });

  it('holds siblings tethered to another family (cross-branch couples) and stays valid', () => {
    for (const build of [crossBranchMarriage, marriedInWithParents]) {
      const { doc } = build();
      const ids = Object.keys(doc.individuals).sort();
      // Reverse-sorted ages so birth order wants the opposite of id order.
      const aged = withAges(
        doc,
        Object.fromEntries(ids.map((id, i) => [id, 90 - i])),
      );
      const pos = reformatted(aged);
      expect(checkAllInvariants(pos, aged).violations).toEqual([]);
      expect(noNodeBetweenPartners(pos, aged).ok).toBe(true);
      expect(siblingBirthOrder(pos, aged).violations).toEqual([]);
    }
  });
});
