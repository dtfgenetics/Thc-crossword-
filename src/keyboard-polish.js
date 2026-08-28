const ARROWS = {
  ArrowLeft: [-1, 0],
  ArrowRight: [1, 0],
  ArrowUp: [0, -1],
  ArrowDown: [0, 1]
};

function isTypingTarget(target) {
  return target instanceof HTMLElement && (
    target.matches('input, textarea, select') || target.isContentEditable
  );
}

function findCell(x, y) {
  return document.querySelector(`.cell[data-x="${x}"][data-y="${y}"]`);
}

window.addEventListener('keydown', (event) => {
  const step = ARROWS[event.key];
  if (!step || isTypingTarget(event.target)) return;

  const active = document.querySelector('.cell.active');
  if (!active) return;

  let x = Number(active.dataset.x) + step[0];
  let y = Number(active.dataset.y) + step[1];
  let candidate = findCell(x, y);

  while (candidate?.classList.contains('black')) {
    x += step[0];
    y += step[1];
    candidate = findCell(x, y);
  }

  if (!candidate || candidate.classList.contains('black')) return;

  event.preventDefault();
  candidate.click();
  window.requestAnimationFrame(() => candidate.focus({ preventScroll: true }));
});
