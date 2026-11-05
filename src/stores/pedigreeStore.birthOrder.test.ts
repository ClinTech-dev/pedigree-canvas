import { describe, it, expect, beforeEach } from 'vitest';
import { usePedigreeStore, createDefaultDocument, createDefaultIndividual } from './pedigreeStore';
import type { PedigreeDocument, ParentChildRelationship } from '../types/pedigree';
import { RelationshipType, TwinType } from '../types/enums';
import { SIBLING_SPACING } from '../utils/constants';
import { birthOrderSibship } from '../utils/__fixtures__/pedigrees';
import {
  checkAllInvariants,
  siblingBirthOrder,
  twinContiguity,
} from '../utils/__fixtures__/invariants';
import type { Positions } from '../utils/__fixtures__/invariants';
import type { LayoutDoc } from '../utils/treeLayout';

// Issue #172: a new sibling is appended on the right (its age is not known yet);
// once an age is committed, the sibship slides into birth order, oldest left.

function toDocument(layout: LayoutDoc): PedigreeDocument {
  return {
    ...createDefaultDocument(),
    individuals: layout.individuals,
    partnerships: layout.partnerships,
    parentChildLinks: layout.parentChildLinks,
    twinGroups: layout.twinGroups ?? {},
  };
}

function storePositions(): Positions {
  const pos: Positions = {};
  for (const [id, ind] of Object.entries(usePedigreeStore.getState().document.individuals)) {
    pos[id] = { ...ind.position };
  }
  return pos;
}

function storeLayoutDoc(): LayoutDoc {
  const d = usePedigreeStore.getState().document;
  return {
    individuals: d.individuals,
    partnerships: d.partnerships,
    parentChildLinks: d.parentChildLinks,
    twinGroups: d.twinGroups,
  };
}

/** Mum + Dad with one child, Sarah (42), as the persona built it. */
function sarahFamily(): PedigreeDocument {
  const doc = createDefaultDocument();
  const mum = createDefaultIndividual({ id: 'mum', generation: 0, position: { x: -60, y: 0 } });
  const dad = createDefaultIndividual({ id: 'dad', generation: 0, position: { x: 60, y: 0 } });
  const sarah = createDefaultIndividual({
    id: 'sarah', generation: 1, age: 42, position: { x: 0, y: 150 },
  });
  doc.individuals = { mum, dad, sarah };
  doc.partnerships = {
    u: { id: 'u', type: RelationshipType.Partnership, partner1Id: 'mum', partner2Id: 'dad', childrenIds: ['sarah'] },
  };
  doc.parentChildLinks = {
    ls: { id: 'ls', type: RelationshipType.ParentChild, parentPartnershipId: 'u', childId: 'sarah', isAdoptive: false },
  };
  return doc;
}

/** Add a sibling of Sarah exactly as the radial menu does (to the right). */
function addSibling(id: string, overrides: Record<string, unknown> = {}): void {
  const s = usePedigreeStore.getState();
  const kids = s.document.partnerships.u.childrenIds.map((k) => s.document.individuals[k]);
  const maxX = Math.max(...kids.map((k) => k.position.x));
  const sib = createDefaultIndividual({
    id, generation: 1, position: { x: maxX + SIBLING_SPACING, y: 150 }, ...overrides,
  });
  const link: ParentChildRelationship = {
    id: `l-${id}`, type: RelationshipType.ParentChild, parentPartnershipId: 'u', childId: id, isAdoptive: false,
  };
  s.addChildToFamily(sib, 'u', link);
}

beforeEach(() => {
  usePedigreeStore.getState().resetDocument();
  usePedigreeStore.temporal.getState().clear();
});

describe('placeInBirthOrder', () => {
  it("moves Sarah's older brother (45) to her left once his age is committed", () => {
    usePedigreeStore.getState().setDocument(sarahFamily());
    addSibling('bro');
    // A new sibling has no age yet, so it lands on the right as before.
    expect(storePositions().bro.x).toBeGreaterThan(storePositions().sarah.x);

    // Typing the age does not reshuffle (no per-keystroke jumps)…
    usePedigreeStore.getState().updateIndividual('bro', { age: 45 });
    expect(storePositions().bro.x).toBeGreaterThan(storePositions().sarah.x);

    // …committing it does.
    usePedigreeStore.temporal.getState().clear();
    usePedigreeStore.getState().placeInBirthOrder('bro');
    const pos = storePositions();
    expect(pos.bro.x).toBeLessThan(pos.sarah.x);
    const doc = storeLayoutDoc();
    expect(checkAllInvariants(pos, doc).violations).toEqual([]);
    expect(siblingBirthOrder(pos, doc).violations).toEqual([]);

    // One undo step restores the previous arrangement.
    expect(usePedigreeStore.temporal.getState().pastStates).toHaveLength(1);
    usePedigreeStore.temporal.getState().undo();
    expect(storePositions().bro.x).toBeGreaterThan(storePositions().sarah.x);
  });

  it('is a no-op (no undo entry) when the sibship is already in birth order or ages are unknown', () => {
    usePedigreeStore.getState().setDocument(sarahFamily());
    addSibling('younger', { age: 30 });
    addSibling('unknown');
    usePedigreeStore.temporal.getState().clear();
    const before = storePositions();
    usePedigreeStore.getState().placeInBirthOrder('younger');
    usePedigreeStore.getState().placeInBirthOrder('unknown');
    expect(storePositions()).toEqual(before);
    expect(usePedigreeStore.temporal.getState().pastStates).toHaveLength(0);
  });

  it('places a child inserted with a known age straight into its birth-order slot', () => {
    usePedigreeStore.getState().setDocument(sarahFamily());
    addSibling('eldest', { age: 50 });
    const pos = storePositions();
    expect(pos.eldest.x).toBeLessThan(pos.sarah.x);
  });

  it('treats an unparseable age ("60s") as unknown', () => {
    usePedigreeStore.getState().setDocument(sarahFamily());
    addSibling('decade', { age: '60s' as unknown as number });
    usePedigreeStore.getState().placeInBirthOrder('decade');
    expect(storePositions().decade.x).toBeGreaterThan(storePositions().sarah.x);
  });

  it('orders the birthOrderSibship fixture, moving spouses and descendants along and keeping twins together', () => {
    const fixture = birthOrderSibship();
    usePedigreeStore.getState().setDocument(toDocument(fixture.doc));
    usePedigreeStore.getState().placeInBirthOrder('c11');
    const pos = storePositions();
    const doc = storeLayoutDoc();
    const order = ['c11', 'c14', 'cu', 'ta', 'tb', 'c20', 'cd'].sort((a, b) => pos[a].x - pos[b].x);
    expect(order).toEqual(['c20', 'c14', 'cu', 'c11', 'ta', 'tb', 'cd']);
    expect(checkAllInvariants(pos, doc).violations).toEqual([]);
    expect(twinContiguity(pos, doc, doc.twinGroups ?? {}).ok).toBe(true);
    expect(siblingBirthOrder(pos, doc).violations).toEqual([]);
    // c14's spouse and child stayed with her (spouse adjacent, child below the couple).
    expect(Math.abs(pos.sp.x - pos.c14.x)).toBeLessThan(SIBLING_SPACING * 2);
    expect(pos.gk.x).toBeGreaterThanOrEqual(Math.min(pos.sp.x, pos.c14.x) - 1);
    expect(pos.gk.x).toBeLessThanOrEqual(Math.max(pos.sp.x, pos.c14.x) + 1);
  });

  it('keeps a twin pair contiguous when only one twin has an age', () => {
    usePedigreeStore.getState().setDocument(sarahFamily());
    addSibling('t1');
    addSibling('t2');
    usePedigreeStore.setState((s) => ({
      document: {
        ...s.document,
        twinGroups: {
          tw: { id: 'tw', twinType: TwinType.Dizygotic, individualIds: ['t1', 't2'], parentPartnershipId: 'u' },
        },
      },
    }));
    usePedigreeStore.getState().updateIndividual('t2', { age: 50 });
    usePedigreeStore.getState().placeInBirthOrder('t2');
    const pos = storePositions();
    expect(Math.max(pos.t1.x, pos.t2.x)).toBeLessThan(pos.sarah.x);
    const doc = storeLayoutDoc();
    expect(twinContiguity(pos, doc, doc.twinGroups ?? {}).ok).toBe(true);
  });
});
