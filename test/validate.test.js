import { describe, expect, it } from 'vitest';
import { validatePuzzle } from '../src/crossword/validate.js';

const basePuzzle = {
  id: 'validator-test',
  grid: [['C', 'O', 'L', 'A']],
  rows: 1,
  cols: 4,
  words: [{ answer: 'COLA', clue: 'Main flower cluster', startx: 1, starty: 1, position: 1, orientation: 'across' }],
  stats: { submittedCount: 1, placedCount: 1 }
};

describe('puzzle validation safeguards', () => {
  it('passes a fully clued grid', () => {
    expect(validatePuzzle(basePuzzle)).toEqual([]);
  });

  it('fails when a filled cell is not covered by a placed word', () => {
    const broken = {
      ...basePuzzle,
      grid: [['C', 'O', 'L', 'A', 'X']],
      rows: 1,
      cols: 5
    };
    expect(validatePuzzle(broken).join('\n')).toContain('Filled cell without clue');
  });

  it('fails when declared dimensions do not match the grid', () => {
    const broken = { ...basePuzzle, cols: 5 };
    expect(validatePuzzle(broken).join('\n')).toContain('Grid column count');
  });
});
