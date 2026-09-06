import { expect, test } from 'vitest';
import { evaluateScope, nextCellInWord, nextWord, wordCells } from '../src/crossword/solverFlow.js';

const across = { answer: 'SEED', startx: 2, starty: 3, orientation: 'across' };
const down = { answer: 'ROSIN', startx: 2, starty: 1, orientation: 'down' };

test('wordCells returns coordinates in solving order', () => {
  expect(wordCells(across)).toEqual([
    { x: 2, y: 3 }, { x: 3, y: 3 }, { x: 4, y: 3 }, { x: 5, y: 3 }
  ]);
});

test('nextCellInWord skips filled cells when requested', () => {
  const letters = { '3,3': 'E', '4,3': 'E' };
  expect(nextCellInWord(across, { x: 2, y: 3 }, letters)).toEqual({ x: 5, y: 3 });
  expect(nextCellInWord(across, { x: 2, y: 3 }, letters, { skipFilled: false })).toEqual({ x: 3, y: 3 });
});

test('nextWord wraps through clue order', () => {
  expect(nextWord([across, down], across, 1)).toBe(down);
  expect(nextWord([across, down], across, -1)).toBe(down);
});

test('evaluateScope reports filled, correct and wrong cells', () => {
  const puzzle = { grid: [['S', 'E', 'E', 'D']] };
  const result = evaluateScope(puzzle, { '1,1': 'S', '2,1': 'X', '4,1': 'D' }, [
    { x: 1, y: 1 }, { x: 2, y: 1 }, { x: 3, y: 1 }, { x: 4, y: 1 }
  ]);
  expect(result.filled).toBe(3);
  expect(result.correct).toBe(2);
  expect(result.wrong).toEqual(['2,1']);
});
