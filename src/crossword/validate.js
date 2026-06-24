import { BLACK, normalizeAnswer } from './format.js';

export function validateClueBank(entries) {
  const errors = [];
  const seen = new Set();
  entries.forEach((entry, index) => {
    const answer = normalizeAnswer(entry.answer);
    if (!answer) errors.push(`Entry ${index + 1} is missing a usable answer.`);
    if (!entry.clue || String(entry.clue).trim().length < 8) errors.push(`Entry ${index + 1} has a weak or missing clue.`);
    if (seen.has(answer)) errors.push(`Duplicate answer: ${entry.answer}`);
    seen.add(answer);
    if (answer.length < 3) errors.push(`Answer too short: ${entry.answer}`);
  });
  return errors;
}

export function validatePuzzle(puzzle, options = {}) {
  const minPlacedRatio = options.minPlacedRatio ?? 0.6;
  const errors = [];
  if (!puzzle?.grid?.length) errors.push('Puzzle is missing grid.');
  if (!puzzle?.words?.length) errors.push('Puzzle is missing placed words.');
  if (puzzle?.stats?.submittedCount && puzzle.stats.placedCount / puzzle.stats.submittedCount < minPlacedRatio) {
    errors.push(`Only ${puzzle.stats.placedCount}/${puzzle.stats.submittedCount} entries were placed.`);
  }
  const seen = new Set();
  for (const word of puzzle.words || []) {
    const answer = normalizeAnswer(word.answer);
    if (seen.has(answer)) errors.push(`Duplicate placed answer: ${word.answer}`);
    seen.add(answer);
    if (!['across', 'down'].includes(word.orientation)) errors.push(`Bad direction for ${word.answer}.`);
    for (let i = 0; i < answer.length; i++) {
      const x = word.startx - 1 + (word.orientation === 'across' ? i : 0);
      const y = word.starty - 1 + (word.orientation === 'down' ? i : 0);
      const gridLetter = puzzle.grid?.[y]?.[x];
      if (gridLetter !== answer[i]) errors.push(`Grid mismatch for ${word.answer} at letter ${i + 1}.`);
    }
  }
  const filled = countFilledCells(puzzle.grid || []);
  if (filled > 0 && !isConnected(puzzle.grid)) errors.push('Grid contains disconnected islands.');
  return errors;
}

export function countFilledCells(grid) {
  return grid.flat().filter((cell) => cell && cell !== BLACK).length;
}

export function isConnected(grid) {
  const cells = [];
  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[y].length; x++) {
      if (grid[y][x] !== BLACK) cells.push([x, y]);
    }
  }
  if (cells.length <= 1) return true;
  const start = cells[0];
  const seen = new Set([start.join(',')]);
  const queue = [start];
  while (queue.length) {
    const [x, y] = queue.shift();
    for (const [nx, ny] of [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]]) {
      if (grid[ny]?.[nx] && grid[ny][nx] !== BLACK) {
        const key = `${nx},${ny}`;
        if (!seen.has(key)) { seen.add(key); queue.push([nx, ny]); }
      }
    }
  }
  return seen.size === cells.length;
}
