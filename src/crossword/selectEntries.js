import { normalizeAnswer } from './format.js';

export function selectEntries({ bank, theme, max = 28, random = Math.random }) {
  const approved = bank
    .filter((entry) => entry.approved !== false)
    .map((entry) => ({ ...entry, normalizedAnswer: normalizeAnswer(entry.answer) }))
    .filter((entry) => entry.normalizedAnswer.length >= 3);

  const preferred = new Set(theme?.preferredCategories || []);
  const scored = approved.map((entry) => ({
    entry,
    score: (preferred.has(entry.category) ? 100 : 0) + difficultyWeight(entry.difficulty) + random()
  }));

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, max)
    .map((item) => item.entry);
}

export function difficultyWeight(difficulty) {
  const value = String(difficulty || '').toLowerCase();
  if (value === 'easy') return 8;
  if (value === 'medium') return 6;
  if (value === 'hard') return 4;
  if (value === 'expert') return 2;
  return 1;
}
