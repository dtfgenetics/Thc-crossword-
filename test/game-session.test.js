import { describe, expect, it } from 'vitest';
import {
  addCheck,
  addHint,
  createGameSession,
  elapsedSeconds,
  finishGameSession,
  forfeitGameSession,
  formatElapsed,
  scoreGameSession,
  shareResultText,
  startGameSession,
  updateCareerStats
} from '../src/crossword/gameSession.js';

describe('crossword game session', () => {
  it('starts once and tracks elapsed time', () => {
    const session = startGameSession(createGameSession('2026-W36'), 1000);
    expect(startGameSession(session, 5000).startedAt).toBe(1000);
    expect(elapsedSeconds(session, 61000)).toBe(60);
    expect(formatElapsed(65)).toBe('1:05');
  });

  it('tracks hints and unique checked mistakes', () => {
    let session = addHint(createGameSession('2026-W36'));
    session = addCheck(session, ['1,1', '2,1']);
    session = addCheck(session, ['2,1', '3,1']);
    expect(session.hints).toBe(1);
    expect(session.checks).toBe(2);
    expect(new Set(session.mistakeCells)).toEqual(new Set(['1,1', '2,1', '3,1']));
  });

  it('finishes once and produces a bounded score', () => {
    let session = startGameSession(createGameSession('2026-W36'), 1000);
    session = addHint(addCheck(session, ['1,1']));
    session = finishGameSession(session, 61000);
    expect(session.completedAt).toBe(61000);
    expect(scoreGameSession(session, 60)).toBe(888);
    expect(scoreGameSession({ ...session, hints: 99 }, 99999)).toBe(100);
  });

  it('forces a minimum score after reveal-all forfeits the run', () => {
    const session = forfeitGameSession(startGameSession(createGameSession('2026-W36'), 1000));
    expect(session.forfeited).toBe(true);
    expect(scoreGameSession(session, 1)).toBe(100);
  });

  it('updates career stats without double-counting a solved puzzle', () => {
    const first = updateCareerStats({}, { puzzleId: '2026-W36', score: 700, seconds: 120, completedAt: 1 });
    const replay = updateCareerStats(first, { puzzleId: '2026-W36', score: 800, seconds: 90, completedAt: 2 });
    expect(replay.gamesSolved).toBe(1);
    expect(replay.bestScore).toBe(800);
    expect(replay.bestTimeSeconds).toBe(90);
  });

  it('creates a shareable result summary', () => {
    const text = shareResultText({ puzzleTitle: 'Plant Science', puzzleId: '2026-W36', score: 900, seconds: 75, hints: 1, mistakes: 0 });
    expect(text).toContain('Plant Science');
    expect(text).toContain('1:15');
    expect(text).toContain('900 pts');
  });
});
