import { describe, expect, it } from 'vitest';
import fs from 'node:fs';

const html = fs.readFileSync('index.html', 'utf8');
const game = fs.readFileSync('src/game-polish.js', 'utf8');
const css = fs.readFileSync('src/game-polish.css', 'utf8');

describe('crossword production game layer', () => {
  it('loads after the core player', () => {
    const main = html.indexOf('/src/main.js');
    const polish = html.indexOf('/src/game-polish.js');
    expect(main).toBeGreaterThanOrEqual(0);
    expect(polish).toBeGreaterThan(main);
  });

  it('adds timer score hints completion and sharing', () => {
    expect(game).toContain('data-game-stat="timer"');
    expect(game).toContain('data-game-stat="score"');
    expect(game).toContain('data-game-stat="hints"');
    expect(game).toContain('completion-card');
    expect(game).toContain('navigator.clipboard.writeText');
  });

  it('guards destructive reset and reveal actions', () => {
    expect(game).toContain("action === 'clear'");
    expect(game).toContain("action === 'reveal'");
    expect(game).toContain('event.stopImmediatePropagation()');
    expect(game).toContain('forfeitGameSession(session)');
  });

  it('keeps secondary archive material out of the primary play hierarchy', () => {
    expect(game).toContain("details.className = 'game-secondary'");
    expect(game).toContain("summary.textContent = index === 0 ? 'Puzzle archive' : 'Puzzle exports'");
  });

  it('has responsive HUD and completion layouts', () => {
    expect(css).toContain('.game-hud');
    expect(css).toContain('.completion-card');
    expect(css).toContain('@media (max-width: 600px)');
    expect(css).toContain('position: sticky');
  });
});
