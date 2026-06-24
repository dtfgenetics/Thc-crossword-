import { BLACK } from './format.js';

export function parseIpuzJson(text) {
  const parsed = typeof text === 'string' ? JSON.parse(text) : text;
  const errors = validateIpuz(parsed);
  if (errors.length) throw new Error(errors.join('\n'));
  return parsed;
}

export function validateIpuz(ipuz) {
  const errors = [];
  if (!ipuz || typeof ipuz !== 'object') errors.push('IPUZ must be an object.');
  if (!ipuz?.version) errors.push('IPUZ missing version.');
  if (!Array.isArray(ipuz?.kind)) errors.push('IPUZ kind must be an array.');
  if (!ipuz?.dimensions?.width || !ipuz?.dimensions?.height) errors.push('IPUZ missing dimensions.');
  if (!Array.isArray(ipuz?.puzzle)) errors.push('IPUZ puzzle grid must be an array.');
  if (!Array.isArray(ipuz?.solution)) errors.push('IPUZ solution grid must be an array.');
  if (!ipuz?.clues?.Across || !ipuz?.clues?.Down) errors.push('IPUZ missing Across or Down clues.');

  if (Array.isArray(ipuz?.solution) && ipuz?.dimensions) {
    if (ipuz.solution.length !== ipuz.dimensions.height) errors.push('IPUZ solution height mismatch.');
    for (const row of ipuz.solution) {
      if (!Array.isArray(row) || row.length !== ipuz.dimensions.width) errors.push('IPUZ solution width mismatch.');
    }
  }

  return errors;
}

export function ipuzToInternalPuzzle(ipuz) {
  const errors = validateIpuz(ipuz);
  if (errors.length) throw new Error(errors.join('\n'));

  return {
    id: ipuz.id || slugTitle(ipuz.title || 'ipuz-puzzle'),
    title: ipuz.title || 'Imported IPUZ Crossword',
    subtitle: ipuz.intro || '',
    adultUseNotice: ipuz.explanation || '',
    rows: ipuz.dimensions.height,
    cols: ipuz.dimensions.width,
    grid: ipuz.solution.map((row) => row.map((cell) => cell === '#' ? BLACK : String(cell).toUpperCase())),
    clues: {
      across: (ipuz.clues.Across || []).map(([position, clue]) => ({ position, clue, orientation: 'across' })),
      down: (ipuz.clues.Down || []).map(([position, clue]) => ({ position, clue, orientation: 'down' }))
    },
    words: [],
    stats: { submittedCount: 0, placedCount: 0, score: 0 }
  };
}

function slugTitle(title) {
  return String(title).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'ipuz-puzzle';
}
