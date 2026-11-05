import { describe, it, expect } from 'vitest';
import type { LegendEntry } from '../types/pedigree';
import {
  DEFAULT_COLOR_ORDER,
  DEFAULT_PATTERN_ORDER,
  entriesIdenticalTo,
  findIdenticalEntryGroups,
  looksIdentical,
  pickConditionDefaults,
} from './conditionDefaults';
import { COLOR_OPTIONS, PATTERN_OPTIONS } from '../components/ui/legendOptions';

let nextId = 0;
function entry(overrides: Partial<LegendEntry> = {}): LegendEntry {
  nextId += 1;
  return {
    id: `e${nextId}`,
    name: `Condition ${nextId}`,
    quarter: 'topRight',
    fillColor: '#1a1a1a',
    fillPattern: 'solid',
    ...overrides,
  };
}

/** Simulate a user who keeps pressing "Add condition" and accepts defaults. */
function addWithDefaults(count: number): LegendEntry[] {
  const entries: LegendEntry[] = [];
  for (let i = 0; i < count; i++) {
    entries.push(entry(pickConditionDefaults(entries)));
  }
  return entries;
}

describe('pickConditionDefaults', () => {
  it('pickConditionDefaults_gives_the_first_condition_the_old_default', () => {
    expect(pickConditionDefaults([])).toEqual({
      quarter: 'topRight',
      fillColor: '#1a1a1a',
      fillPattern: 'solid',
    });
  });

  it('pickConditionDefaults_gives_the_second_condition_a_new_quarter_and_pattern', () => {
    const first = entry();
    expect(pickConditionDefaults([first])).toEqual({
      quarter: 'topLeft',
      fillColor: '#1a1a1a',
      fillPattern: 'diagonalLines',
    });
  });

  it('pickConditionDefaults_fills_all_four_quarters_before_reusing_one', () => {
    const entries = addWithDefaults(4);
    expect(entries.map((e) => e.quarter)).toEqual([
      'topRight',
      'topLeft',
      'bottomLeft',
      'bottomRight',
    ]);
  });

  it('pickConditionDefaults_skips_quarters_used_by_hand_edited_entries', () => {
    const entries = [entry({ quarter: 'topRight' }), entry({ quarter: 'topLeft', fillPattern: 'dots' })];
    expect(pickConditionDefaults(entries).quarter).toBe('bottomLeft');
  });

  it('pickConditionDefaults_picks_the_least_used_quarter_when_all_are_taken', () => {
    const entries = [
      entry({ quarter: 'topRight' }),
      entry({ quarter: 'topRight', fillPattern: 'dots' }),
      entry({ quarter: 'topLeft', fillPattern: 'crosshatch' }),
      entry({ quarter: 'topLeft', fillPattern: 'diagonalLines' }),
      entry({ quarter: 'bottomLeft', fillPattern: 'horizontalStripes' }),
      entry({ quarter: 'bottomRight', fillPattern: 'verticalStripes' }),
      entry({ quarter: 'bottomRight', fillColor: '#dc2626' }),
    ];
    expect(pickConditionDefaults(entries).quarter).toBe('bottomLeft');
  });

  it('pickConditionDefaults_uses_each_pattern_once_before_changing_colour', () => {
    const entries = addWithDefaults(6);
    expect(entries.map((e) => e.fillPattern)).toEqual([...DEFAULT_PATTERN_ORDER]);
    expect(new Set(entries.map((e) => e.fillColor))).toEqual(new Set(['#1a1a1a']));
  });

  it('pickConditionDefaults_switches_colour_once_every_pattern_is_used', () => {
    const entries = addWithDefaults(7);
    expect(entries[6]).toMatchObject({ fillPattern: 'solid', fillColor: '#dc2626' });
  });

  it('pickConditionDefaults_treats_colours_case_insensitively', () => {
    const entries = DEFAULT_PATTERN_ORDER.map((p) =>
      entry({ fillPattern: p, fillColor: '#1A1A1A' }),
    );
    expect(pickConditionDefaults(entries).fillColor).toBe('#dc2626');
  });

  it('pickConditionDefaults_never_produces_a_lookalike_for_a_long_run_of_defaults', () => {
    // 4 quarters x 6 patterns x 4 colours: far more than any real pedigree.
    const entries = addWithDefaults(24);
    expect(findIdenticalEntryGroups(entries)).toEqual([]);
  });

  it('pickConditionDefaults_does_not_mutate_its_input', () => {
    const entries = [entry()];
    const snapshot = structuredClone(entries);
    pickConditionDefaults(entries);
    expect(entries).toEqual(snapshot);
  });
});

describe('default orders match the picker options', () => {
  it('default_colour_order_matches_the_colour_picker', () => {
    expect([...DEFAULT_COLOR_ORDER]).toEqual(COLOR_OPTIONS.map((o) => o.value));
  });

  it('default_pattern_order_matches_the_pattern_picker', () => {
    expect([...DEFAULT_PATTERN_ORDER]).toEqual(PATTERN_OPTIONS.map((o) => o.value));
  });
});

describe('looksIdentical', () => {
  it('looksIdentical_is_true_for_same_quarter_colour_and_pattern', () => {
    expect(looksIdentical(entry(), entry({ name: 'Other', applicableTo: 'woman' }))).toBe(true);
  });

  it('looksIdentical_ignores_colour_case_and_whitespace', () => {
    expect(looksIdentical(entry({ fillColor: '#DC2626' }), entry({ fillColor: ' #dc2626' }))).toBe(true);
  });

  it.each([
    ['quarter', { quarter: 'topLeft' as const }],
    ['colour', { fillColor: '#2563eb' }],
    ['pattern', { fillPattern: 'dots' as const }],
  ])('looksIdentical_is_false_when_the_%s_differs', (_field, patch) => {
    expect(looksIdentical(entry(), entry(patch))).toBe(false);
  });
});

describe('findIdenticalEntryGroups', () => {
  it('findIdenticalEntryGroups_is_empty_when_every_entry_is_distinct', () => {
    expect(findIdenticalEntryGroups(addWithDefaults(5))).toEqual([]);
  });

  it('findIdenticalEntryGroups_reports_the_breast_and_ovarian_lookalike', () => {
    const breast = entry({ name: 'Breast cancer' });
    const ovarian = entry({ name: 'Ovarian cancer' });
    const other = entry({ name: 'Colon cancer', quarter: 'bottomLeft' });
    expect(findIdenticalEntryGroups([breast, other, ovarian])).toEqual([[breast, ovarian]]);
  });

  it('findIdenticalEntryGroups_reports_separate_groups_in_entry_order', () => {
    const a1 = entry();
    const b1 = entry({ quarter: 'topLeft', fillPattern: 'dots' });
    const a2 = entry();
    const b2 = entry({ quarter: 'topLeft', fillPattern: 'dots' });
    const a3 = entry();
    expect(findIdenticalEntryGroups([a1, b1, a2, b2, a3])).toEqual([
      [a1, a2, a3],
      [b1, b2],
    ]);
  });
});

describe('entriesIdenticalTo', () => {
  it('entriesIdenticalTo_returns_existing_entries_with_the_same_look', () => {
    const a = entry();
    const b = entry({ quarter: 'bottomRight' });
    expect(
      entriesIdenticalTo({ quarter: 'topRight', fillColor: '#1a1a1a', fillPattern: 'solid' }, [a, b]),
    ).toEqual([a]);
  });

  it('entriesIdenticalTo_is_empty_for_the_suggested_defaults', () => {
    const entries = addWithDefaults(3);
    expect(entriesIdenticalTo(pickConditionDefaults(entries), entries)).toEqual([]);
  });
});
