import { describe, expect, it } from 'vitest';
import { weeksThroughCurrent, themeForWeek } from '../src/crossword/publishing.js';

const themes = [
  { id: 'one' },
  { id: 'two' },
  { id: 'three' }
];

describe('weekly crossword publishing', () => {
  it('catches an archive up through the current ISO week', () => {
    const weeks = weeksThroughCurrent('2026-W33', new Date(Date.UTC(2026, 8, 4)));
    expect(weeks).toEqual(['2026-W34', '2026-W35', '2026-W36']);
  });

  it('does nothing when the archive is already current or ahead', () => {
    const now = new Date(Date.UTC(2026, 8, 4));
    expect(weeksThroughCurrent('2026-W36', now)).toEqual([]);
    expect(weeksThroughCurrent('2026-W37', now)).toEqual([]);
  });

  it('publishes the current week when there is no archive yet', () => {
    expect(weeksThroughCurrent(null, new Date(Date.UTC(2026, 8, 4)))).toEqual(['2026-W36']);
  });

  it('rotates themes deterministically by ISO week', () => {
    expect(themeForWeek('2026-W36', themes)).toBe(themeForWeek('2026-W36', themes));
    expect(themes).toContain(themeForWeek('2026-W36', themes));
    expect(themeForWeek('2026-W37', themes)).not.toBe(themeForWeek('2026-W36', themes));
  });
});
