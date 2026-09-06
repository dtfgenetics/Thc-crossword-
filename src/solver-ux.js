import './solver-ux.css';

const PREF_KEY = 'thc-crossword:solver-preferences';
let mounted = false;

function readPrefs() {
  try {
    return {
      showTimer: true,
      compactClues: false,
      ...JSON.parse(localStorage.getItem(PREF_KEY) || '{}')
    };
  } catch {
    return { showTimer: true, compactClues: false };
  }
}

function savePrefs(prefs) {
  try { localStorage.setItem(PREF_KEY, JSON.stringify(prefs)); }
  catch { /* Solver preferences are optional enhancement state. */ }
}

function activeClueButton() {
  return document.querySelector('.clues button.active-clue');
}

function activeClueText() {
  const active = activeClueButton();
  if (!active) return 'Choose a square or clue to begin.';
  return active.textContent.replace(/\s+/g, ' ').trim();
}

function activeClueMeta() {
  const active = activeClueButton();
  if (!active) return 'READY';
  const number = active.querySelector('strong')?.textContent?.replace(/\.$/, '') || '—';
  const direction = active.dataset.o === 'down' ? 'DOWN' : 'ACROSS';
  return `${number} ${direction}`;
}

function orderedClueButtons() {
  return [...document.querySelectorAll('.clues button[data-x][data-y][data-o]')];
}

function navigateClue(delta) {
  const buttons = orderedClueButtons();
  if (!buttons.length) return;
  const current = activeClueButton();
  const currentIndex = Math.max(0, buttons.indexOf(current));
  const targetIndex = (currentIndex + delta + buttons.length) % buttons.length;
  buttons[targetIndex]?.click();
}

function syncCurrentClue() {
  const text = activeClueText();
  const label = document.querySelector('[data-solver-current-clue]');
  if (label) label.textContent = text;

  const dockClue = document.querySelector('[data-solver-dock-clue]');
  const dockMeta = document.querySelector('[data-solver-dock-meta]');
  if (dockClue) dockClue.textContent = text;
  if (dockMeta) dockMeta.textContent = activeClueMeta();
}

function applyPrefs(prefs) {
  document.documentElement.dataset.crosswordTimer = prefs.showTimer ? 'shown' : 'hidden';
  document.documentElement.dataset.crosswordClues = prefs.compactClues ? 'compact' : 'full';
  document.querySelector('[data-solver-pref="timer"]')?.toggleAttribute('checked', prefs.showTimer);
  document.querySelector('[data-solver-pref="compact"]')?.toggleAttribute('checked', prefs.compactClues);
}

function buildCurrentClueBar() {
  if (document.querySelector('.solver-current-clue')) return;
  const grid = document.querySelector('.grid');
  if (!grid) return;

  const bar = document.createElement('section');
  bar.className = 'solver-current-clue';
  bar.setAttribute('aria-live', 'polite');
  bar.innerHTML = `
    <span class="solver-current-clue-label">Current clue</span>
    <strong data-solver-current-clue>${activeClueText()}</strong>`;
  grid.before(bar);

  const clues = document.querySelector('.clues');
  if (clues) {
    new MutationObserver(syncCurrentClue).observe(clues, {
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'aria-current']
    });
  }
  const status = document.querySelector('#status');
  if (status) new MutationObserver(syncCurrentClue).observe(status, { childList: true, subtree: true });
}

function buildMobileClueDock() {
  if (document.querySelector('.solver-mobile-dock')) return;
  const grid = document.querySelector('.grid');
  if (!grid) return;

  const dock = document.createElement('nav');
  dock.className = 'solver-mobile-dock';
  dock.setAttribute('aria-label', 'Mobile clue navigator');
  dock.innerHTML = `
    <button type="button" class="solver-dock-button" data-solver-clue-nav="-1" aria-label="Previous clue">‹</button>
    <div class="solver-dock-copy" aria-live="polite">
      <span data-solver-dock-meta>${activeClueMeta()}</span>
      <strong data-solver-dock-clue>${activeClueText()}</strong>
    </div>
    <button type="button" class="solver-dock-button" data-solver-clue-nav="1" aria-label="Next clue">›</button>`;
  grid.after(dock);

  dock.addEventListener('click', (event) => {
    const button = event.target.closest('[data-solver-clue-nav]');
    if (!button) return;
    navigateClue(Number(button.dataset.solverClueNav));
  });
}

function buildSettings() {
  if (document.querySelector('.solver-settings')) return;
  const toolbar = document.querySelector('.toolbar');
  if (!toolbar) return;

  const prefs = readPrefs();
  const details = document.createElement('details');
  details.className = 'solver-settings';
  details.innerHTML = `
    <summary>Settings</summary>
    <div class="solver-settings-panel">
      <label><input type="checkbox" data-solver-pref="timer"> Show timer</label>
      <label><input type="checkbox" data-solver-pref="compact"> Compact clue list</label>
      <button type="button" data-solver-action="fullscreen">Fullscreen</button>
    </div>`;
  toolbar.after(details);

  details.addEventListener('change', (event) => {
    const input = event.target.closest('[data-solver-pref]');
    if (!input) return;
    const next = readPrefs();
    if (input.dataset.solverPref === 'timer') next.showTimer = input.checked;
    if (input.dataset.solverPref === 'compact') next.compactClues = input.checked;
    savePrefs(next);
    applyPrefs(next);
  });

  details.querySelector('[data-solver-action="fullscreen"]').addEventListener('click', async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await document.documentElement.requestFullscreen();
    } catch {
      // Fullscreen is progressive enhancement and may be blocked by the host browser.
    }
  });

  applyPrefs(prefs);
}

function mount() {
  if (mounted || !document.querySelector('.grid')) return;
  mounted = true;
  buildCurrentClueBar();
  buildMobileClueDock();
  buildSettings();
  syncCurrentClue();
}

const observer = new MutationObserver(mount);
observer.observe(document.querySelector('#app'), { childList: true, subtree: true });
mount();
