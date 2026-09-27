import { shouldIgnorePuzzleKeyTarget } from './crossword/keyboardTarget.js';
import { navigationIntent, wordEdgeCoordinates } from './crossword/keyboardNavigation.js';

function focusRenderedActiveCell() {
  window.requestAnimationFrame(() => {
    document.querySelector('.cell.active')?.focus({ preventScroll: true });
  });
}

function clickCellAt(x, y) {
  const cell = document.querySelector(`.cell[data-x="${x}"][data-y="${y}"]`);
  if (!cell || cell.classList.contains('black')) return false;
  cell.click();
  focusRenderedActiveCell();
  return true;
}

function stepToOpenCell(active, [dx, dy]) {
  let x = Number(active.dataset.x) + dx;
  let y = Number(active.dataset.y) + dy;
  let candidate = document.querySelector(`.cell[data-x="${x}"][data-y="${y}"]`);

  while (candidate?.classList.contains('black')) {
    x += dx;
    y += dy;
    candidate = document.querySelector(`.cell[data-x="${x}"][data-y="${y}"]`);
  }

  if (!candidate || candidate.classList.contains('black')) return false;
  candidate.click();
  focusRenderedActiveCell();
  return true;
}

function moveToWordEdge(edge) {
  const activeClue = document.querySelector('.clues button.active-clue');
  const orientation = activeClue?.dataset.o === 'down' ? 'down' : 'across';
  const coordinates = wordEdgeCoordinates(document.querySelectorAll('.cell.word, .cell.active'), orientation, edge);
  if (!coordinates) return false;
  return clickCellAt(coordinates.x, coordinates.y);
}

window.addEventListener('keydown', (event) => {
  if (shouldIgnorePuzzleKeyTarget(event.target)) {
    // main.js also owns window-level letter/backspace shortcuts. This listener
    // is deliberately loaded first so focused non-grid controls retain their
    // native keyboard behavior instead of editing the puzzle.
    if (/^[a-zA-Z]$/.test(event.key) || event.key === 'Backspace') {
      event.stopImmediatePropagation();
    }
    return;
  }

  const intent = navigationIntent(event.key);
  if (!intent) return;

  const active = document.querySelector('.cell.active');
  if (!active) return;

  // These keys belong to the crossword while the grid is active. Prevent page
  // scrolling and browser Home/End behavior once the puzzle accepts them.
  event.preventDefault();

  if (intent.type === 'step') {
    stepToOpenCell(active, intent.delta);
    return;
  }

  if (intent.type === 'word-edge') {
    moveToWordEdge(intent.edge);
    return;
  }

  if (intent.type === 'toggle-direction') {
    // main.js already toggles across/down when the currently active crossing
    // is selected again. Reuse that canonical path so pointer and keyboard
    // behavior cannot drift apart.
    active.click();
    focusRenderedActiveCell();
  }
});
