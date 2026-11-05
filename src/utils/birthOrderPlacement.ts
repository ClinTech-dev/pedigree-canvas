import type { LayoutDoc } from './treeLayout';
import { orderSiblingsWithTwins } from './treeLayout';
import {
  birthKey,
  birthOrderPermutation,
  tetheredIndividuals,
  unitBirthKey,
} from './birthOrder';

/**
 * Per-edit birth-order placement (issue #172).
 *
 * The per-edit layout engine (`computeTreeLayout`) is order-preserving: it keeps
 * whatever left-to-right sibling order the canvas already shows. So when a
 * sibling's age or date of birth becomes known (or a child is inserted with
 * one), this computes where the sibship's members should sit so the known-age
 * siblings read oldest-left, and returns the **pre-relayout** position moves
 * that put them in that order. The caller applies them and then runs the normal
 * relayout, which packs the sibship tidily in the new order.
 *
 * Each moved sibling is shifted together with its whole descent block (its
 * partners, its descendants and their partners) by one uniform delta, so every
 * relative order inside the block — which side a spouse is on, the order of the
 * sibling's own children — survives the relayout unchanged.
 *
 * Unknown-age siblings keep their slot; a twin group moves as one contiguous
 * unit; a sibling tethered to another family (a cross-branch couple at or below
 * it) keeps its slot, exactly like `reformatLayout`.
 *
 * Pure. Returns an empty map when the sibship is already in birth order (or the
 * individual has no sibship).
 *
 * @param childId - Any member of the sibship to put in order.
 * @param now - Reference time for age → birth estimates.
 */
export function birthOrderPlacement(
  doc: LayoutDoc,
  childId: string,
  now: number = Date.now(),
): Record<string, { x: number; y: number }> {
  const link = Object.values(doc.parentChildLinks).find((l) => l.childId === childId);
  const union = link ? doc.partnerships[link.parentPartnershipId] : undefined;
  if (!union) return {};
  const twinGroups = doc.twinGroups ?? {};
  const kids = orderSiblingsWithTwins(union.childrenIds, doc.individuals, twinGroups);
  if (kids.length < 2) return {};
  const keys = kids.map((id) => birthKey(doc.individuals[id], now));
  if (keys.filter((k) => k !== null).length < 2) return {};

  // Units in current order: consecutive members of one twin group form one unit
  // (orderSiblingsWithTwins already made each group contiguous).
  const kidSet = new Set(kids);
  const groupOf = new Map<string, string>();
  for (const g of Object.values(twinGroups)) {
    const members = g.individualIds.filter((id) => kidSet.has(id));
    if (members.length < 2) continue;
    for (const id of members) groupOf.set(id, g.id);
  }
  const units: string[][] = [];
  kids.forEach((id) => {
    const last = units[units.length - 1];
    const g = groupOf.get(id);
    if (last && g !== undefined && groupOf.get(last[0]) === g) last.push(id);
    else units.push([id]);
  });

  const tethered = tetheredIndividuals(doc);
  const keyOf = new Map(kids.map((id, i) => [id, keys[i]]));
  const perm = birthOrderPermutation(
    units.map((u) => ({
      key: unitBirthKey(u.map((id) => keyOf.get(id) ?? null)),
      pinned: u.some((id) => tethered.has(id)),
    })),
  );
  if (perm.every((v, i) => v === i)) return {};

  // Reassign the sibship's x slots in the new order, then carry each moved
  // sibling's descent block along by the same delta.
  const slotsX = kids.map((id) => doc.individuals[id].position.x);
  const newOrder = perm.flatMap((ui) => units[ui]);
  // A tethered sibling must not move at all (its spouse's family holds it). If
  // differently-sized twin units would shift its slot, leave the sibship as is.
  if (newOrder.some((id, k) => tethered.has(id) && kids[k] !== id)) return {};
  const moves: Record<string, { x: number; y: number }> = {};
  const moved = new Set<string>();
  newOrder.forEach((id, k) => {
    const delta = slotsX[k] - doc.individuals[id].position.x;
    if (delta === 0) return;
    for (const m of descentBlock(doc, id)) {
      if (moved.has(m)) continue;
      moved.add(m);
      const p = doc.individuals[m].position;
      moves[m] = { x: p.x + delta, y: p.y };
    }
  });
  return moves;
}

/** `id`, its blood descendants, and every partner of those (present only). */
function descentBlock(doc: LayoutDoc, id: string): string[] {
  const present = (x: string | undefined): x is string => !!x && x in doc.individuals;
  const out = new Set<string>([id]);
  const stack = [id];
  while (stack.length) {
    const cur = stack.pop()!;
    for (const u of Object.values(doc.partnerships)) {
      if (u.partner1Id !== cur && u.partner2Id !== cur) continue;
      for (const p of [u.partner1Id, u.partner2Id]) if (present(p)) out.add(p);
      for (const c of u.childrenIds) {
        if (present(c) && !out.has(c)) {
          out.add(c);
          stack.push(c);
        }
      }
    }
  }
  return [...out];
}
