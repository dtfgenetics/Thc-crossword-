import { BLACK, groupWords } from './format.js';

export function exportInternalPuzzle(puzzle) {
  return JSON.stringify(puzzle, null, 2);
}

export function exportIpuz(puzzle) {
  const numberGrid = makeNumberGrid(puzzle);
  return JSON.stringify({
    version: 'http://ipuz.org/v2',
    kind: ['http://ipuz.org/crossword#1'],
    title: puzzle.title,
    intro: puzzle.subtitle,
    explanation: puzzle.adultUseNotice,
    dimensions: { width: puzzle.cols, height: puzzle.rows },
    puzzle: puzzle.grid.map((row, y) => row.map((cell, x) => cell === BLACK ? '#' : numberGrid[y][x] || 0)),
    solution: puzzle.grid.map((row) => row.map((cell) => cell === BLACK ? '#' : cell)),
    clues: {
      Across: (puzzle.clues?.across || []).map((word) => [word.position, word.clue]),
      Down: (puzzle.clues?.down || []).map((word) => [word.position, word.clue])
    }
  }, null, 2);
}

export function exportExolve(puzzle) {
  const grouped = puzzle.clues || groupWords(puzzle.words || []);
  const rows = puzzle.grid.map((row) => row.map((cell) => cell === BLACK ? '.' : cell).join('')).join('\n');
  const across = grouped.across.map((word) => `${word.position}. ${word.clue} (${word.answer.length})`).join('\n');
  const down = grouped.down.map((word) => `${word.position}. ${word.clue} (${word.answer.length})`).join('\n');
  return [
    'exolve-begin',
    `exolve-title: ${puzzle.title}`,
    `exolve-id: ${puzzle.id}`,
    `exolve-width: ${puzzle.cols}`,
    `exolve-height: ${puzzle.rows}`,
    'exolve-grid:',
    rows,
    'exolve-across:',
    across,
    'exolve-down:',
    down,
    'exolve-end'
  ].join('\n');
}

export function makeNumberGrid(puzzle) {
  const grid = puzzle.grid.map((row) => row.map(() => 0));
  for (const word of puzzle.words || []) {
    grid[word.starty - 1][word.startx - 1] = word.position;
  }
  return grid;
}
