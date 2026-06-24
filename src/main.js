import './styles.css';
import { progressStats } from './crossword/progress.js';

const BLACK = '.';
const app = document.querySelector('#app');

const fallbackPuzzle = {
  id: 'demo',
  title: 'THC Weekly Crossword Demo',
  subtitle: 'Run npm run crossword:generate to publish the weekly puzzle.',
  adultUseNotice: 'Cannabis-themed parody and education content for adults 21+ where legal.',
  grid: [
    ['.', 'R', '.', '.', '.', '.'],
    ['.', 'O', '.', '.', '.', '.'],
    ['.', 'S', 'E', 'E', 'D', '.'],
    ['K', 'I', 'E', 'F', '.', '.'],
    ['.', 'N', '.', '.', '.', '.']
  ],
  rows: 5,
  cols: 6,
  clues: {
    across: [
      { answer: 'SEED', clue: 'Starting point for a new genetic run', startx: 2, starty: 3, position: 2, orientation: 'across' },
      { answer: 'KIEF', clue: 'Collected resin glands often found in a grinder', startx: 1, starty: 4, position: 3, orientation: 'across' }
    ],
    down: [
      { answer: 'ROSIN', clue: 'Solventless extract made with heat and pressure', startx: 2, starty: 1, position: 1, orientation: 'down' }
    ]
  }
};
fallbackPuzzle.words = [...fallbackPuzzle.clues.across, ...fallbackPuzzle.clues.down];

function key(x, y) { return `${x},${y}`; }
function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[char]));
}
function exportBase(puzzle) {
  return puzzle.id && puzzle.id !== 'demo' ? `/puzzles/${encodeURIComponent(puzzle.id)}` : null;
}
function renderExportLinks(puzzle) {
  const base = exportBase(puzzle);
  if (!base) return '<p class="archive-empty">Export files appear after a generated weekly puzzle is loaded.</p>';
  return `<div class="export-list">
    <a href="${base}.json">Playable JSON</a>
    <a href="${base}.ipuz.json">IPUZ</a>
    <a href="${base}.exolve.txt">Exolve</a>
  </div>`;
}
async function loadJson(url, fallback) {
  try {
    const response = await fetch(url, { cache: 'no-cache' });
    if (!response.ok) throw new Error('missing file');
    return await response.json();
  } catch {
    return fallback;
  }
}
async function loadPuzzle() {
  const params = new URLSearchParams(window.location.search);
  const requested = params.get('puzzle');
  const file = requested ? `/puzzles/${requested}.json` : '/puzzles/current.json';
  return loadJson(file, fallbackPuzzle);
}
async function loadArchive() {
  return loadJson('/puzzles/index.json', { puzzles: [] });
}
function buildMeta(puzzle) {
  const starts = new Map();
  const across = new Map();
  const down = new Map();
  for (const word of puzzle.words) {
    starts.set(key(word.startx, word.starty), word.position);
    for (let i = 0; i < word.answer.length; i++) {
      const x = word.startx + (word.orientation === 'across' ? i : 0);
      const y = word.starty + (word.orientation === 'down' ? i : 0);
      (word.orientation === 'across' ? across : down).set(key(x, y), word);
    }
  }
  return { starts, across, down };
}
function loadLetters(puzzle) {
  try { return JSON.parse(localStorage.getItem(`thc-crossword:${puzzle.id}`) || '{}'); }
  catch { return {}; }
}
function saveLetters(puzzle, letters) {
  localStorage.setItem(`thc-crossword:${puzzle.id}`, JSON.stringify(letters));
}
function renderArchive(archive, puzzle) {
  const puzzles = archive.puzzles || [];
  if (!puzzles.length) return '<p class="archive-empty">Archive appears after the generator publishes weekly puzzle files.</p>';
  return `<div class="archive-list">${puzzles.map((item) => {
    const active = item.id === puzzle.id ? ' active-archive' : '';
    return `<a class="archive-link${active}" href="?puzzle=${encodeURIComponent(item.id)}">${escapeHtml(item.week || item.id)} <span>${item.stats?.placedCount || 0} words</span></a>`;
  }).join('')}</div>`;
}
function render(puzzle, archive) {
  const meta = buildMeta(puzzle);
  let letters = loadLetters(puzzle);
  let active = puzzle.words[0] ? { x: puzzle.words[0].startx, y: puzzle.words[0].starty, orientation: puzzle.words[0].orientation } : { x: 1, y: 1, orientation: 'across' };
  let checking = false;

  app.innerHTML = `
    <header class="hero">
      <p class="eyebrow">Adults 21+ • Weekly Puzzle</p>
      <h1>${escapeHtml(puzzle.title)}</h1>
      <p>${escapeHtml(puzzle.subtitle || '')}</p>
      <p class="notice">${escapeHtml(puzzle.adultUseNotice || '')}</p>
      <section class="archive-panel" aria-label="Puzzle archive">
        <h2>Archive</h2>
        ${renderArchive(archive, puzzle)}
      </section>
      <section class="archive-panel" aria-label="Puzzle exports">
        <h2>Exports</h2>
        ${renderExportLinks(puzzle)}
      </section>
    </header>
    <main class="shell">
      <section class="panel">
        <div class="toolbar">
          <button data-action="check">Check</button>
          <button data-action="reveal">Reveal</button>
          <button data-action="clear">Clear</button>
          <button data-action="print">Print</button>
        </div>
        <p class="status" id="status">Choose a square or clue.</p>
        <p class="progress" id="progress">Progress: 0%</p>
        <div class="grid" id="grid"></div>
      </section>
      <aside class="panel clues">
        <h2>Across</h2><ol id="across"></ol>
        <h2>Down</h2><ol id="down"></ol>
      </aside>
    </main>`;

  const grid = document.querySelector('#grid');
  const status = document.querySelector('#status');
  const progress = document.querySelector('#progress');
  grid.style.setProperty('--cols', puzzle.cols);

  function updateProgress() {
    const stats = progressStats(puzzle, letters);
    const checkedText = checking ? ` • ${stats.correct}/${stats.total} correct` : '';
    progress.textContent = stats.solved ? 'Solved. Nice work.' : `Progress: ${stats.percentFilled}% filled (${stats.filled}/${stats.total})${checkedText}`;
  }
  function wordFor(x, y) {
    const cellKey = key(x, y);
    return active.orientation === 'across' ? meta.across.get(cellKey) || meta.down.get(cellKey) : meta.down.get(cellKey) || meta.across.get(cellKey);
  }
  function isInActiveWord(x, y) {
    const word = wordFor(active.x, active.y);
    if (!word) return false;
    for (let i = 0; i < word.answer.length; i++) {
      const wx = word.startx + (word.orientation === 'across' ? i : 0);
      const wy = word.starty + (word.orientation === 'down' ? i : 0);
      if (wx === x && wy === y) return true;
    }
    return false;
  }
  function drawGrid() {
    grid.innerHTML = '';
    for (let y = 1; y <= puzzle.rows; y++) for (let x = 1; x <= puzzle.cols; x++) {
      const solution = puzzle.grid[y - 1][x - 1];
      const button = document.createElement('button');
      button.className = solution === BLACK ? 'cell black' : 'cell';
      button.dataset.x = x; button.dataset.y = y;
      if (solution !== BLACK) {
        const value = letters[key(x, y)] || '';
        if (isInActiveWord(x, y)) button.classList.add('word');
        if (active.x === x && active.y === y) button.classList.add('active');
        if (checking && value && value !== solution) button.classList.add('wrong');
        if (checking && value === solution) button.classList.add('right');
        button.innerHTML = `${meta.starts.get(key(x, y)) ? `<span>${meta.starts.get(key(x, y))}</span>` : ''}<b>${escapeHtml(value)}</b>`;
      }
      grid.appendChild(button);
    }
    updateProgress();
  }
  function drawClues() {
    for (const direction of ['across', 'down']) {
      document.querySelector(`#${direction}`).innerHTML = puzzle.clues[direction].map((word) => `<li><button data-x="${word.startx}" data-y="${word.starty}" data-o="${direction}"><strong>${word.position}.</strong> ${escapeHtml(word.clue)} <em>${word.answer.length}</em></button></li>`).join('');
    }
  }
  function setActive(x, y, orientation = active.orientation) {
    if (puzzle.grid[y - 1]?.[x - 1] === BLACK) return;
    active = { x, y, orientation };
    const word = wordFor(x, y);
    status.textContent = word ? `${word.position} ${word.orientation}: ${word.clue}` : 'Choose a clue.';
    drawGrid();
  }
  function advance(delta) {
    const word = wordFor(active.x, active.y);
    if (!word) return;
    const offset = word.orientation === 'across' ? active.x - word.startx : active.y - word.starty;
    const next = Math.max(0, Math.min(word.answer.length - 1, offset + delta));
    active.x = word.startx + (word.orientation === 'across' ? next : 0);
    active.y = word.starty + (word.orientation === 'down' ? next : 0);
  }
  grid.addEventListener('click', (event) => {
    const cell = event.target.closest('.cell');
    if (!cell || cell.classList.contains('black')) return;
    const x = Number(cell.dataset.x), y = Number(cell.dataset.y);
    setActive(x, y, active.x === x && active.y === y ? (active.orientation === 'across' ? 'down' : 'across') : active.orientation);
  });
  document.querySelector('.clues').addEventListener('click', (event) => {
    const clue = event.target.closest('button[data-x]');
    if (clue) setActive(Number(clue.dataset.x), Number(clue.dataset.y), clue.dataset.o);
  });
  document.querySelector('.toolbar').addEventListener('click', (event) => {
    const action = event.target.dataset.action;
    if (action === 'clear') { letters = {}; checking = false; saveLetters(puzzle, letters); }
    if (action === 'reveal') { puzzle.grid.forEach((row, y) => row.forEach((cell, x) => { if (cell !== BLACK) letters[key(x + 1, y + 1)] = cell; })); checking = true; saveLetters(puzzle, letters); }
    if (action === 'check') checking = true;
    if (action === 'print') window.print();
    drawGrid();
  });
  window.addEventListener('keydown', (event) => {
    if (/^[a-zA-Z]$/.test(event.key)) {
      letters[key(active.x, active.y)] = event.key.toUpperCase();
      saveLetters(puzzle, letters);
      advance(1);
      drawGrid();
    }
    if (event.key === 'Backspace') {
      delete letters[key(active.x, active.y)];
      saveLetters(puzzle, letters);
      advance(-1);
      drawGrid();
    }
  });
  drawClues();
  setActive(active.x, active.y, active.orientation);
}

Promise.all([loadPuzzle(), loadArchive()]).then(([puzzle, archive]) => render(puzzle, archive));
