export const BLACK = '.';

export function normalizeAnswer(answer) {
  return String(answer || '')
    .replace(/&/g, 'AND')
    .replace(/[^a-zA-Z]/g, '')
    .toUpperCase();
}

export function clueLength(answer) {
  return normalizeAnswer(answer).length;
}

export function groupWords(words) {
  return {
    across: words.filter((word) => word.orientation === 'across'),
    down: words.filter((word) => word.orientation === 'down')
  };
}

export function sortWords(words) {
  return [...words].sort((a, b) => a.position - b.position || a.orientation.localeCompare(b.orientation));
}

export function puzzleSlug(week) {
  return String(week || '').trim().toUpperCase().replace(/[^0-9A-Z-]/g, '');
}
