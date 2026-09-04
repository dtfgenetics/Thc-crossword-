function key(x, y) {
  return `${x},${y}`;
}

export function wordCells(word) {
  if (!word) return [];
  return Array.from({ length: word.answer.length }, (_, index) => ({
    x: word.startx + (word.orientation === 'across' ? index : 0),
    y: word.starty + (word.orientation === 'down' ? index : 0)
  }));
}

export function nextWord(words, current, delta = 1) {
  if (!Array.isArray(words) || !words.length) return null;
  const index = words.findIndex((word) => word.startx === current?.startx
    && word.starty === current?.starty
    && word.orientation === current?.orientation);
  const base = index < 0 ? 0 : index;
  return words[(base + delta + words.length) % words.length];
}

export function nextCellInWord(word, active, letters = {}, { delta = 1, skipFilled = true } = {}) {
  const cells = wordCells(word);
  if (!cells.length) return null;
  const current = cells.findIndex((cell) => cell.x === active?.x && cell.y === active?.y);
  const start = current < 0 ? 0 : current;
  for (let step = 1; step <= cells.length; step += 1) {
    const index = start + (delta * step);
    if (index < 0 || index >= cells.length) break;
    const candidate = cells[index];
    if (!skipFilled || !letters[key(candidate.x, candidate.y)]) return candidate;
  }
  return null;
}

export function evaluateScope(puzzle, letters, cells) {
  const evaluated = [];
  for (const cell of cells || []) {
    const solution = puzzle?.grid?.[cell.y - 1]?.[cell.x - 1];
    if (!solution || solution === '.') continue;
    const value = String(letters?.[key(cell.x, cell.y)] || '').toUpperCase();
    evaluated.push({ ...cell, value, solution, filled: Boolean(value), correct: value === solution });
  }
  return {
    cells: evaluated,
    filled: evaluated.filter((cell) => cell.filled).length,
    correct: evaluated.filter((cell) => cell.correct).length,
    wrong: evaluated.filter((cell) => cell.filled && !cell.correct).map((cell) => key(cell.x, cell.y))
  };
}
