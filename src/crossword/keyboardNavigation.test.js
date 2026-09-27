import { describe, expect, it } from 'vitest';
import { GRID_ARROW_STEPS, navigationIntent, wordEdgeCoordinates } from './keyboardNavigation.js';

function cell(x, y) {
  return { dataset: { x: String(x), y: String(y) } };
}

describe('crossword keyboard navigation', () => {
  it('maps arrow keys without changing browser/game semantics', () => {
    expect(navigationIntent('ArrowLeft')).toEqual({ type: 'step', delta: GRID_ARROW_STEPS.ArrowLeft });
    expect(navigationIntent('ArrowDown')).toEqual({ type: 'step', delta: [0, 1] });
  });

  it('supports common crossword Home/End word navigation', () => {
    expect(navigationIntent('Home')).toEqual({ type: 'word-edge', edge: 'start' });
    expect(navigationIntent('End')).toEqual({ type: 'word-edge', edge: 'end' });
  });

  it('uses Space to switch direction at a crossing', () => {
    expect(navigationIntent(' ')).toEqual({ type: 'toggle-direction' });
    expect(navigationIntent('Spacebar')).toEqual({ type: 'toggle-direction' });
  });

  it('finds across and down word boundaries from highlighted cells', () => {
    const across = [cell(5, 3), cell(2, 3), cell(4, 3), cell(3, 3)];
    expect(wordEdgeCoordinates(across, 'across', 'start')).toEqual({ x: 2, y: 3 });
    expect(wordEdgeCoordinates(across, 'across', 'end')).toEqual({ x: 5, y: 3 });

    const down = [cell(7, 8), cell(7, 5), cell(7, 6)];
    expect(wordEdgeCoordinates(down, 'down', 'start')).toEqual({ x: 7, y: 5 });
    expect(wordEdgeCoordinates(down, 'down', 'end')).toEqual({ x: 7, y: 8 });
  });

  it('ignores unrelated keys and malformed cell collections', () => {
    expect(navigationIntent('Tab')).toBeNull();
    expect(wordEdgeCoordinates([], 'across', 'start')).toBeNull();
  });
});
