import { describe, expect, it } from 'vitest';
import { normalizeAnswer, groupWords } from '../src/crossword/format.js';
import { validateClueBank, validatePuzzle, isConnected } from '../src/crossword/validate.js';
import { exportIpuz, exportExolve } from '../src/crossword/exporters.js';

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
});
