import { describe, it, expect } from 'vitest';
import {
  ageInputValue,
  buildSymbolLabelLines,
  conditionOnsetLines,
  formatAge,
  formatCauseOfDeath,
  formatConditionWithOnset,
  parseAgeInput,
  withOnset,
  withoutOnset,
} from './symbolLabelLines';
import { createDefaultIndividual } from '../stores/pedigreeStore';
import { PregnancyOutcome, SexAssignedAtBirth, VitalStatus } from '../types/enums';
import type { LegendEntry } from '../types/pedigree';

const breast: LegendEntry = {
  id: 'brca',
  name: 'Breast cancer',
  quarter: 'topRight',
  fillColor: '#000',
  fillPattern: 'solid',
};
const ovary: LegendEntry = {
  id: 'ov',
  name: 'Ovarian cancer',
  quarter: 'topLeft',
  fillColor: '#000',
  fillPattern: 'solid',
};

describe('parseAgeInput', () => {
  it('stores a whole number of years as a number (the legacy form)', () => {
    expect(parseAgeInput('52')).toBe(52);
    expect(parseAgeInput(' 7 ')).toBe(7);
    expect(parseAgeInput('0')).toBe(0);
  });

  it('keeps approximate and unknown ages as typed, never coercing them', () => {
    expect(parseAgeInput('60s')).toBe('60s');
    expect(parseAgeInput('~65')).toBe('~65');
    expect(parseAgeInput('?')).toBe('?');
    expect(parseAgeInput('6 mo')).toBe('6 mo');
    expect(parseAgeInput('2.5')).toBe('2.5');
    expect(parseAgeInput('  c. 70')).toBe('c. 70');
  });

  it('keeps a trailing space while typing so "~6 mo" can be entered', () => {
    expect(parseAgeInput('6 ')).toBe(6); // whole number once trimmed
    expect(parseAgeInput('~6 ')).toBe('~6 ');
  });

  it('clears on empty or whitespace input', () => {
    expect(parseAgeInput('')).toBeUndefined();
    expect(parseAgeInput('   ')).toBeUndefined();
  });
});

describe('formatAge / ageInputValue', () => {
  it('draws numbers and text exactly as entered', () => {
    expect(formatAge(52)).toBe('52');
    expect(formatAge('60s')).toBe('60s');
    expect(formatAge(' ~65 ')).toBe('~65');
    expect(formatAge(0)).toBe('0');
  });

  it('skips missing, blank and non-finite ages', () => {
    expect(formatAge(undefined)).toBeUndefined();
    expect(formatAge(null)).toBeUndefined();
    expect(formatAge('  ')).toBeUndefined();
    expect(formatAge(NaN)).toBeUndefined();
  });

  it('gives the input value for a stored age', () => {
    expect(ageInputValue(42)).toBe('42');
    expect(ageInputValue('60s')).toBe('60s');
    expect(ageInputValue(undefined)).toBe('');
    expect(ageInputValue(NaN)).toBe('');
  });
});

describe('formatCauseOfDeath', () => {
  it('draws a known cause as entered', () => {
    expect(formatCauseOfDeath('MI', false)).toBe('MI');
    expect(formatCauseOfDeath(' stroke ', undefined)).toBe('stroke');
  });

  it('prefixes an uncertain cause with "?"', () => {
    expect(formatCauseOfDeath('stomach cancer', true)).toBe('?stomach cancer');
  });

  it('does not double a "?" the user already typed', () => {
    expect(formatCauseOfDeath('?stomach ca', true)).toBe('?stomach ca');
  });

  it('draws nothing for a blank cause, even if marked uncertain', () => {
    expect(formatCauseOfDeath(undefined, true)).toBeUndefined();
    expect(formatCauseOfDeath('  ', true)).toBeUndefined();
  });
});

describe('condition onset (issue #170)', () => {
  it('formats "<name> (dx <age>)", matching clinical notes', () => {
    expect(formatConditionWithOnset('Breast cancer', 39)).toBe('Breast cancer (dx 39)');
    expect(formatConditionWithOnset('BrCa', '40s')).toBe('BrCa (dx 40s)');
    expect(formatConditionWithOnset('Asthma', undefined)).toBe('Asthma');
  });

  it('lists only assigned conditions that have an onset, in legend order', () => {
    const ind = createDefaultIndividual({
      conditionIds: ['ov', 'brca'],
      conditionOnsets: { ov: 52, brca: 39, stale: 10 },
    });
    expect(conditionOnsetLines(ind, [breast, ovary])).toEqual([
      'Breast cancer (dx 39)',
      'Ovarian cancer (dx 52)',
    ]);
  });

  it('draws nothing for a condition assigned without an onset (shading only, as before)', () => {
    const ind = createDefaultIndividual({ conditionIds: ['brca'] });
    expect(conditionOnsetLines(ind, [breast])).toEqual([]);
  });

  it('ignores an onset left behind for an unassigned condition', () => {
    const ind = createDefaultIndividual({
      conditionIds: [],
      conditionOnsets: { brca: 39 },
    });
    expect(conditionOnsetLines(ind, [breast])).toEqual([]);
  });

  it('withOnset / withoutOnset add, replace and prune entries', () => {
    expect(withOnset(undefined, 'a', 39)).toEqual({ a: 39 });
    expect(withOnset({ a: 39 }, 'a', '40s')).toEqual({ a: '40s' });
    expect(withOnset({ a: 39 }, 'a', undefined)).toBeUndefined();
    expect(withoutOnset({ a: 39, b: 1 }, 'a')).toEqual({ b: 1 });
    expect(withoutOnset({ a: 39 }, 'a')).toBeUndefined();
    expect(withoutOnset(undefined, 'a')).toBeUndefined();
    const same = { b: 1 };
    expect(withoutOnset(same, 'a')).toBe(same);
  });
});

describe('buildSymbolLabelLines', () => {
  it('draws a legacy numeric age exactly as before', () => {
    expect(buildSymbolLabelLines(createDefaultIndividual({ age: 45 }))).toEqual(['45']);
    expect(
      buildSymbolLabelLines(
        createDefaultIndividual({ age: 52, vitalStatus: VitalStatus.Deceased }),
      ),
    ).toEqual(['d. 52']);
  });

  it('draws an approximate age at death as typed: "d. 60s"', () => {
    const ind = createDefaultIndividual({ age: '60s', vitalStatus: VitalStatus.Deceased });
    expect(buildSymbolLabelLines(ind)).toEqual(['d. 60s']);
  });

  it('draws the cause of death directly under the age at death', () => {
    const ind = createDefaultIndividual({
      displayName: 'Mary',
      age: '60s',
      vitalStatus: VitalStatus.Deceased,
      causeOfDeath: 'stomach cancer',
      causeOfDeathUncertain: true,
    });
    expect(buildSymbolLabelLines(ind)).toEqual(['Mary', 'd. 60s', '?stomach cancer']);
  });

  it('draws the cause of death with no age given', () => {
    const ind = createDefaultIndividual({
      vitalStatus: VitalStatus.Deceased,
      causeOfDeath: 'MI',
    });
    expect(buildSymbolLabelLines(ind)).toEqual(['MI']);
  });

  it('hides a stale cause of death on a living individual', () => {
    const ind = createDefaultIndividual({ causeOfDeath: 'MI' });
    expect(buildSymbolLabelLines(ind)).toEqual([]);
  });

  it('places legend onsets before clinical notes and investigations', () => {
    const ind = createDefaultIndividual({
      displayName: 'Ann',
      age: 70,
      sexAssignedAtBirth: SexAssignedAtBirth.AFAB,
      conditionIds: ['brca'],
      conditionOnsets: { brca: 39 },
      conditions: [{ id: 'n1', name: 'Migraine', ageOfOnset: '30s' }],
      investigations: [{ label: 'BRCA1', description: '+' }],
    });
    expect(buildSymbolLabelLines(ind, [breast])).toEqual([
      'Ann',
      '70',
      'AFAB',
      'Breast cancer (dx 39)',
      'Migraine (dx 30s)',
      'BRCA1',
    ]);
  });

  it('keeps the existing stillbirth / pregnancy / childless lines', () => {
    expect(
      buildSymbolLabelLines(
        createDefaultIndividual({
          vitalStatus: VitalStatus.Stillborn,
          gestationalAge: '20 wk',
        }),
      ),
    ).toEqual(['SB', 'GA: 20 wk']);
    expect(
      buildSymbolLabelLines(
        createDefaultIndividual({
          isPregnancy: true,
          pregnancyOutcome: PregnancyOutcome.SAB,
        }),
      ),
    ).toEqual(['SAB']);
    expect(
      buildSymbolLabelLines(
        createDefaultIndividual({ displayName: 'Bo', childlessReason: 'vasectomy' }),
        [],
        true,
      ),
    ).toEqual(['vasectomy', 'Bo']);
  });
});
