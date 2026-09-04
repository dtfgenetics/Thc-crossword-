import './styles.css';
import { progressStats } from './crossword/progress.js';
import { puzzleExportBase, puzzleJsonPath } from './crossword/routes.js';

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
  return puzzleExportBase(puzzle.id);
}
function renderExportLinks(puzzle) {
  const base = exportBase(puzzle);
  if (!base) return '<p class="archive-empty">Export files appear after a generated weekly puzzle is loaded.</p>';
  const puzzleId = encodeURIComponent(puzzle.id);
  return `<div class="export-list">
    <a href="${base}.json">Playable JSON</a>
    <a href="${base}.ipuz.json">IPUZ</a>
    <a href="${base}.exolve.txt">Exolve</a>
    <a href="?puzzle=${puzzleId}&view=exolve">Preview Exolve</a>
  </div>`;
}
async function loadText(url, fallback = '') {
  try {
    const response = await fetch(url, { cache: 'no-cache' });
    if (!response.ok) throw new Error('missing file');
    return await response.text();
  } catch {
    return fallback;
  }
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
  return loadJson(puzzleJsonPath(params.get('puzzle')), fallbackPuzzle);
}
async function loadArchive() {
  return loadJson('/puzzles/index.json', { puzzles: [] });
}
async function renderExolvePreview(puzzle) {
  const base = exportBase(puzzle);
  const text = base ? await loadText(`${base}.exolve.txt`, 'No Exolve export found for this puzzle.') : 'No Exolve export found for this puzzle.';
  app.innerHTML = `
    <header class="hero">
      <p class="eyebrow">Adults 21+ • Exolve Export Preview</p>
      <h1>${escapeHtml(puzzle.title)}</h1>
      <p><a class="back-link" href="?puzzle=${encodeURIComponent(puzzle.id)}">Back to puzzle</a></p>
    </header>
    <main class="shell single">
      <section class="panel">
        <pre class="export-preview">${escapeHtml(text)}</pre>
      </section>
    </main>`;
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
        <div class="toolbar" aria-label="Puzzle actions">
          <button data-action="check">Check</button>
          <button data-action="reveal">Reveal</button>
          <button data-action="clear">Clear</button>
          <button data-action="print">Print</button>
        </div>
        <p class="status" id="status" aria-live="polite">Choose a square or clue.</p>
        <p class="progress" id="progress" aria-live="polite">Progress: 0%</p>
        <input id="mobile-input" class="mobile-input" autocomplete="off" autocapitalize="characters" inputmode="text" maxlength="1" aria-label="Crossword letter input" />
        <div class="grid" id="grid" role="grid" aria-label="Crossword grid"></div>
      </section>
      <aside class="panel clues" aria-label="Crossword clues">
        <h2>Across</h2><ol id="across"></ol>
        <h2>Down</h2><ol id="down"></ol>
      </aside>
    </main>`;

  const grid = document.querySelector('#grid');
  const status = document.querySelector('#status');
  const progress = document.querySelector('#progress');
  const mobileInput = document.querySelector('#mobile-input');
  grid.style.setProperty('--cols', puzzle.cols);

  function updateProgress() {
    const stats = progressStats(puzzle, letters);
    const checkedText = checking ? ` • ${stats.correct}/${stats.total} correct` : '';
    progress.textContent = stats.solved ? 'Solved. Nice work.' : `Progress: ${stats.percentFilled}% filled (${stats.filled}/${stats.total})${checkedText}`;
  }
  function resolveOrientation(x, y, preferred = active.orientation) {
    const cellKey = key(x, y);
    if (preferred === 'across' && meta.across.has(cellKey)) return 'across';
    if (preferred === 'down' && meta.down.has(cellKey)) return 'down';
    if (meta.across.has(cellKey)) return 'across';
    if (meta.down.has(cellKey)) return 'down';
    return preferred;
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
  function focusLetterInput() {
    mobileInput.value = '';
    try { mobileInput.focus({ preventScroll: true }); }
    catch { mobileInput.focus(); }
  }
  function focusActiveCell() {
    const cell = grid.querySelector('.cell.active');
    if (!cell) return;
    try { cell.focus({ preventScroll: true }); }
    catch { cell.focus(); }
  }
  function usesTouchKeyboard() {
    return Boolean(window.matchMedia?.('(pointer: coarse)').matches || navigator.maxTouchPoints > 0);
  }
  function focusEntrySurface() {
    if (usesTouchKeyboard()) focusLetterInput();
    else focusActiveCell();
  }
  function enterLetter(letter) {
    const normalized = String(letter || '').toUpperCase().replace(/[^A-Z]/g, '').slice(-1);
    if (!normalized) return;
    letters[key(active.x, active.y)] = normalized;
    saveLetters(puzzle, letters);
    advance(1);
    drawGrid();
  }
  function deleteLetter() {
    const currentKey = key(active.x, active.y);
    if (letters[currentKey]) {
      delete letters[currentKey];
    } else {
      advance(-1);
      delete letters[key(active.x, active.y)];
    }
    saveLetters(puzzle, letters);
    drawGrid();
  }
  function updateClueHighlight() {
    const word = wordFor(active.x, active.y);
    document.querySelectorAll('.clues button[data-x]').forEach((button) => {
      const matches = Boolean(word)
        && Number(button.dataset.x) === word.startx
        && Number(button.dataset.y) === word.starty
        && button.dataset.o === word.orientation;
      button.classList.toggle('active-clue', matches);
      if (matches) button.setAttribute('aria-current', 'true');
      else button.removeAttribute('aria-current');
    });
  }
  function drawGrid() {
    grid.innerHTML = '';
    for (let y = 1; y <= puzzle.rows; y++) for (let x = 1; x <= puzzle.cols; x++) {
      const solution = puzzle.grid[y - 1][x - 1];
      const button = document.createElement('button');
      button.className = solution === BLACK ? 'cell black' : 'cell';
      button.dataset.x = x;
      button.dataset.y = y;
      button.setAttribute('role', 'gridcell');
      if (solution === BLACK) {
        button.disabled = true;
        button.tabIndex = -1;
        button.setAttribute('aria-label', `Blocked square, row ${y}, column ${x}`);
      } else {
        const value = letters[key(x, y)] || '';
        const number = meta.starts.get(key(x, y));
        if (isInActiveWord(x, y)) button.classList.add('word');
        if (active.x === x && active.y === y) {
          button.classList.add('active');
          button.tabIndex = 0;
          button.setAttribute('aria-selected', 'true');
        } else {
          button.tabIndex = -1;
        }
        if (checking && value && value !== solution) button.classList.add('wrong');
        if (checking && value === solution) button.classList.add('right');
        button.setAttribute('aria-label', `${number ? `Clue ${number}, ` : ''}row ${y}, column ${x}${value ? `, ${value}` : ', blank'}`);
        button.innerHTML = `${number ? `<span>${number}</span>` : ''}<b>${escapeHtml(value)}</b>`;
      }
      grid.appendChild(button);
    }
    updateProgress();
    updateClueHighlight();
  }
  function drawClues() {
    for (const direction of ['across', 'down']) {
      document.querySelector(`#${direction}`).innerHTML = puzzle.clues[direction].map((word) => `<li><button data-x="${word.startx}" data-y="${word.starty}" data-o="${direction}"><strong>${word.position}.</strong> ${escapeHtml(word.clue)} <em>${word.answer.length}</em></button></li>`).join('');
    }
  }
  function setActive(x, y, orientation = active.orientation, shouldFocus = false) {
    if (puzzle.grid[y - 1]?.[x - 1] === BLACK) return;
    active = { x, y, orientation: resolveOrientation(x, y, orientation) };
    const word = wordFor(x, y);
    status.textContent = word ? `${word.position} ${word.orientation}: ${word.clue}` : 'Choose a clue.';
    drawGrid();
    if (shouldFocus) focusEntrySurface();
  }
  function advance(delta) {
    const word = wordFor(active.x, active.y);
    if (!word) return;
    const offset = word.orientation === 'across' ? active.x - word.startx : active.y - word.starty;
    const next = Math.max(0, Math.min(word.answer.length - 1, offset + delta));
    active.x = word.startx + (word.orientation === 'across' ? next : 0);
    active.y = word.starty + (word.orientation === 'down' ? next : 0);
    active.orientation = word.orientation;
  }
  grid.addEventListener('click', (event) => {
    const cell = event.target.closest('.cell');
    if (!cell || cell.classList.contains('black')) return;
    const x = Number(cell.dataset.x);
    const y = Number(cell.dataset.y);
    const cellKey = key(x, y);
    const hasAcross = meta.across.has(cellKey);
    const hasDown = meta.down.has(cellKey);
    const sameCell = active.x === x && active.y === y;
    const orientation = sameCell && hasAcross && hasDown
      ? (active.orientation === 'across' ? 'down' : 'across')
      : active.orientation;
    setActive(x, y, orientation, true);
  });
  document.querySelector('.clues').addEventListener('click', (event) => {
    const clue = event.target.closest('button[data-x]');
    if (clue) setActive(Number(clue.dataset.x), Number(clue.dataset.y), clue.dataset.o, true);
  });
  document.querySelector('.toolbar').addEventListener('click', (event) => {
    const action = event.target.dataset.action;
    if (action === 'clear') { letters = {}; checking = false; saveLetters(puzzle, letters); }
    if (action === 'reveal') { puzzle.grid.forEach((row, y) => row.forEach((cell, x) => { if (cell !== BLACK) letters[key(x + 1, y + 1)] = cell; })); checking = true; saveLetters(puzzle, letters); }
    if (action === 'check') checking = true;
    if (action === 'print') window.print();
    drawGrid();
  });
  mobileInput.addEventListener('input', () => {
    enterLetter(mobileInput.value);
    mobileInput.value = '';
  });
  mobileInput.addEventListener('keydown', (event) => {
    if (event.key === 'Backspace') { event.preventDefault(); deleteLetter(); }
  });
  window.addEventListener('keydown', (event) => {
    if (event.target === mobileInput) return;
    const fromGridCell = event.target?.classList?.contains('cell');
    if (/^[a-zA-Z]$/.test(event.key)) {
      enterLetter(event.key);
      if (fromGridCell) window.requestAnimationFrame(focusActiveCell);
    }
    if (event.key === 'Backspace') {
      event.preventDefault();
      deleteLetter();
      if (fromGridCell) window.requestAnimationFrame(focusActiveCell);
    }
  });
  drawClues();
  setActive(active.x, active.y, active.orientation, false);
}

Promise.all([loadPuzzle(), loadArchive()]).then(([puzzle, archive]) => {
  const params = new URLSearchParams(window.location.search);
  if (params.get('view') === 'exolve') renderExolvePreview(puzzle);
  else render(puzzle, archive);
});
