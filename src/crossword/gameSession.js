export function createGameSession(puzzleId) {
  return { puzzleId, startedAt: null, completedAt: null, hints: 0, checks: 0, mistakeCells: [] };
}

export function startGameSession(session, now = Date.now()) {
  return session.startedAt ? session : { ...session, startedAt: now };
}

export function addHint(session) {
  return { ...session, hints: (session.hints || 0) + 1 };
}

export function addCheck(session, wrongCellKeys = []) {
  const mistakes = new Set(session.mistakeCells || []);
  for (const cell of wrongCellKeys) mistakes.add(cell);
  return { ...session, checks: (session.checks || 0) + 1, mistakeCells: [...mistakes] };
}

export function finishGameSession(session, now = Date.now()) {
  if (session.completedAt) return session;
  return { ...session, startedAt: session.startedAt || now, completedAt: now };
}

export function elapsedSeconds(session, now = Date.now()) {
  if (!session.startedAt) return 0;
  return Math.max(0, Math.floor(((session.completedAt || now) - session.startedAt) / 1000));
}

export function formatElapsed(totalSeconds) {
  const seconds = Math.max(0, Math.floor(Number(totalSeconds) || 0));
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}

export function scoreGameSession(session, totalSeconds = elapsedSeconds(session)) {
  const timePenalty = Math.floor(Math.max(0, totalSeconds) / 5);
  const hintPenalty = (session.hints || 0) * 75;
  const mistakePenalty = (session.mistakeCells?.length || 0) * 25;
  const checkPenalty = Math.max(0, (session.checks || 0) - 1) * 10;
  return Math.max(100, 1000 - timePenalty - hintPenalty - mistakePenalty - checkPenalty);
}

export function updateCareerStats(stats, result) {
  const current = stats && typeof stats === 'object' ? stats : {};
  const solvedIds = Array.isArray(current.solvedIds) ? current.solvedIds : [];
  const solved = solvedIds.includes(result.puzzleId) ? solvedIds : [...solvedIds, result.puzzleId];
  const bestScore = Math.max(Number(current.bestScore) || 0, result.score);
  const oldBestTime = Number(current.bestTimeSeconds) || 0;
  const bestTimeSeconds = oldBestTime === 0 ? result.seconds : Math.min(oldBestTime, result.seconds);
  return { solvedIds: solved, gamesSolved: solved.length, bestScore, bestTimeSeconds, lastSolvedPuzzleId: result.puzzleId, lastCompletedAt: result.completedAt || Date.now() };
}

export function shareResultText(result) {
  return [
    `Crossword complete: ${result.puzzleTitle}`,
    `${result.puzzleId} • ${formatElapsed(result.seconds)} • ${result.score} pts`,
    `Hints: ${result.hints || 0} • Mistakes: ${result.mistakes || 0}`,
    'dtfseeds.com/games/crossword/'
  ].join('\n');
}
