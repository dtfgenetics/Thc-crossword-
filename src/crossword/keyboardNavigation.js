export const GRID_ARROW_STEPS = Object.freeze({
  ArrowLeft: [-1, 0],
  ArrowRight: [1, 0],
  ArrowUp: [0, -1],
  ArrowDown: [0, 1],
});

export function navigationIntent(key) {
  if (GRID_ARROW_STEPS[key]) return { type: 'step', delta: GRID_ARROW_STEPS[key] };
  if (key === 'Home') return { type: 'word-edge', edge: 'start' };
  if (key === 'End') return { type: 'word-edge', edge: 'end' };
  if (key === ' ' || key === 'Spacebar') return { type: 'toggle-direction' };
  return null;
}

export function wordEdgeCoordinates(cells, orientation, edge) {
  const playable = [...cells]
    .map((cell) => ({ x: Number(cell?.dataset?.x), y: Number(cell?.dataset?.y) }))
    .filter(({ x, y }) => Number.isFinite(x) && Number.isFinite(y));

  if (!playable.length) return null;

  const axis = orientation === 'down' ? 'y' : 'x';
  playable.sort((a, b) => a[axis] - b[axis]);
  return edge === 'end' ? playable.at(-1) : playable[0];
}
