import { isValidIsoWeek } from './week.js';

export function safePuzzleId(value) {
  const id = String(value || '').trim();
  return isValidIsoWeek(id) ? id : null;
}

export function puzzleJsonPath(id) {
  const safeId = safePuzzleId(id);
  return safeId ? `/puzzles/${encodeURIComponent(safeId)}.json` : '/puzzles/current.json';
}

export function puzzleExportBase(id) {
  const safeId = safePuzzleId(id);
  return safeId ? `/puzzles/${encodeURIComponent(safeId)}` : null;
}
