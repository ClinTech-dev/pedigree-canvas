import { describe, it, expect } from 'vitest';
import {
  parseAgeYears,
  parseBirthDate,
  birthKey,
  birthOrderPermutation,
  unitBirthKey,
  tetheredIndividuals,
  residualHubFamilies,
} from './birthOrder';
import { VitalStatus } from '../types/enums';
import {
  coupleWithSibship,
  crossBranchMarriage,
  marriedTwinInterleaved,
  threeUnionHub,
} from './__fixtures__/pedigrees';

const NOW = Date.UTC(2026, 10, 5);

describe('parseAgeYears', () => {
  it('reads finite non-negative numbers', () => {
    expect(parseAgeYears(42)).toBe(42);
    expect(parseAgeYears(0)).toBe(0);
    expect(parseAgeYears(-1)).toBeNull();
    expect(parseAgeYears(NaN)).toBeNull();
    expect(parseAgeYears(Infinity)).toBeNull();
  });

  it('reads a single number with an optional unit', () => {
    expect(parseAgeYears('45')).toBe(45);
    expect(parseAgeYears(' 45 y ')).toBe(45);
    expect(parseAgeYears('45yrs')).toBe(45);
    expect(parseAgeYears('45 years')).toBe(45);
    expect(parseAgeYears('6 mo')).toBe(0.5);
    expect(parseAgeYears('6 months')).toBe(0.5);
    expect(parseAgeYears('3wk')).toBeCloseTo(21 / 365.25);
    expect(parseAgeYears('10 days')).toBeCloseTo(10 / 365.25);
  });

  it('treats anything ambiguous or unreadable as unknown', () => {
    for (const v of ['60s', '40-50', 'adult', '', ' ', 'about 40', '4O', '45 parsecs', null, undefined, {}, true]) {
      expect(parseAgeYears(v)).toBeNull();
    }
  });
});

describe('parseBirthDate', () => {
  it('reads ISO full dates, year-month and bare years', () => {
    expect(parseBirthDate('1980-03-04')).toBe(Date.UTC(1980, 2, 4));
    expect(parseBirthDate('1980-03')).toBe(Date.UTC(1980, 2, 15));
    expect(parseBirthDate('1980')).toBe(Date.UTC(1980, 6, 1));
  });

  it('rejects ambiguous or invalid dates', () => {
    for (const v of ['03/04/1980', '1980-02-31', '1980-13-01', 'yesterday', '', undefined, 1980]) {
      expect(parseBirthDate(v)).toBeNull();
    }
  });
});

describe('birthKey', () => {
  const base = { vitalStatus: VitalStatus.Alive, isPregnancy: false };

  it('older is smaller; a date of birth wins over an age', () => {
    const k45 = birthKey({ ...base, age: 45 }, NOW)!;
    const k42 = birthKey({ ...base, age: 42 }, NOW)!;
    expect(k45).toBeLessThan(k42);
    expect(birthKey({ ...base, age: 1, dateOfBirth: '1950-01-01' }, NOW)).toBe(
      Date.UTC(1950, 0, 1),
    );
  });

  it('is unknown for a deceased person known only by age-at-death, a pregnancy, or no data', () => {
    expect(birthKey({ ...base, vitalStatus: VitalStatus.Deceased, age: 50 }, NOW)).toBeNull();
    expect(birthKey({ ...base, vitalStatus: VitalStatus.Stillborn, age: 0 }, NOW)).toBeNull();
    expect(birthKey({ ...base, isPregnancy: true, age: 0 }, NOW)).toBeNull();
    expect(birthKey(base, NOW)).toBeNull();
    expect(birthKey({ ...base, age: '60s' as unknown as number }, NOW)).toBeNull();
  });

  it('still orders a deceased person who has a date of birth', () => {
    expect(
      birthKey({ ...base, vitalStatus: VitalStatus.Deceased, dateOfBirth: '1940' }, NOW),
    ).toBe(Date.UTC(1940, 6, 1));
  });
});

describe('birthOrderPermutation', () => {
  it('sorts known units oldest-first among their own slots; unknowns stay put', () => {
    // [11, ?, 14, 20] → [20, ?, 14, 11]
    expect(
      birthOrderPermutation([{ key: -11 }, { key: null }, { key: -14 }, { key: -20 }]),
    ).toEqual([3, 1, 2, 0]);
  });

  it('keeps pinned units at their index', () => {
    expect(
      birthOrderPermutation([{ key: 3 }, { key: 1, pinned: true }, { key: 2 }]),
    ).toEqual([2, 1, 0]);
  });

  it('is stable for equal keys and the identity for an ordered sibship', () => {
    expect(birthOrderPermutation([{ key: 1 }, { key: 1 }, { key: 2 }])).toEqual([0, 1, 2]);
    expect(birthOrderPermutation([])).toEqual([]);
  });
});

describe('unitBirthKey', () => {
  it('takes the earliest known key', () => {
    expect(unitBirthKey([null, 5, 3])).toBe(3);
    expect(unitBirthKey([null, null])).toBeNull();
  });
});

describe('tetheredIndividuals', () => {
  it('is empty for a plain family', () => {
    expect(tetheredIndividuals(coupleWithSibship().doc).size).toBe(0);
  });

  it('marks the blood ancestors of a cross-branch couple', () => {
    const { doc } = crossBranchMarriage();
    const tethered = tetheredIndividuals(doc);
    // Both partners of each cross-branch union are tethered.
    for (const u of Object.values(doc.partnerships)) {
      const [a, b] = [u.partner1Id, u.partner2Id];
      if (!a || !b) continue;
      const hasParents = (id: string) =>
        Object.values(doc.parentChildLinks).some((l) => l.childId === id);
      if (hasParents(a) && hasParents(b)) {
        expect(tethered.has(a)).toBe(true);
        expect(tethered.has(b)).toBe(true);
      }
    }
  });
});

describe('residualHubFamilies', () => {
  it('is empty for a plain family', () => {
    expect(residualHubFamilies(coupleWithSibship().doc).size).toBe(0);
  });

  it('covers the whole family of a married twin or a 3+-union hub', () => {
    const twin = marriedTwinInterleaved().doc;
    expect(residualHubFamilies(twin).size).toBe(Object.keys(twin.individuals).length);
    const hub = threeUnionHub().doc;
    expect(residualHubFamilies(hub).size).toBeGreaterThan(0);
  });
});
