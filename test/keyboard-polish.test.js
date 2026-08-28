import { describe, expect, it } from 'vitest';
import fs from 'node:fs';

const keyboard = fs.readFileSync('src/keyboard-polish.js', 'utf8');
const html = fs.readFileSync('index.html', 'utf8');
const styles = fs.readFileSync('src/styles.css', 'utf8');

describe('crossword keyboard polish', () => {
  it('loads the dedicated keyboard helper', () => {
    expect(html).toContain('/src/keyboard-polish.js');
  });

  it('supports all four arrow keys and skips blocked cells', () => {
    for (const key of ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown']) {
      expect(keyboard).toContain(key);
    }
    expect(keyboard).toContain("classList.contains('black')");
    expect(keyboard).toContain('candidate.click()');
    expect(keyboard).toContain('candidate.focus');
  });

  it('keeps keyboard focus visible and respects reduced motion', () => {
    expect(styles).toContain(':focus-visible');
    expect(styles).toContain('prefers-reduced-motion');
  });
});
