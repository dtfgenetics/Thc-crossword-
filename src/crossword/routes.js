export function safePuzzleId(value) {
  const id = String(value || '').trim();
  return /^\d{4}-W\d{2}$/.test(id) ? id : null;
}

export function puzzleJsonPath(id) {
  const safeId = safePuzzleId(id);
  return safeId ? `/puzzles/${encodeURIComponent(safeId)}.json` : '/puzzles/current.json';
}

export function puzzleExportBase(id) {
  const safeId = safePuzzleId(id);
  return safeId ? `/puzzles/${encodeURIComponent(safeId)}` : null;
}
