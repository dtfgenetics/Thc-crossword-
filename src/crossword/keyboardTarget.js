export function shouldIgnorePuzzleKeyTarget(target) {
  const tagName = String(target?.tagName || '').toLowerCase();
  const isCell = Boolean(target?.classList?.contains?.('cell'));

  // Crossword grid cells are buttons, but they are the gameplay surface and
  // must continue accepting letter/backspace and arrow-key shortcuts.
  if (isCell) return false;
  if (target?.isContentEditable) return true;

  return ['a', 'button', 'input', 'textarea', 'select', 'summary'].includes(tagName);
}
