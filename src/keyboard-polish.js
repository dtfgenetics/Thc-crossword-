import { shouldIgnorePuzzleKeyTarget } from './crossword/keyboardTarget.js';

const ARROWS = {
  ArrowLeft: [-1, 0],
  ArrowRight: [1, 0],
  ArrowUp: [0, -1],
  ArrowDown: [0, 1]
};

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

  const step = ARROWS[event.key];
  if (!step) return;

  const active = document.querySelector('.cell.active');
  if (!active) return;

  let x = Number(active.dataset.x) + step[0];
  let y = Number(active.dataset.y) + step[1];
  let candidate = document.querySelector(`.cell[data-x="${x}"][data-y="${y}"]`);

  while (candidate?.classList.contains('black')) {
    x += step[0];
    y += step[1];
    candidate = document.querySelector(`.cell[data-x="${x}"][data-y="${y}"]`);
  }

  if (!candidate || candidate.classList.contains('black')) return;

  event.preventDefault();
  candidate.click();
  window.requestAnimationFrame(() => candidate.focus({ preventScroll: true }));
});
