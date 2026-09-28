import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import { shouldIgnorePuzzleKeyTarget } from '../src/crossword/keyboardTarget.js';
import { GRID_ARROW_STEPS, navigationIntent } from '../src/crossword/keyboardNavigation.js';

const keyboard = fs.readFileSync('src/keyboard-polish.js', 'utf8');
const html = fs.readFileSync('index.html', 'utf8');
const styles = fs.readFileSync('src/styles.css', 'utf8');

function target(tagName, { cell = false, editable = false } = {}) {
  return {
    tagName,
    isContentEditable: editable,
    classList: { contains: (name) => cell && name === 'cell' }
  };
}

describe('crossword keyboard polish', () => {
  it('loads the keyboard guard before the game-wide shortcut listener', () => {
    const guardIndex = html.indexOf('/src/keyboard-polish.js');
    const mainIndex = html.indexOf('/src/main.js');
    expect(guardIndex).toBeGreaterThanOrEqual(0);
    expect(mainIndex).toBeGreaterThan(guardIndex);
  });

  it('supports all four arrow keys and skips blocked cells', () => {
    expect(Object.keys(GRID_ARROW_STEPS)).toEqual(['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown']);
    expect(navigationIntent('ArrowLeft')).toEqual({ type: 'step', delta: [-1, 0] });
    expect(navigationIntent('ArrowRight')).toEqual({ type: 'step', delta: [1, 0] });
    expect(navigationIntent('ArrowUp')).toEqual({ type: 'step', delta: [0, -1] });
    expect(navigationIntent('ArrowDown')).toEqual({ type: 'step', delta: [0, 1] });
    expect(keyboard).toContain("classList.contains('black')");
    expect(keyboard).toContain('candidate.click()');
    expect(keyboard).toContain('focusRenderedActiveCell()');
  });

  it('prevents page scrolling when crossword navigation owns the key', () => {
    const intentLookup = keyboard.indexOf('const intent = navigationIntent(event.key)');
    const activeLookup = keyboard.indexOf("const active = document.querySelector('.cell.active')", intentLookup);
    const preventDefault = keyboard.indexOf('event.preventDefault()', activeLookup);
    expect(intentLookup).toBeGreaterThanOrEqual(0);
    expect(activeLookup).toBeGreaterThan(intentLookup);
    expect(preventDefault).toBeGreaterThan(activeLookup);
  });

  it('refocuses the newly rendered active square after navigation redraws the grid', () => {
    const clickIndex = keyboard.indexOf('candidate.click()');
    const helperCallIndex = keyboard.indexOf('focusRenderedActiveCell()', clickIndex);
    expect(clickIndex).toBeGreaterThanOrEqual(0);
    expect(helperCallIndex).toBeGreaterThan(clickIndex);
    expect(keyboard).toContain("document.querySelector('.cell.active')?.focus");
    expect(keyboard).not.toContain('candidate.focus');
  });

  it('protects non-grid interactive controls from puzzle shortcuts', () => {
    for (const tagName of ['A', 'BUTTON', 'INPUT', 'TEXTAREA', 'SELECT', 'SUMMARY']) {
      expect(shouldIgnorePuzzleKeyTarget(target(tagName))).toBe(true);
    }
    expect(shouldIgnorePuzzleKeyTarget(target('DIV', { editable: true }))).toBe(true);
  });

  it('keeps grid cell buttons as the active keyboard gameplay surface', () => {
    expect(shouldIgnorePuzzleKeyTarget(target('BUTTON', { cell: true }))).toBe(false);
    expect(shouldIgnorePuzzleKeyTarget(target('BODY'))).toBe(false);
    expect(keyboard).toContain('event.stopImmediatePropagation()');
  });

  it('keeps keyboard focus visible and respects reduced motion', () => {
    expect(styles).toContain(':focus-visible');
    expect(styles).toContain('prefers-reduced-motion');
  });

  it('provides phone-sized controls without removing the scrollable full grid', () => {
    expect(styles).toContain('min-height: 44px');
    expect(styles).toContain('@media (max-width: 600px)');
    expect(styles).toContain('repeat(var(--cols), 32px)');
    expect(styles).toContain('overscroll-behavior-inline: contain');
  });
});
