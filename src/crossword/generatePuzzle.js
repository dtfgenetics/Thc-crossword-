import { normalizeAnswer } from './format.js';
import { seededRandom } from './random.js';
import { selectEntries } from './selectEntries.js';
import { generateLocalLayout } from './localLayout.js';
import { generatePublicLayout } from './publicLayout.js';
import { validatePuzzle } from './validate.js';

export function buildWeeklyPuzzle({ bank, themes = [], week, themeId = 'grow-room-basics', max = 28, attempts = 200 }) {
  const theme = findTheme(themes, themeId);
  let best = null;

  for (let index = 0; index < attempts; index++) {
    const random = seededRandom(`${week}:${theme?.id || 'default'}:${index}`);
    const selected = selectEntries({ bank, theme, max, random });
    const picked = selected.map(toGridEntry).filter((entry) => entry.answer.length >= 3);
    if (picked.length < 3) continue;
    const candidates = [generatePublicLayout(picked), generateLocalLayout(picked, random)].filter(isValidCandidate);
    for (const candidate of candidates) {
      if (!best || scoreLayout(candidate) > scoreLayout(best)) best = candidate;
    }
  }

  if (!best) throw new Error(`Unable to generate a puzzle for ${week}. Add more approved clues or lower theme constraints.`);

  const clues = {
    across: best.words.filter((word) => word.orientation === 'across'),
    down: best.words.filter((word) => word.orientation === 'down')
  };
  const themeLabel = theme?.name || 'Mixed Theme';
  const puzzle = {
    id: week,
    week,
    title: `THC Weekly Crossword — ${week}`,
    subtitle: `${themeLabel}: grow terms, breeding language, DTF flavor, and culture clues.`,
    status: 'published',
    theme: theme ? { id: theme.id, name: theme.name, description: theme.description } : null,
    adultUseNotice: 'Cannabis-themed parody and education content for adults 21+ where legal.',
    generatedAt: new Date().toISOString(),
    source: { generator: best.source, publicCode: 'crossword-layout-generator is used when available; local fallback is included.' },
    grid: best.grid,
    rows: best.rows,
    cols: best.cols,
    words: best.words,
    clues,
    stats: { submittedCount: best.submittedCount, placedCount: best.placedCount, score: scoreLayout(best) }
  };

  const errors = validatePuzzle(puzzle, { minPlacedRatio: 0.55 });
  if (errors.length) throw new Error(errors.join('\n'));
  return puzzle;
}

export function findTheme(themes, id) {
  return themes.find((theme) => theme.id === id) || themes[0] || null;
}

export function scoreLayout(layout) {
  return layout.placedCount * 1000 - layout.rows * layout.cols;
}

export function toGridEntry(entry) {
  return { ...entry, answer: normalizeAnswer(entry.answer), displayAnswer: entry.answer };
}

function isValidCandidate(candidate) {
  if (!candidate || !candidate.words?.length || !candidate.grid?.length) return false;
  const tempPuzzle = {
    id: 'candidate',
    grid: candidate.grid,
    rows: candidate.rows,
    cols: candidate.cols,
    words: candidate.words,
    stats: { submittedCount: candidate.submittedCount, placedCount: candidate.placedCount }
  };
  return validatePuzzle(tempPuzzle, { minPlacedRatio: 0.55 }).length === 0;
}
