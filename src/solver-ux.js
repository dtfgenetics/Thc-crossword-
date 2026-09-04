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
  localStorage.setItem(PREF_KEY, JSON.stringify(prefs));
}

function activeClueText() {
  const active = document.querySelector('.clues button.active-clue');
  if (!active) return 'Choose a square or clue to begin.';
  return active.textContent.replace(/\s+/g, ' ').trim();
}

function syncCurrentClue() {
  const label = document.querySelector('[data-solver-current-clue]');
  if (label) label.textContent = activeClueText();
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
  buildSettings();
  syncCurrentClue();
}

const observer = new MutationObserver(mount);
observer.observe(document.querySelector('#app'), { childList: true, subtree: true });
mount();
