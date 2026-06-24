import { BLACK } from './format.js';
import { shuffle } from './random.js';

export function generateLocalLayout(words, random = Math.random) {
  if (!words.length) return null;
  const size = 41;
  const grid = Array.from({ length: size }, () => Array.from({ length: size }, () => ''));
  const ordered = shuffle(words, random).sort((a, b) => b.answer.length - a.answer.length);
  const placed = [];
  let position = 1;
  const first = ordered[0];
  placed.push(placeWord(grid, first, 20 - Math.floor(first.answer.length / 2), 20, 'across', position++));

  for (const word of ordered.slice(1)) {
    const placement = bestPlacement(grid, placed, word);
    if (placement) placed.push(placeWord(grid, word, placement.x, placement.y, placement.direction, position++));
  }

  return cropGrid(grid, placed, words.length);
}

export function bestPlacement(grid, placed, word) {
  let best = null;
  for (const existing of placed) {
    for (let i = 0; i < word.answer.length; i++) {
      for (let j = 0; j < existing.answer.length; j++) {
        if (word.answer[i] !== existing.answer[j]) continue;
        const direction = existing.orientation === 'across' ? 'down' : 'across';
        const x = existing.startx - 1 + (existing.orientation === 'across' ? j : 0) - (direction === 'across' ? i : 0);
        const y = existing.starty - 1 + (existing.orientation === 'down' ? j : 0) - (direction === 'down' ? i : 0);
        const candidate = canPlace(grid, word.answer, x, y, direction);
        if (candidate && (!best || candidate.crossings > best.crossings)) best = { x, y, direction, crossings: candidate.crossings };
      }
    }
  }
  return best;
}

export function canPlace(grid, answer, x, y, direction) {
  const dx = direction === 'across' ? 1 : 0;
  const dy = direction === 'down' ? 1 : 0;
  if (cell(grid, x - dx, y - dy)) return false;
  if (cell(grid, x + dx * answer.length, y + dy * answer.length)) return false;
  let crossings = 0;
  for (let i = 0; i < answer.length; i++) {
    const cx = x + dx * i;
    const cy = y + dy * i;
    const existing = cell(grid, cx, cy);
    if (existing === null || (existing && existing !== answer[i])) return false;
    if (existing === answer[i]) crossings++;
    if (!existing && direction === 'across' && (cell(grid, cx, cy - 1) || cell(grid, cx, cy + 1))) return false;
    if (!existing && direction === 'down' && (cell(grid, cx - 1, cy) || cell(grid, cx + 1, cy))) return false;
  }
  return { crossings };
}

export function placeWord(grid, word, x, y, orientation, position) {
  const dx = orientation === 'across' ? 1 : 0;
  const dy = orientation === 'down' ? 1 : 0;
  for (let i = 0; i < word.answer.length; i++) grid[y + dy * i][x + dx * i] = word.answer[i];
  return { ...word, startx: x + 1, starty: y + 1, orientation, position };
}

export function cropGrid(grid, placed, submittedCount) {
  if (!placed.length) return null;
  let minX = 99, minY = 99, maxX = 0, maxY = 0;
  for (const word of placed) {
    const dx = word.orientation === 'across' ? 1 : 0;
    const dy = word.orientation === 'down' ? 1 : 0;
    minX = Math.min(minX, word.startx - 1);
    minY = Math.min(minY, word.starty - 1);
    maxX = Math.max(maxX, word.startx - 1 + dx * (word.answer.length - 1));
    maxY = Math.max(maxY, word.starty - 1 + dy * (word.answer.length - 1));
  }
  minX = Math.max(0, minX - 1); minY = Math.max(0, minY - 1);
  maxX = Math.min(grid[0].length - 1, maxX + 1); maxY = Math.min(grid.length - 1, maxY + 1);
  const table = [];
  for (let y = minY; y <= maxY; y++) table.push(grid[y].slice(minX, maxX + 1).map((value) => value || BLACK));
  const words = placed.map((word) => ({ ...word, startx: word.startx - minX, starty: word.starty - minY }));
  renumberWords(words);
  return { grid: table, rows: table.length, cols: table[0].length, words, submittedCount, placedCount: words.length, source: 'local-layout-engine' };
}

export function renumberWords(words) {
  const starts = [...new Set(words.map((word) => `${word.starty}:${word.startx}`))]
    .map((key) => key.split(':').map(Number))
    .sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const numbers = new Map(starts.map(([y, x], index) => [`${y}:${x}`, index + 1]));
  for (const word of words) word.position = numbers.get(`${word.starty}:${word.startx}`);
  words.sort((a, b) => a.position - b.position || a.orientation.localeCompare(b.orientation));
}

function cell(grid, x, y) {
  if (x < 0 || y < 0 || y >= grid.length || x >= grid[0].length) return null;
  return grid[y][x];
}
