import type { Individual } from '../types/pedigree';
import { VitalStatus } from '../types/enums';

/**
 * Birth-order helpers (issue #172). Bennett/NSGC: siblings are drawn left to
 * right in birth order, oldest on the left. These pure helpers turn whatever
 * the user recorded (a date of birth, or an age) into a comparable "birth key"
 * and compute the reordering of a sibship that puts the known-age siblings in
 * birth order while leaving every unknown-age sibling where it is.
 *
 * Everything here is defensive: the age field may hold a non-numeric string
 * (e.g. "60s" or "6 mo") as the data model evolves, so anything we cannot read
 * unambiguously is treated as **unknown** rather than guessed.
 */

const YEAR_MS = 365.25 * 24 * 60 * 60 * 1000;

/**
 * Parse an age into years. Accepts a finite non-negative number, or a string
 * holding one number with an optional unit: years (`45`, `45y`, `45 yrs`),
 * months (`6m`, `6 mo`, `6 months`), weeks (`3w`, `3 wk`) or days (`10d`).
 * Anything else — decades like `"60s"`, ranges, words, negatives, NaN — is
 * `null` (unknown).
 */
export function parseAgeYears(age: unknown): number | null {
  if (typeof age === 'number') {
    return Number.isFinite(age) && age >= 0 ? age : null;
  }
  if (typeof age !== 'string') return null;
  const m = /^\s*(\d+(?:\.\d+)?)\s*([a-z]*)\.?\s*$/i.exec(age);
  if (!m) return null;
  const value = Number(m[1]);
  if (!Number.isFinite(value)) return null;
  const unit = m[2].toLowerCase();
  if (unit === '' || /^(y|yr|yrs|year|years)$/.test(unit)) return value;
  if (/^(m|mo|mos|mth|mths|month|months)$/.test(unit)) return value / 12;
  if (/^(w|wk|wks|week|weeks)$/.test(unit)) return (value * 7) / 365.25;
  if (/^(d|day|days)$/.test(unit)) return value / 365.25;
  return null;
}

/**
 * Parse a date of birth into a UTC timestamp (ms). Only unambiguous ISO forms
 * are read — `YYYY-MM-DD`, `YYYY-MM` (mid-month) and `YYYY` (mid-year); a
 * locale form like `03/04/1980` is ambiguous (US vs day-first) and is `null`.
 */
export function parseBirthDate(dob: unknown): number | null {
  if (typeof dob !== 'string') return null;
  const m = /^\s*(\d{4})(?:-(\d{1,2})(?:-(\d{1,2}))?)?\s*$/.exec(dob);
  if (!m) return null;
  const year = Number(m[1]);
  const month = m[2] !== undefined ? Number(m[2]) : 7;
  const day = m[3] !== undefined ? Number(m[3]) : m[2] !== undefined ? 15 : 1;
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  const t = Date.UTC(year, month - 1, day);
  // Reject roll-overs such as 1980-02-31.
  if (new Date(t).getUTCDate() !== day) return null;
  return t;
}

/**
 * A comparable birth key for an individual: an (estimated) birth timestamp in
 * ms, so a **smaller key is older**. `null` means unknown.
 *
 * - A parseable date of birth wins.
 * - Otherwise a parseable age is used, but only for a living, non-pregnancy
 *   individual: a deceased person's age is their age *at death*, which says
 *   nothing about birth order relative to a living sibling, so it is unknown.
 *
 * @param now - Reference time for converting an age to a birth estimate. Pass
 *   one fixed value for a whole sibship so the comparison is consistent.
 */
export function birthKey(
  ind: Pick<Individual, 'age' | 'dateOfBirth' | 'vitalStatus' | 'isPregnancy'>,
  now: number,
): number | null {
  const dob = parseBirthDate(ind.dateOfBirth);
  if (dob !== null) return dob;
  if (ind.isPregnancy) return null;
  if (ind.vitalStatus !== VitalStatus.Alive) return null;
  const years = parseAgeYears(ind.age);
  if (years === null) return null;
  return now - years * YEAR_MS;
}

/** One orderable unit of a sibship: a single sibling, or a whole twin group. */
export interface BirthOrderUnit {
  /** Birth key ({@link birthKey}); `null` when unknown. Smaller is older. */
  key: number | null;
  /** A pinned unit is held at its index, exactly like an unknown-age one. */
  pinned?: boolean;
}

/**
 * Reorder a sibship's units into birth order. `units` is the current
 * left-to-right order. Returns the new left-to-right order as indices into
 * `units`.
 *
 * Units with a known key (and not pinned) are sorted oldest-first among the
 * indices they already occupy; unknown or pinned units keep their exact index.
 * Equal keys keep their current relative order (stable), so the result is
 * idempotent and a sibship that is already in birth order is returned as-is.
 */
export function birthOrderPermutation(units: readonly BirthOrderUnit[]): number[] {
  const result = units.map((_, i) => i);
  const free = result.filter((i) => units[i].key !== null && !units[i].pinned);
  const sorted = [...free].sort((a, b) => {
    const d = (units[a].key as number) - (units[b].key as number);
    return d !== 0 ? d : a - b;
  });
  free.forEach((slot, k) => {
    result[slot] = sorted[k];
  });
  return result;
}

/**
 * The birth key of a twin group (or any unit of several siblings): the
 * earliest known member key, or `null` when no member's key is known.
 */
export function unitBirthKey(keys: readonly (number | null)[]): number | null {
  let best: number | null = null;
  for (const k of keys) if (k !== null && (best === null || k < best)) best = k;
  return best;
}

/** The relationship slice {@link tetheredIndividuals} reads. */
export interface BirthOrderGraph {
  individuals: Record<string, unknown>;
  partnerships: Record<
    string,
    { partner1Id?: string; partner2Id?: string; childrenIds: readonly string[] }
  >;
  parentChildLinks: Record<string, { parentPartnershipId: string; childId: string }>;
}

/**
 * The individuals whose horizontal place is **tethered to another family**, so
 * birth order cannot freely move them (issue #172, "achievable form").
 *
 * A person `s` is tethered when someone in `s`'s line of descent (`s` and every
 * blood descendant) has a partner who is *outside* that line and has parents of
 * their own in the chart — a cross-branch couple at or below `s`. That couple's
 * position is set by two families at once (the layered engine's barycentre and
 * cross-branch phases), so pulling `s` across its sibship for birth order would
 * tangle the descent lines. Tethered siblings keep their place, exactly like
 * unknown-age ones.
 */
export function tetheredIndividuals(doc: BirthOrderGraph): Set<string> {
  const present = (id: string | undefined): id is string => !!id && id in doc.individuals;
  const hasParents = new Set<string>();
  for (const l of Object.values(doc.parentChildLinks)) {
    const u = doc.partnerships[l.parentPartnershipId];
    if (u && (present(u.partner1Id) || present(u.partner2Id)) && present(l.childId)) {
      hasParents.add(l.childId);
    }
  }
  const partners = new Map<string, string[]>();
  const unionsOf = new Map<string, string[]>();
  for (const [uid, u] of Object.entries(doc.partnerships)) {
    for (const [a, b] of [
      [u.partner1Id, u.partner2Id],
      [u.partner2Id, u.partner1Id],
    ]) {
      if (!present(a)) continue;
      (unionsOf.get(a) ?? unionsOf.set(a, []).get(a)!).push(uid);
      if (present(b) && b !== a) (partners.get(a) ?? partners.set(a, []).get(a)!).push(b);
    }
  }

  const tethered = new Set<string>();
  for (const s of Object.keys(doc.individuals)) {
    // s's line of descent: s and all blood descendants.
    const line = new Set<string>([s]);
    const stack = [s];
    while (stack.length) {
      const cur = stack.pop()!;
      for (const uid of unionsOf.get(cur) ?? []) {
        for (const c of doc.partnerships[uid].childrenIds) {
          if (present(c) && !line.has(c)) {
            line.add(c);
            stack.push(c);
          }
        }
      }
    }
    for (const m of line) {
      if ((partners.get(m) ?? []).some((p) => !line.has(p) && hasParents.has(p))) {
        tethered.add(s);
        break;
      }
    }
  }
  return tethered;
}

/**
 * Every individual in a connected family that contains an **open residual-1b
 * shape** (#149 / #159): a **married twin** (a twin-group member with a present
 * partner) or a **multi-union hub** (someone with 3+ unions to present
 * partners). There `reformatLayout` keeps its linear layout and twin
 * contiguity, couple adjacency and descent-line order already compete, so birth
 * order is not imposed in such a family — it never perturbs that layout.
 */
export function residualHubFamilies(
  doc: BirthOrderGraph & { twinGroups?: Record<string, { individualIds: readonly string[] }> },
): Set<string> {
  const present = (id: string | undefined): id is string => !!id && id in doc.individuals;
  const adj = new Map<string, string[]>();
  const edge = (a: string, b: string): void => {
    (adj.get(a) ?? adj.set(a, []).get(a)!).push(b);
    (adj.get(b) ?? adj.set(b, []).get(b)!).push(a);
  };
  const unions = new Map<string, number>();
  for (const u of Object.values(doc.partnerships)) {
    const ps = [u.partner1Id, u.partner2Id].filter(present);
    if (ps.length === 2 && ps[0] !== ps[1]) {
      edge(ps[0], ps[1]);
      for (const p of ps) unions.set(p, (unions.get(p) ?? 0) + 1);
    }
    const kids = u.childrenIds.filter(present);
    // Link parents to children, and siblings to each other (a parentless
    // sibship still forms one family).
    kids.forEach((c, i) => {
      for (const p of ps) edge(p, c);
      if (i > 0) edge(kids[i - 1], c);
    });
  }
  const seeds = [...unions].filter(([, n]) => n >= 3).map(([id]) => id);
  for (const g of Object.values(doc.twinGroups ?? {})) {
    for (const t of g.individualIds) if (present(t) && unions.has(t)) seeds.push(t);
  }
  const out = new Set<string>();
  for (const s of seeds) {
    if (out.has(s)) continue;
    out.add(s);
    const stack = [s];
    while (stack.length) {
      const cur = stack.pop()!;
      for (const n of adj.get(cur) ?? []) {
        if (!out.has(n)) {
          out.add(n);
          stack.push(n);
        }
      }
    }
  }
  return out;
}

