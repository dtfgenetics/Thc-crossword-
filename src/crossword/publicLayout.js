import { createRequire } from 'node:module';
import { normalizeAnswer, BLACK } from './format.js';

const require = createRequire(import.meta.url);

export function generatePublicLayout(words) {
  try {
    if (!words.length) return null;
    const clg = require('crossword-layout-generator');
    const layout = clg.generateLayout(words.map((word) => ({ answer: word.answer, clue: word.clue })));
    if (!layout?.result?.length || !layout?.table?.length) return null;
    const placed = layout.result
      .filter((word) => word.orientation !== 'none')
      .map((word) => {
        const match = words.find((entry) => entry.answer === normalizeAnswer(word.answer));
        return { ...match, startx: Number(word.startx), starty: Number(word.starty), orientation: word.orientation, position: Number(word.position) };
      })
      .filter((word) => word.answer && Number.isFinite(word.startx) && Number.isFinite(word.starty));
    const grid = normalizePublicTable(layout.table);
    return { grid, rows: grid.length, cols: grid[0].length, words: placed, submittedCount: words.length, placedCount: placed.length, source: 'crossword-layout-generator' };
  } catch {
    return null;
  }
}

function normalizePublicTable(table) {
  return table.map((row) => Array.from(row).map((value) => normalizeAnswer(value)[0] || BLACK));
}
