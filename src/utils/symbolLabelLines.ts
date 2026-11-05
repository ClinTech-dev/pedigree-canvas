import type { AgeValue, Individual, LegendEntry } from '../types/pedigree';
import { VitalStatus } from '../types/enums';

/**
 * Pure label logic for the text stack drawn under an individual's symbol.
 *
 * This is the single source of truth for both renderers: the Konva
 * `SymbolLabel.tsx` (canvas) and `svgExport.ts` (SVG/PDF export) call
 * {@link buildSymbolLabelLines}, so the two can never drift on wording or line
 * order. Kept free of React/Konva so it can be unit-tested under vitest.
 */

// ---------------------------------------------------------------------------
// Ages (issue #166)
// ---------------------------------------------------------------------------

/** A whole number of years, optionally padded with spaces. */
const WHOLE_YEARS = /^\d+$/;

/**
 * Turn what the user typed into an age field into the stored {@link AgeValue}.
 *
 * - Empty / whitespace-only → `undefined` (field cleared).
 * - A whole number of years (`"52"`) → the number `52`, exactly as every
 *   document saved before approximate ages were allowed stores it.
 * - Anything else (`"60s"`, `"~65"`, `"?"`, `"6 mo"`, `"2.5"`) → the text as
 *   typed, with leading whitespace dropped. Trailing whitespace is kept so a
 *   controlled input does not swallow a space mid-typing (`"6 "` → `"6 mo"`);
 *   {@link formatAge} trims it for display.
 *
 * Nothing is rounded or coerced: "60s" is never silently stored as 60.
 */
export function parseAgeInput(raw: string): AgeValue | undefined {
  const trimmed = raw.trim();
  if (!trimmed) return undefined;
  if (WHOLE_YEARS.test(trimmed)) return parseInt(trimmed, 10);
  return raw.trimStart();
}

/**
 * The text drawn for an age, exactly as entered (`52` → `"52"`, `"60s"` →
 * `"60s"`). Returns `undefined` for a missing, blank or non-finite value so
 * callers can skip the line.
 */
export function formatAge(age: AgeValue | null | undefined): string | undefined {
  if (age == null) return undefined;
  if (typeof age === 'number') return Number.isFinite(age) ? String(age) : undefined;
  const text = age.trim();
  return text || undefined;
}

/** The value to show in an age `<input>` for a stored age (`undefined` → `""`). */
export function ageInputValue(age: AgeValue | null | undefined): string {
  if (age == null) return '';
  return typeof age === 'number' ? (Number.isFinite(age) ? String(age) : '') : age;
}

// ---------------------------------------------------------------------------
// Cause of death (issue #166)
// ---------------------------------------------------------------------------

/**
 * The cause-of-death line drawn under a deceased individual's symbol, or
 * `undefined` when there is nothing to draw. An uncertain cause is prefixed
 * with `?` (Bennett/NSGC §11: `?` marks an uncertain diagnosis), e.g.
 * `"?stomach cancer"`; a cause the user already started with `?` is not
 * doubled.
 */
export function formatCauseOfDeath(
  cause: string | undefined,
  uncertain: boolean | undefined,
): string | undefined {
  const text = cause?.trim();
  if (!text) return undefined;
  if (uncertain && !text.startsWith('?')) return `?${text}`;
  return text;
}

// ---------------------------------------------------------------------------
// Condition + age at onset (issue #170)
// ---------------------------------------------------------------------------

/**
 * A condition annotated with its age at onset/diagnosis, e.g.
 * `"Breast cancer (dx 39)"`. This is the format clinical notes have always
 * been drawn in, so a condition entered once (legend) and one entered as a
 * note read the same on the chart.
 */
export function formatConditionWithOnset(name: string, onset: AgeValue | undefined): string {
  const age = formatAge(onset);
  return age != null ? `${name} (dx ${age})` : name;
}

/**
 * The `"<condition> (dx <age>)"` lines for the legend conditions assigned to an
 * individual that carry an age at onset, in legend (key) order. A condition
 * assigned without an onset draws no line: it is already shown by its shading
 * and the key, exactly as before.
 */
export function conditionOnsetLines(
  individual: Individual,
  legendEntries: readonly LegendEntry[],
): string[] {
  const onsets = individual.conditionOnsets;
  if (!onsets) return [];
  const assigned = individual.conditionIds ?? [];
  const lines: string[] = [];
  for (const entry of legendEntries) {
    if (!assigned.includes(entry.id)) continue;
    const age = formatAge(onsets[entry.id]);
    const name = entry.name.trim();
    if (age == null || !name) continue;
    lines.push(formatConditionWithOnset(name, age));
  }
  return lines;
}

/**
 * Drop the onset recorded for `entryId`, returning the new map (or `undefined`
 * when it becomes empty). Used whenever a condition is unassigned so a stale
 * onset never resurfaces if the condition is re-applied later.
 */
export function withoutOnset(
  onsets: Record<string, AgeValue> | undefined,
  entryId: string,
): Record<string, AgeValue> | undefined {
  if (!onsets || !(entryId in onsets)) return onsets;
  const next = { ...onsets };
  delete next[entryId];
  return Object.keys(next).length > 0 ? next : undefined;
}

/**
 * Set (or clear, when `age` is `undefined`) the onset for `entryId`, returning
 * the new map (or `undefined` when it becomes empty).
 */
export function withOnset(
  onsets: Record<string, AgeValue> | undefined,
  entryId: string,
  age: AgeValue | undefined,
): Record<string, AgeValue> | undefined {
  if (age === undefined) return withoutOnset(onsets, entryId);
  return { ...(onsets ?? {}), [entryId]: age };
}

// ---------------------------------------------------------------------------
// The full label stack
// ---------------------------------------------------------------------------

function isDeceasedOrStillborn(individual: Individual): boolean {
  return (
    individual.vitalStatus === VitalStatus.Deceased ||
    individual.vitalStatus === VitalStatus.Stillborn
  );
}

/**
 * The centred text lines drawn under an individual's symbol, top to bottom:
 *
 * 1. childless cause (only when the childless marks are drawn),
 * 2. name,
 * 3. age — `"52"` / `"60s"`, or `"d. 52"` / `"d. 60s"` when deceased,
 * 4. cause of death (deceased only; `?`-prefixed when uncertain),
 * 5. `SB`, pregnancy outcome, `GA: …`, SAAB,
 * 6. legend conditions with an age at onset — `"Breast cancer (dx 39)"`,
 * 7. clinical notes — `"<note>"` or `"<note> (dx <age>)"`,
 * 8. investigation labels.
 *
 * The individual number is drawn separately at the symbol's corner and is not
 * part of this list.
 */
export function buildSymbolLabelLines(
  individual: Individual,
  legendEntries: readonly LegendEntry[] = [],
  childlessActive = false,
): string[] {
  const lines: string[] = [];

  // Childless cause (e.g. "vasectomy") sits first, directly under the
  // cross-bar(s), when the childless marks are drawn — mirrors the partnership
  // marker, which prints the cause below its bars.
  const childlessReason = individual.childlessReason?.trim();
  if (childlessActive && childlessReason) {
    lines.push(childlessReason);
  }

  if (individual.displayName) {
    lines.push(individual.displayName);
  }

  // Age (or "d. <age>" if deceased), drawn exactly as entered.
  const age = formatAge(individual.age);
  if (age != null) {
    lines.push(isDeceasedOrStillborn(individual) ? `d. ${age}` : age);
  }

  // Cause of death, directly under the age at death. Gated on Deceased (the
  // only status whose panel shows the field) so a stale value never shows.
  if (individual.vitalStatus === VitalStatus.Deceased) {
    const cause = formatCauseOfDeath(
      individual.causeOfDeath,
      individual.causeOfDeathUncertain,
    );
    if (cause) lines.push(cause);
  }

  // Stillbirth: "SB" abbreviation plus gestational age, per NSGC/Bennett (the
  // symbol stays the sex-specific shape with a deceased slash — a stillbirth is
  // never a triangle). Gestational age is only meaningful for a stillbirth or
  // an ongoing pregnancy, so it is gated on those.
  if (individual.vitalStatus === VitalStatus.Stillborn) {
    lines.push('SB');
  }
  // Pregnancy not carried to term: annotate the triangle with the outcome
  // abbreviation (SAB / TOP / ECT) so the three losses are distinguishable.
  if (individual.isPregnancy && individual.pregnancyOutcome) {
    lines.push(individual.pregnancyOutcome);
  }
  if (
    (individual.vitalStatus === VitalStatus.Stillborn || individual.isPregnancy) &&
    individual.gestationalAge?.trim()
  ) {
    lines.push(`GA: ${individual.gestationalAge.trim()}`);
  }

  // Sex assigned at birth annotation (AMAB / AFAB)
  if (individual.sexAssignedAtBirth) {
    lines.push(individual.sexAssignedAtBirth);
  }

  // Legend conditions entered with an age at onset (issue #170).
  lines.push(...conditionOnsetLines(individual, legendEntries));

  // Clinical notes, with age of onset when given.
  for (const condition of individual.conditions ?? []) {
    lines.push(formatConditionWithOnset(condition.name, condition.ageOfOnset));
  }

  // Investigations (genetic tests etc.) — the short label only; the free-text
  // description is surfaced in the key and properties panel.
  for (const investigation of individual.investigations ?? []) {
    const value = investigation.label.trim();
    if (value) lines.push(value);
  }

  return lines;
}
