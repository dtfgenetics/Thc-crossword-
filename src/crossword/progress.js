import { BLACK } from './format.js';

export function puzzleCells(puzzle) {
  const cells = [];
  for (let y = 0; y < puzzle.grid.length; y++) {
    for (let x = 0; x < puzzle.grid[y].length; x++) {
      if (puzzle.grid[y][x] !== BLACK) cells.push({ x: x + 1, y: y + 1, answer: puzzle.grid[y][x] });
    }
  }
  return cells;
}

export function progressStats(puzzle, letters = {}) {
  const cells = puzzleCells(puzzle);
  let filled = 0;
  let correct = 0;

  for (const cell of cells) {
    const value = String(letters[`${cell.x},${cell.y}`] || '').toUpperCase();
    if (value) filled++;
    if (value === cell.answer) correct++;
  }

  return {
    total: cells.length,
    filled,
    correct,
    percentFilled: cells.length ? Math.round((filled / cells.length) * 100) : 0,
    percentCorrect: cells.length ? Math.round((correct / cells.length) * 100) : 0,
    solved: cells.length > 0 && correct === cells.length
  };
}

export function isSolved(puzzle, letters = {}) {
  return progressStats(puzzle, letters).solved;
}
