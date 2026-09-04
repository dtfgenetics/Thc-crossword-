import './game-polish.css';
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
} from './crossword/gameSession.js';

const SESSION_PREFIX = 'thc-crossword:session:';
const CAREER_KEY = 'thc-crossword:career';
let mounted = false;
let timerId = null;
let puzzle = null;
let session = null;

function safeJson(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key) || 'null') ?? fallback; }
  catch { return fallback; }
}

function saveSession() {
  if (session?.puzzleId) localStorage.setItem(`${SESSION_PREFIX}${session.puzzleId}`, JSON.stringify(session));
}

function currentPuzzlePath() {
  const id = new URLSearchParams(location.search).get('puzzle');
  return id && /^\d{4}-W\d{2}$/.test(id) ? `/puzzles/${id}.json` : '/puzzles/current.json';
}

async function loadPuzzle() {
  try {
    const response = await fetch(currentPuzzlePath(), { cache: 'no-cache' });
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

function startSession() {
  if (!session || session.completedAt) return;
  const next = startGameSession(session);
  if (next !== session) {
    session = next;
    saveSession();
  }
}

function timerText() {
  return formatElapsed(elapsedSeconds(session || createGameSession('demo')));
}

function updateHud() {
  const timer = document.querySelector('[data-game-stat="timer"]');
  const score = document.querySelector('[data-game-stat="score"]');
  const hints = document.querySelector('[data-game-stat="hints"]');
  if (timer) timer.textContent = timerText();
  if (score) score.textContent = String(scoreGameSession(session || createGameSession('demo')));
  if (hints) hints.textContent = String(session?.hints || 0);
}

function ensureTimer() {
  clearInterval(timerId);
  timerId = setInterval(updateHud, 1000);
  updateHud();
}

function wrongCells() {
  return [...document.querySelectorAll('.cell.wrong')].map((cell) => `${cell.dataset.x},${cell.dataset.y}`);
}

function revealActiveCell() {
  if (!puzzle || !session || session.completedAt) return;
  const active = document.querySelector('.cell.active');
  const input = document.querySelector('#mobile-input');
  if (!active || !input) return;
  const x = Number(active.dataset.x);
  const y = Number(active.dataset.y);
  const solution = puzzle.grid?.[y - 1]?.[x - 1];
  if (!solution || solution === '.') return;

  startSession();
  session = addHint(session);
  saveSession();
  input.value = solution;
  input.dispatchEvent(new Event('input', { bubbles: true }));
  updateHud();
}

function careerStats() {
  return safeJson(CAREER_KEY, { gamesSolved: 0, bestScore: 0, bestTimeSeconds: 0, solvedIds: [] });
}

function completeGame() {
  if (!session || session.completedAt || !puzzle) return;
  session = finishGameSession(session);
  saveSession();
  const seconds = elapsedSeconds(session);
  const score = scoreGameSession(session, seconds);
  const career = updateCareerStats(careerStats(), {
    puzzleId: puzzle.id,
    score,
    seconds,
    completedAt: session.completedAt
  });
  localStorage.setItem(CAREER_KEY, JSON.stringify(career));
  renderCompletion(score, seconds, career);
  updateHud();
}

function renderCompletion(score, seconds, career) {
  document.querySelector('.completion-card')?.remove();
  const card = document.createElement('section');
  card.className = 'completion-card';
  card.setAttribute('role', 'dialog');
  card.setAttribute('aria-modal', 'true');
  card.setAttribute('aria-label', 'Crossword complete');
  card.innerHTML = `
    <div class="completion-burst">SOLVED</div>
    <h2>Puzzle cracked.</h2>
    <p class="completion-copy">You finished <strong>${puzzle.title}</strong>.</p>
    <div class="completion-stats">
      <div><span>Score</span><strong>${score}</strong></div>
      <div><span>Time</span><strong>${formatElapsed(seconds)}</strong></div>
      <div><span>Hints</span><strong>${session.hints || 0}</strong></div>
      <div><span>Mistakes</span><strong>${session.mistakeCells?.length || 0}</strong></div>
    </div>
    <p class="career-line">Career: ${career.gamesSolved} solved • Best ${career.bestScore} pts • Fastest ${formatElapsed(career.bestTimeSeconds)}</p>
    <div class="completion-actions">
      <button type="button" data-completion-action="share">Share result</button>
      <button type="button" class="secondary" data-completion-action="close">Keep exploring</button>
    </div>`;
  document.body.appendChild(card);
  card.querySelector('[data-completion-action="close"]').addEventListener('click', () => card.remove());
  card.querySelector('[data-completion-action="share"]').addEventListener('click', async (event) => {
    const text = shareResultText({
      puzzleTitle: puzzle.title,
      puzzleId: puzzle.id,
      score,
      seconds,
      hints: session.hints || 0,
      mistakes: session.mistakeCells?.length || 0
    });
    try {
      await navigator.clipboard.writeText(text);
      event.currentTarget.textContent = 'Copied';
    } catch {
      event.currentTarget.textContent = 'Copy unavailable';
    }
  });
  card.querySelector('button')?.focus();
}

function enhanceHeader() {
  const hero = document.querySelector('.hero');
  if (!hero || hero.querySelector('.game-meta')) return;
  const h1 = hero.querySelector('h1');
  const meta = document.createElement('div');
  meta.className = 'game-meta';
  meta.innerHTML = `
    <span class="game-pill">${puzzle?.week || puzzle?.id || 'Weekly'}</span>
    <span class="game-pill theme-pill">${puzzle?.theme?.name || 'Mixed challenge'}</span>`;
  h1?.after(meta);

  const notice = hero.querySelector('.notice');
  if (notice) notice.classList.add('game-legal-note');

  const archive = hero.querySelectorAll('.archive-panel');
  archive.forEach((panel, index) => {
    const details = document.createElement('details');
    details.className = 'game-secondary';
    const summary = document.createElement('summary');
    summary.textContent = index === 0 ? 'Puzzle archive' : 'Puzzle exports';
    panel.replaceWith(details);
    details.append(summary, panel);
  });
}

function enhancePlayPanel() {
  const panel = document.querySelector('.shell > .panel');
  const toolbar = document.querySelector('.toolbar');
  const progress = document.querySelector('#progress');
  if (!panel || !toolbar || panel.querySelector('.game-hud')) return;

  const hud = document.createElement('section');
  hud.className = 'game-hud';
  hud.setAttribute('aria-label', 'Game stats');
  hud.innerHTML = `
    <div><span>Time</span><strong data-game-stat="timer">0:00</strong></div>
    <div><span>Score</span><strong data-game-stat="score">1000</strong></div>
    <div><span>Hints</span><strong data-game-stat="hints">0</strong></div>`;
  toolbar.before(hud);

  if (!toolbar.querySelector('[data-game-action="hint"]')) {
    const hint = document.createElement('button');
    hint.type = 'button';
    hint.dataset.gameAction = 'hint';
    hint.textContent = 'Hint';
    const check = toolbar.querySelector('[data-action="check"]');
    check?.after(hint);
    hint.addEventListener('click', revealActiveCell);
  }

  const reveal = toolbar.querySelector('[data-action="reveal"]');
  if (reveal) {
    reveal.classList.add('danger-action');
    reveal.textContent = 'Reveal all';
  }
  toolbar.querySelector('[data-action="clear"]')?.classList.add('secondary-action');
  toolbar.querySelector('[data-action="print"]')?.classList.add('secondary-action');
  if (progress) progress.classList.add('game-progress');
}

function addHowToPlay() {
  const clues = document.querySelector('.clues');
  if (!clues || clues.querySelector('.how-to-play')) return;
  const details = document.createElement('details');
  details.className = 'how-to-play';
  details.innerHTML = `
    <summary>How to play</summary>
    <p>Select a square or clue, then type letters. Arrow keys move around the board. Select a crossing square twice to switch direction. Check marks incorrect entries; Hint reveals one square and lowers your score.</p>`;
  clues.prepend(details);
}

function watchSolvedState() {
  const progress = document.querySelector('#progress');
  if (!progress || progress.dataset.gameObserved) return;
  progress.dataset.gameObserved = 'true';
  const observer = new MutationObserver(() => {
    if (progress.textContent?.startsWith('Solved')) completeGame();
  });
  observer.observe(progress, { childList: true, characterData: true, subtree: true });
  if (progress.textContent?.startsWith('Solved')) completeGame();
}

function blockAction(event, message) {
  if (confirm(message)) return false;
  event.preventDefault();
  event.stopImmediatePropagation();
  return true;
}

function bindSessionEvents() {
  const shell = document.querySelector('.shell');
  if (!shell || shell.dataset.gameBound) return;
  shell.dataset.gameBound = 'true';

  shell.addEventListener('click', (event) => {
    if (event.target.closest('.cell, .clues button')) startSession();
    const action = event.target.closest('[data-action]')?.dataset.action;
    if (action === 'check') {
      requestAnimationFrame(() => {
        session = addCheck(session, wrongCells());
        saveSession();
        updateHud();
      });
    }
    if (action === 'clear') {
      if (blockAction(event, 'Clear every letter in this puzzle and restart the run?')) return;
      session = createGameSession(puzzle.id);
      saveSession();
      updateHud();
    }
    if (action === 'reveal') {
      if (blockAction(event, 'Reveal the entire puzzle? This ends the scored run.')) return;
      startSession();
      session = forfeitGameSession(session);
      saveSession();
      updateHud();
    }
  }, true);

  window.addEventListener('keydown', (event) => {
    if (/^[a-zA-Z]$/.test(event.key) || event.key === 'Backspace') startSession();
  });
}

async function mount() {
  if (mounted || !document.querySelector('.grid')) return;
  mounted = true;
  puzzle = await loadPuzzle();
  if (!puzzle) {
    mounted = false;
    return;
  }
  session = safeJson(`${SESSION_PREFIX}${puzzle.id}`, createGameSession(puzzle.id));
  if (session.puzzleId !== puzzle.id) session = createGameSession(puzzle.id);
  enhanceHeader();
  enhancePlayPanel();
  addHowToPlay();
  bindSessionEvents();
  watchSolvedState();
  ensureTimer();
}

const observer = new MutationObserver(() => mount());
observer.observe(document.querySelector('#app'), { childList: true, subtree: true });
mount();
