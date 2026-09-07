import { describe, expect, it } from 'vitest';
import {
  currentDailyDate,
  formatDailyDate,
  isValidDailyDate,
  latestArchivedDate,
  nextDailyDate,
  parseDailyDate
} from './date.js';

describe('daily crossword date helpers', () => {
  it('parses valid YYYY-MM-DD dates', () => {
    expect(parseDailyDate('2026-06-29')).toEqual({ year: 2026, month: 6, day: 29 });
  });

  it('rejects impossible calendar dates', () => {
    expect(isValidDailyDate('2026-02-29')).toBe(false);
    expect(isValidDailyDate('2026-13-01')).toBe(false);
    expect(isValidDailyDate('2026-W26')).toBe(false);
  });

  it('formats and advances daily IDs', () => {
    expect(formatDailyDate(2026, 6, 9)).toBe('2026-06-09');
    expect(nextDailyDate('2026-12-31')).toBe('2027-01-01');
  });

  it('uses the requested time zone when calculating the current daily ID', () => {
    const nearMidnightUtc = new Date('2026-06-29T04:30:00.000Z');
    expect(currentDailyDate(nearMidnightUtc, 'America/Chicago')).toBe('2026-06-28');
    expect(currentDailyDate(nearMidnightUtc, 'UTC')).toBe('2026-06-29');
  });

  it('finds the latest valid archived daily ID', () => {
    expect(latestArchivedDate(['bad', '2026-06-28', '2026-06-30', '2026-W26'])).toBe('2026-06-30');
  });
});
