import { describe, expect, it } from 'vitest';
import fs from 'node:fs';

const player = fs.readFileSync('src/main.js', 'utf8');
const styles = fs.readFileSync('src/styles.css', 'utf8');

describe('crossword player interaction contract', () => {
  it('keeps mouse users on a real grid cell and touch users on the hidden input', () => {
    expect(player).toContain("window.matchMedia?.('(pointer: coarse)').matches");
    expect(player).toContain('navigator.maxTouchPoints > 0');
    expect(player).toContain('if (usesTouchKeyboard()) focusLetterInput();');
    expect(player).toContain('else focusActiveCell();');
  });

  it('only toggles direction on a square that actually crosses two words', () => {
    expect(player).toContain('const hasAcross = meta.across.has(cellKey);');
    expect(player).toContain('const hasDown = meta.down.has(cellKey);');
    expect(player).toContain('sameCell && hasAcross && hasDown');
    expect(player).toContain('resolveOrientation(x, y, orientation)');
  });

  it('uses roving focus and removes blocked cells from keyboard navigation', () => {
    expect(player).toContain('button.disabled = true;');
    expect(player).toContain('button.tabIndex = -1;');
    expect(player).toContain("button.setAttribute('aria-selected', 'true')");
    expect(player).toContain("role=\"grid\"");
  });

  it('highlights the active clue and exposes live status updates', () => {
    expect(player).toContain("button.classList.toggle('active-clue', matches)");
    expect(player).toContain("button.setAttribute('aria-current', 'true')");
    expect(player).toContain('aria-live="polite"');
    expect(styles).toContain('.clues button.active-clue');
  });

  it('uses conventional backspace behavior when the current square is empty', () => {
    const deleteStart = player.indexOf('function deleteLetter()');
    const advanceBack = player.indexOf('advance(-1);', deleteStart);
    const deletePrevious = player.indexOf('delete letters[key(active.x, active.y)];', advanceBack);
    expect(deleteStart).toBeGreaterThanOrEqual(0);
    expect(advanceBack).toBeGreaterThan(deleteStart);
    expect(deletePrevious).toBeGreaterThan(advanceBack);
  });
});
