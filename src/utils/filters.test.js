import { inDateRange, matchesSearch, matchesTimeOfDay, uniqueSorted } from './filters';

describe('inDateRange', () => {
  it('passes everything when no bounds are set', () => {
    expect(inDateRange(undefined, '', '')).toBe(true);
  });
  it('is inclusive of the whole end day', () => {
    expect(inDateRange('2025-11-09T22:30:00', '2025-11-09', '2025-11-09')).toBe(true);
    expect(inDateRange('2025-11-10T00:30:00', '2025-11-09', '2025-11-09')).toBe(false);
  });
  it('rejects missing dates when a bound is set', () => {
    expect(inDateRange(null, '2025-11-01', '')).toBe(false);
  });
});

describe('matchesSearch', () => {
  it('ignores queries shorter than two characters', () => {
    expect(matchesSearch(['abc'], 'z')).toBe(true);
  });
  it('matches any field case-insensitively and skips "-" placeholders', () => {
    expect(matchesSearch(['Arjun', '-', '9876543210'], 'ARJ')).toBe(true);
    expect(matchesSearch(['Arjun', '-'], 'zz')).toBe(false);
  });
});

describe('matchesTimeOfDay', () => {
  it('splits the day at 4pm local time', () => {
    expect(matchesTimeOfDay(new Date(2025, 10, 9, 10).toISOString(), 'morning', '')).toBe(true);
    expect(matchesTimeOfDay(new Date(2025, 10, 9, 17).toISOString(), 'morning', '')).toBe(false);
    expect(matchesTimeOfDay(new Date(2025, 10, 9, 17).toISOString(), 'evening', '')).toBe(true);
  });
  it('does nothing without a filter', () => {
    expect(matchesTimeOfDay('2025-11-09T10:00:00Z', '', '')).toBe(true);
  });
});

describe('uniqueSorted', () => {
  it('dedupes, drops empties and sorts', () => {
    expect(uniqueSorted(['B', '', 'A', 'B', undefined])).toEqual(['A', 'B']);
  });
});
