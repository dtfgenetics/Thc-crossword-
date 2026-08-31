import { describe, expect, it } from 'vitest';
import { classifyPuzzleId, puzzleExportBase, puzzleJsonPath, safePuzzleId } from './routes.js';

describe('crossword route helpers', () => {
  it('classifies daily puzzle IDs', () => {
    expect(classifyPuzzleId('2026-06-29')).toEqual({ id: '2026-06-29', type: 'daily' });
    expect(safePuzzleId('2026-06-29')).toBe('2026-06-29');
  });

  it('classifies weekly puzzle IDs without breaking existing weekly support', () => {
    expect(classifyPuzzleId('2026-W26')).toEqual({ id: '2026-W26', type: 'weekly' });
    expect(safePuzzleId('2026-W26')).toBe('2026-W26');
  });

  it('rejects unsafe or malformed puzzle IDs', () => {
    expect(classifyPuzzleId('../current')).toBeNull();
    expect(safePuzzleId('2026-99-99')).toBeNull();
  });

  it('routes daily JSON and export files into the daily puzzle folder', () => {
    expect(puzzleJsonPath('2026-06-29')).toBe('/puzzles/daily/2026-06-29.json');
    expect(puzzleExportBase('2026-06-29')).toBe('/puzzles/daily/2026-06-29');
  });

  it('routes weekly JSON and export files into the legacy weekly puzzle folder', () => {
    expect(puzzleJsonPath('2026-W26')).toBe('/puzzles/2026-W26.json');
    expect(puzzleExportBase('2026-W26')).toBe('/puzzles/2026-W26');
  });

  it('falls back to current puzzle when no safe ID is supplied', () => {
    expect(puzzleJsonPath(null)).toBe('/puzzles/current.json');
    expect(puzzleExportBase(null)).toBeNull();
  });
});
