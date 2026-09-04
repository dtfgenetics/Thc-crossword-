import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import { shouldIgnorePuzzleKeyTarget } from '../src/crossword/keyboardTarget.js';

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
    for (const key of ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown']) {
      expect(keyboard).toContain(key);
    }
    expect(keyboard).toContain("classList.contains('black')");
    expect(keyboard).toContain('candidate.click()');
    expect(keyboard).toContain('candidate.focus');
  });

  it('prevents page scrolling when crossword arrow navigation owns the key', () => {
    const activeLookup = keyboard.indexOf("document.querySelector('.cell.active')");
    const preventDefault = keyboard.indexOf('event.preventDefault()', activeLookup);
    const candidateLookup = keyboard.indexOf('let candidate =', activeLookup);
    expect(activeLookup).toBeGreaterThanOrEqual(0);
    expect(preventDefault).toBeGreaterThan(activeLookup);
    expect(candidateLookup).toBeGreaterThan(preventDefault);
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
