import { describe, expect, it } from 'vitest';
import { normalizeAnswer, groupWords } from '../src/crossword/format.js';
import { validateClueBank, validatePuzzle, isConnected } from '../src/crossword/validate.js';
import { exportIpuz, exportExolve } from '../src/crossword/exporters.js';
import { parseIpuzJson, validateIpuz, ipuzToInternalPuzzle } from '../src/crossword/ipuz.js';
import { parseExolveText, validateExolveText } from '../src/crossword/exolve.js';
import { adapterById, assertPermissiveAdapter, enabledGeneratorAdapters } from '../src/crossword/generatorAdapters.js';
import { selectEntries } from '../src/crossword/selectEntries.js';
import { progressStats, isSolved } from '../src/crossword/progress.js';
import { safePuzzleId, puzzleJsonPath, puzzleExportBase } from '../src/crossword/routes.js';
import { currentIsoWeek, isValidIsoWeek, latestArchivedWeek, nextIsoWeek, weeksInIsoYear } from '../src/crossword/week.js';
import { buildWeeklyPuzzle } from '../src/crossword/generatePuzzle.js';
import { generateLocalLayout } from '../src/crossword/localLayout.js';

const puzzle = {
  id: 'test-week',
  title: 'Test Puzzle',
  subtitle: 'Test subtitle',
  adultUseNotice: 'Adults only where legal.',
  grid: [['C', 'O', 'L', 'A'], ['.', '.', '.', '.']],
  rows: 2,
  cols: 4,
  words: [{ answer: 'COLA', clue: 'Main flower cluster', startx: 1, starty: 1, position: 1, orientation: 'across' }],
  clues: { across: [{ answer: 'COLA', clue: 'Main flower cluster', startx: 1, starty: 1, position: 1, orientation: 'across' }], down: [] },
  stats: { submittedCount: 1, placedCount: 1, score: 990 }
};

const miniBank = [
  { answer: 'Cola', clue: 'Main flower cluster', category: 'Cultivation', difficulty: 'easy' },
  { answer: 'Clone', clue: 'Cutting that preserves genetics', category: 'Cultivation', difficulty: 'easy' },
  { answer: 'Node', clue: 'Point where leaves or branches emerge', category: 'Plant Anatomy', difficulty: 'easy' },
  { answer: 'Rosin', clue: 'Solventless extract made with heat and pressure', category: 'Extracts', difficulty: 'easy' },
  { answer: 'Kief', clue: 'Loose resin glands from flower', category: 'Extracts', difficulty: 'easy' },
  { answer: 'Seed', clue: 'Starting point for a genetic run', category: 'Seeds', difficulty: 'easy' }
];

describe('crossword helpers', () => {
  it('normalizes answers for grid use', () => {
    expect(normalizeAnswer('Blue Mango')).toBe('BLUEMANGO');
    expect(normalizeAnswer('Cal-Mag & K')).toBe('CALMAGANDK');
  });

  it('groups across and down words', () => {
    const grouped = groupWords(puzzle.words);
    expect(grouped.across).toHaveLength(1);
    expect(grouped.down).toHaveLength(0);
  });

  it('validates clue bank entries', () => {
    expect(validateClueBank([{ answer: 'Cola', clue: 'Main flower cluster' }])).toEqual([]);
    expect(validateClueBank([{ answer: 'A', clue: '' }]).length).toBeGreaterThan(0);
  });

  it('validates puzzle grid consistency', () => {
    expect(validatePuzzle(puzzle)).toEqual([]);
  });

  it('detects disconnected islands', () => {
    expect(isConnected([['A', '.'], ['.', 'B']])).toBe(false);
  });

  it('exports IPUZ and Exolve formats', () => {
    expect(exportIpuz(puzzle)).toContain('Test Puzzle');
    expect(exportExolve(puzzle)).toContain('exolve-title: Test Puzzle');
  });

  it('validates and parses exported IPUZ', () => {
    const ipuz = parseIpuzJson(exportIpuz(puzzle));
    expect(validateIpuz(ipuz)).toEqual([]);
    expect(ipuzToInternalPuzzle(ipuz).grid[0]).toEqual(['C', 'O', 'L', 'A']);
  });

  it('validates and parses exported Exolve text', () => {
    const exolve = exportExolve(puzzle);
    expect(validateExolveText(exolve)).toEqual([]);
    expect(parseExolveText(exolve).grid).toEqual(['COLA', '....']);
  });

  it('tracks approved generator adapters', () => {
    expect(enabledGeneratorAdapters().map((adapter) => adapter.id)).toContain('crossword-layout-generator');
    expect(assertPermissiveAdapter(adapterById('crossword-layout-generator'))).toBe(true);
    expect(adapterById('gaoryrt-crossword-generator').enabled).toBe(false);
  });

  it('sanitizes puzzle route ids before building file paths', () => {
    expect(safePuzzleId('2026-W26')).toBe('2026-W26');
    expect(safePuzzleId('2026-W99')).toBeNull();
    expect(safePuzzleId('../secret')).toBeNull();
    expect(safePuzzleId('2026-W26.json')).toBeNull();
    expect(puzzleJsonPath('2026-W26')).toBe('/puzzles/2026-W26.json');
    expect(puzzleJsonPath('../secret')).toBe('/puzzles/current.json');
    expect(puzzleExportBase('2026-W26')).toBe('/puzzles/2026-W26');
  });

  it('generates a local layout from reusable engine code', () => {
    const layout = generateLocalLayout(miniBank.map((entry) => ({ ...entry, answer: normalizeAnswer(entry.answer) })), () => 0.5);
    expect(layout.placedCount).toBeGreaterThan(0);
    expect(layout.grid.length).toBeGreaterThan(0);
  });

  it('builds a weekly puzzle from reusable generation core', () => {
    const weekly = buildWeeklyPuzzle({
      bank: miniBank,
      themes: [{ id: 'test', name: 'Test Theme', description: 'Test', preferredCategories: ['Cultivation', 'Extracts', 'Seeds', 'Plant Anatomy'] }],
      week: '2026-W26',
      themeId: 'test',
      max: 6,
      attempts: 8
    });
    expect(weekly.week).toBe('2026-W26');
    expect(weekly.words.length).toBeGreaterThan(0);
  });

  it('selects entries by preferred theme categories', () => {
    const selected = selectEntries({ bank: miniBank, theme: { preferredCategories: ['Extracts'] }, max: 1, random: () => 0 });
    expect(selected[0].answer).toBe('Rosin');
  });

  it('filters duplicate normalized answers during selection', () => {
    const selected = selectEntries({
      bank: [
        { answer: 'Blue Mango', clue: 'First version', category: 'Lineage', difficulty: 'easy' },
        { answer: 'Blue-Mango', clue: 'Duplicate punctuation version', category: 'Lineage', difficulty: 'easy' },
        { answer: 'Rosin', clue: 'Solventless extract', category: 'Extracts', difficulty: 'easy' }
      ],
      theme: { preferredCategories: ['Lineage', 'Extracts'] },
      max: 3,
      random: () => 0
    });
    expect(selected.map((entry) => normalizeAnswer(entry.answer))).toEqual(['BLUEMANGO', 'ROSIN']);
  });

  it('handles ISO week rollover correctly', () => {
    expect(weeksInIsoYear(2026)).toBe(53);
    expect(isValidIsoWeek('2026-W53')).toBe(true);
    expect(isValidIsoWeek('2026-W54')).toBe(false);
    expect(nextIsoWeek('2026-W26')).toBe('2026-W27');
    expect(nextIsoWeek('2026-W53')).toBe('2027-W01');
    expect(latestArchivedWeek(['2026-W02', '2026-W99', '2026-W10', 'bad'])).toBe('2026-W10');
    expect(currentIsoWeek(new Date(Date.UTC(2026, 5, 23)))).toBe('2026-W26');
  });

  it('tracks crossword progress and solved state', () => {
    const partial = progressStats(puzzle, { '1,1': 'C', '2,1': 'X' });
    expect(partial.total).toBe(4);
    expect(partial.filled).toBe(2);
    expect(partial.correct).toBe(1);
    expect(partial.solved).toBe(false);
    expect(isSolved(puzzle, { '1,1': 'C', '2,1': 'O', '3,1': 'L', '4,1': 'A' })).toBe(true);
  });
});
