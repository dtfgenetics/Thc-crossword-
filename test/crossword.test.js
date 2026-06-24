import { describe, expect, it } from 'vitest';
import { normalizeAnswer, groupWords } from '../src/crossword/format.js';
import { validateClueBank, validatePuzzle, isConnected } from '../src/crossword/validate.js';
import { exportIpuz, exportExolve } from '../src/crossword/exporters.js';
import { selectEntries } from '../src/crossword/selectEntries.js';
import { progressStats, isSolved } from '../src/crossword/progress.js';
import { currentIsoWeek, latestArchivedWeek, nextIsoWeek, weeksInIsoYear } from '../src/crossword/week.js';

const puzzle = {
  id: 'test-week',
  title: 'Test Puzzle',
  subtitle: 'Test subtitle',
  adultUseNotice: 'Adults only where legal.',
  grid: [
    ['C', 'O', 'L', 'A'],
    ['.', '.', '.', '.']
  ],
  rows: 2,
  cols: 4,
  words: [
    { answer: 'COLA', clue: 'Main flower cluster', startx: 1, starty: 1, position: 1, orientation: 'across' }
  ],
  clues: {
    across: [{ answer: 'COLA', clue: 'Main flower cluster', startx: 1, starty: 1, position: 1, orientation: 'across' }],
    down: []
  },
  stats: { submittedCount: 1, placedCount: 1, score: 990 }
};

describe('crossword helpers', () => {
  it('normalizes answers for grid use', () => {
    expect(normalizeAnswer('Blue Mango')).toBe('BLUEMANGO');
    expect(normalizeAnswer('Cal-Mag & K')).toBe('CALMAGANDK');
  });

  it('groups across and down words', () => {
    const grouped = groupWords(puzzle.words);
    expect(grouped.across).toHaveLength(1);
    expect(grouped.down).toHaveLength(0);
  });

  it('validates clue bank entries', () => {
    expect(validateClueBank([{ answer: 'Cola', clue: 'Main flower cluster' }])).toEqual([]);
    expect(validateClueBank([{ answer: 'A', clue: '' }]).length).toBeGreaterThan(0);
  });

  it('validates puzzle grid consistency', () => {
    expect(validatePuzzle(puzzle)).toEqual([]);
  });

  it('detects disconnected islands', () => {
    expect(isConnected([['A', '.'], ['.', 'B']])).toBe(false);
  });

  it('exports IPUZ and Exolve formats', () => {
    expect(exportIpuz(puzzle)).toContain('Test Puzzle');
    expect(exportExolve(puzzle)).toContain('exolve-title: Test Puzzle');
  });

  it('selects entries by preferred theme categories', () => {
    const selected = selectEntries({
      bank: [
        { answer: 'Cola', clue: 'Main flower cluster', category: 'Cultivation', difficulty: 'easy' },
        { answer: 'Rosin', clue: 'Solventless extract', category: 'Extracts', difficulty: 'easy' }
      ],
      theme: { preferredCategories: ['Extracts'] },
      max: 1,
      random: () => 0
    });
    expect(selected[0].answer).toBe('Rosin');
  });

  it('filters duplicate normalized answers during selection', () => {
    const selected = selectEntries({
      bank: [
        { answer: 'Blue Mango', clue: 'First version', category: 'Lineage', difficulty: 'easy' },
        { answer: 'Blue-Mango', clue: 'Duplicate punctuation version', category: 'Lineage', difficulty: 'easy' },
        { answer: 'Rosin', clue: 'Solventless extract', category: 'Extracts', difficulty: 'easy' }
      ],
      theme: { preferredCategories: ['Lineage', 'Extracts'] },
      max: 3,
      random: () => 0
    });
    expect(selected.map((entry) => normalizeAnswer(entry.answer))).toEqual(['BLUEMANGO', 'ROSIN']);
  });

  it('handles ISO week rollover correctly', () => {
    expect(weeksInIsoYear(2026)).toBe(53);
    expect(nextIsoWeek('2026-W26')).toBe('2026-W27');
    expect(nextIsoWeek('2026-W53')).toBe('2027-W01');
    expect(latestArchivedWeek(['2026-W02', '2026-W10', 'bad'])).toBe('2026-W10');
    expect(currentIsoWeek(new Date(Date.UTC(2026, 5, 23)))).toBe('2026-W26');
  });

  it('tracks crossword progress and solved state', () => {
    const partial = progressStats(puzzle, { '1,1': 'C', '2,1': 'X' });
    expect(partial.total).toBe(4);
    expect(partial.filled).toBe(2);
    expect(partial.correct).toBe(1);
    expect(partial.solved).toBe(false);
    expect(isSolved(puzzle, { '1,1': 'C', '2,1': 'O', '3,1': 'L', '4,1': 'A' })).toBe(true);
  });
});
