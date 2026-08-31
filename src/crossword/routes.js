import { isValidIsoWeek } from './week.js';
import { isValidDailyDate } from './date.js';

export function classifyPuzzleId(value) {
  const id = String(value || '').trim();
  if (isValidDailyDate(id)) return { id, type: 'daily' };
  if (isValidIsoWeek(id)) return { id, type: 'weekly' };
  return null;
}

export function safePuzzleId(value) {
  return classifyPuzzleId(value)?.id || null;
}

export function puzzleJsonPath(id) {
  const puzzle = classifyPuzzleId(id);
  if (puzzle?.type === 'daily') return `/puzzles/daily/${encodeURIComponent(puzzle.id)}.json`;
  if (puzzle?.type === 'weekly') return `/puzzles/${encodeURIComponent(puzzle.id)}.json`;
  return '/puzzles/current.json';
}

export function puzzleExportBase(id) {
  const puzzle = classifyPuzzleId(id);
  if (puzzle?.type === 'daily') return `/puzzles/daily/${encodeURIComponent(puzzle.id)}`;
  if (puzzle?.type === 'weekly') return `/puzzles/${encodeURIComponent(puzzle.id)}`;
  return null;
}
