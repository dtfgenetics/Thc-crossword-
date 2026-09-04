import assert from 'node:assert/strict';
import test from 'node:test';
import { evaluateScope, nextCellInWord, nextWord, wordCells } from '../src/crossword/solverFlow.js';

const across = { answer: 'SEED', startx: 2, starty: 3, orientation: 'across' };
const down = { answer: 'ROSIN', startx: 2, starty: 1, orientation: 'down' };

test('wordCells returns coordinates in solving order', () => {
  assert.deepEqual(wordCells(across), [
    { x: 2, y: 3 }, { x: 3, y: 3 }, { x: 4, y: 3 }, { x: 5, y: 3 }
  ]);
});

test('nextCellInWord skips filled cells when requested', () => {
  const letters = { '3,3': 'E', '4,3': 'E' };
  assert.deepEqual(nextCellInWord(across, { x: 2, y: 3 }, letters), { x: 5, y: 3 });
  assert.deepEqual(nextCellInWord(across, { x: 2, y: 3 }, letters, { skipFilled: false }), { x: 3, y: 3 });
});

test('nextWord wraps through clue order', () => {
  assert.equal(nextWord([across, down], across, 1), down);
  assert.equal(nextWord([across, down], across, -1), down);
});

test('evaluateScope reports filled, correct and wrong cells', () => {
  const puzzle = { grid: [['S', 'E', 'E', 'D']] };
  const result = evaluateScope(puzzle, { '1,1': 'S', '2,1': 'X', '4,1': 'D' }, [
    { x: 1, y: 1 }, { x: 2, y: 1 }, { x: 3, y: 1 }, { x: 4, y: 1 }
  ]);
  assert.equal(result.filled, 3);
  assert.equal(result.correct, 2);
  assert.deepEqual(result.wrong, ['2,1']);
});
