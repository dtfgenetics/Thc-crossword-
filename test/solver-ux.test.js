import { describe, expect, it } from 'vitest';
import fs from 'node:fs';

const html = fs.readFileSync('index.html', 'utf8');
const js = fs.readFileSync('src/solver-ux.js', 'utf8');
const css = fs.readFileSync('src/solver-ux.css', 'utf8');

describe('researched crossword solver UX', () => {
  it('loads after the gameplay layer', () => {
    const gameplay = html.indexOf('/src/game-polish.js');
    const solver = html.indexOf('/src/solver-ux.js');
    expect(gameplay).toBeGreaterThanOrEqual(0);
    expect(solver).toBeGreaterThan(gameplay);
  });

  it('provides a mobile current-clue surface', () => {
    expect(js).toContain('solver-current-clue');
    expect(js).toContain('active-clue');
    expect(css).toContain('@media (max-width: 880px)');
    expect(css).toContain('position: sticky');
  });

  it('persists solver preferences', () => {
    expect(js).toContain("thc-crossword:solver-preferences");
    expect(js).toContain('showTimer');
    expect(js).toContain('compactClues');
    expect(js).toContain('localStorage.setItem');
  });

  it('keeps interactive controls at least 44px tall', () => {
    expect(css.match(/min-height: 44px/g)?.length || 0).toBeGreaterThanOrEqual(3);
  });

  it('uses a strong visible keyboard focus indicator', () => {
    expect(css).toContain(':focus-visible');
    expect(css).toContain('outline: 3px solid');
  });
});
