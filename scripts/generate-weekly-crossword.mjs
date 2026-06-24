#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
import { validateClueBank, validatePuzzle } from '../src/crossword/validate.js';
import { exportIpuz, exportExolve } from '../src/crossword/exporters.js';
import { selectEntries } from '../src/crossword/selectEntries.js';

const require = createRequire(import.meta.url);
const BLACK = '.';

function arg(name, fallback) {
  const index = process.argv.indexOf(`--${name}`);
  return index >= 0 && process.argv[index + 1] ? process.argv[index + 1] : fallback;
}

function normalize(answer) {
  return String(answer || '')
    .replace(/&/g, 'AND')
    .replace(/[^a-zA-Z]/g, '')
    .toUpperCase();
}

function hashSeed(text) {
  let h = 2166136261;
  for (const char of String(text)) {
    h ^= char.charCodeAt(0);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function rng(seedText) {
  let seed = hashSeed(seedText) || 1;
  return () => {
    seed = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    seed ^= seed + Math.imul(seed ^ (seed >>> 7), 61 | seed);
    return ((seed ^ (seed >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle(items, random) {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function cell(grid, x, y) {
  if (x < 0 || y < 0 || y >= grid.length || x >= grid[0].length) return null;
  return grid[y][x];
}

function canPlace(grid, answer, x, y, dir) {
  const dx = dir === 'across' ? 1 : 0;
  const dy = dir === 'down' ? 1 : 0;
  if (cell(grid, x - dx, y - dy)) return false;
  if (cell(grid, x + dx * answer.length, y + dy * answer.length)) return false;
  let crossings = 0;
  for (let i = 0; i < answer.length; i++) {
    const cx = x + dx * i;
    const cy = y + dy * i;
    const existing = cell(grid, cx, cy);
    if (existing === null || (existing && existing !== answer[i])) return false;
    if (existing === answer[i]) crossings++;
    if (!existing && dir === 'across' && (cell(grid, cx, cy - 1) || cell(grid, cx, cy + 1))) return false;
    if (!existing && dir === 'down' && (cell(grid, cx - 1, cy) || cell(grid, cx + 1, cy))) return false;
  }
  return { crossings };
}

function put(grid, word, x, y, dir, position) {
  const dx = dir === 'across' ? 1 : 0;
  const dy = dir === 'down' ? 1 : 0;
  for (let i = 0; i < word.answer.length; i++) grid[y + dy * i][x + dx * i] = word.answer[i];
  return { ...word, startx: x + 1, starty: y + 1, orientation: dir, position };
}

function localLayout(words, random) {
  if (!words.length) return null;
  const size = 41;
  const grid = Array.from({ length: size }, () => Array.from({ length: size }, () => ''));
  const ordered = shuffle(words, random).sort((a, b) => b.answer.length - a.answer.length);
  const placed = [];
  let pos = 1;
  const first = ordered[0];
  placed.push(put(grid, first, 20 - Math.floor(first.answer.length / 2), 20, 'across', pos++));

  for (const word of ordered.slice(1)) {
    let best = null;
    for (const existing of placed) {
      for (let i = 0; i < word.answer.length; i++) {
        for (let j = 0; j < existing.answer.length; j++) {
          if (word.answer[i] !== existing.answer[j]) continue;
          const dir = existing.orientation === 'across' ? 'down' : 'across';
          const x = existing.startx - 1 + (existing.orientation === 'across' ? j : 0) - (dir === 'across' ? i : 0);
          const y = existing.starty - 1 + (existing.orientation === 'down' ? j : 0) - (dir === 'down' ? i : 0);
          const ok = canPlace(grid, word.answer, x, y, dir);
          if (ok && (!best || ok.crossings > best.crossings)) best = { x, y, dir, crossings: ok.crossings };
        }
      }
    }
    if (best) placed.push(put(grid, word, best.x, best.y, best.dir, pos++));
  }

  return crop(grid, placed, words.length);
}

function crop(grid, placed, submittedCount) {
  if (!placed.length) return null;
  let minX = 99, minY = 99, maxX = 0, maxY = 0;
  for (const word of placed) {
    const dx = word.orientation === 'across' ? 1 : 0;
    const dy = word.orientation === 'down' ? 1 : 0;
    minX = Math.min(minX, word.startx - 1);
    minY = Math.min(minY, word.starty - 1);
    maxX = Math.max(maxX, word.startx - 1 + dx * (word.answer.length - 1));
    maxY = Math.max(maxY, word.starty - 1 + dy * (word.answer.length - 1));
  }
  minX = Math.max(0, minX - 1); minY = Math.max(0, minY - 1);
  maxX = Math.min(grid[0].length - 1, maxX + 1); maxY = Math.min(grid.length - 1, maxY + 1);
  const table = [];
  for (let y = minY; y <= maxY; y++) table.push(grid[y].slice(minX, maxX + 1).map((v) => v || BLACK));
  const words = placed.map((w) => ({ ...w, startx: w.startx - minX, starty: w.starty - minY }));
  numberWords(words);
  return { grid: table, rows: table.length, cols: table[0].length, words, submittedCount, placedCount: words.length };
}

function numberWords(words) {
  const starts = [...new Set(words.map((w) => `${w.starty}:${w.startx}`))]
    .map((key) => key.split(':').map(Number))
    .sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const nums = new Map(starts.map(([y, x], i) => [`${y}:${x}`, i + 1]));
  for (const word of words) word.position = nums.get(`${word.starty}:${word.startx}`);
  words.sort((a, b) => a.position - b.position || a.orientation.localeCompare(b.orientation));
}

function normalizePublicTable(table) {
  return table.map((row) => Array.from(row).map((v) => normalize(v)[0] || BLACK));
}

function tryPublicGenerator(words) {
  try {
    if (!words.length) return null;
    const clg = require('crossword-layout-generator');
    const layout = clg.generateLayout(words.map((w) => ({ answer: w.answer, clue: w.clue })));
    if (!layout?.result?.length || !layout?.table?.length) return null;
    const placed = layout.result.filter((w) => w.orientation !== 'none').map((w) => {
      const match = words.find((entry) => entry.answer === normalize(w.answer));
      return { ...match, startx: Number(w.startx), starty: Number(w.starty), orientation: w.orientation, position: Number(w.position) };
    }).filter((word) => word.answer && Number.isFinite(word.startx) && Number.isFinite(word.starty));
    const grid = normalizePublicTable(layout.table);
    return { grid, rows: grid.length, cols: grid[0].length, words: placed, submittedCount: words.length, placedCount: placed.length, source: 'crossword-layout-generator' };
  } catch {
    return null;
  }
}

function score(layout) {
  return layout.placedCount * 1000 - layout.rows * layout.cols;
}

function validateCandidate(candidate) {
  if (!candidate || !candidate.words?.length || !candidate.grid?.length) return false;
  const tempPuzzle = {
    id: 'candidate',
    grid: candidate.grid,
    rows: candidate.rows,
    cols: candidate.cols,
    words: candidate.words,
    stats: { submittedCount: candidate.submittedCount, placedCount: candidate.placedCount }
  };
  return validatePuzzle(tempPuzzle, { minPlacedRatio: 0.55 }).length === 0;
}

async function writeArchiveIndex(outDir) {
  const files = await fs.readdir(outDir).catch(() => []);
  const puzzles = [];
  for (const file of files.filter((name) => /^\d{4}-W\d{2}\.json$/.test(name)).sort().reverse()) {
    const puzzle = JSON.parse(await fs.readFile(path.join(outDir, file), 'utf8'));
    puzzles.push({ id: puzzle.id, week: puzzle.week, title: puzzle.title, status: puzzle.status, theme: puzzle.theme, stats: puzzle.stats, file });
  }
  await fs.writeFile(path.join(outDir, 'index.json'), JSON.stringify({ updatedAt: new Date().toISOString(), puzzles }, null, 2));
}

function findTheme(themes, id) {
  return themes.find((theme) => theme.id === id) || themes[0] || null;
}

const week = arg('week', '2026-W26');
const max = Number(arg('max', '28'));
const attempts = Number(arg('attempts', '200'));
const themeId = arg('theme', 'grow-room-basics');
const bank = JSON.parse(await fs.readFile('content/clue-bank.json', 'utf8'));
const themes = JSON.parse(await fs.readFile('content/themes.json', 'utf8').catch(() => '[]'));
const theme = findTheme(themes, themeId);
const bankErrors = validateClueBank(bank);
if (bankErrors.length) {
  console.error(bankErrors.join('\n'));
  process.exit(1);
}
let best = null;

for (let i = 0; i < attempts; i++) {
  const random = rng(`${week}:${theme?.id || 'default'}:${i}`);
  const selected = selectEntries({ bank, theme, max, random });
  const picked = selected.map((x) => ({ ...x, answer: normalize(x.answer), displayAnswer: x.answer })).filter((x) => x.answer.length >= 3);
  if (picked.length < 3) continue;
  const candidates = [tryPublicGenerator(picked), localLayout(picked, random)].filter(validateCandidate);
  for (const candidate of candidates) {
    candidate.source ||= 'local-layout-engine';
    if (!best || score(candidate) > score(best)) best = candidate;
  }
}

if (!best) {
  console.error(`Unable to generate a puzzle for ${week}. Add more approved clues or lower the theme constraints.`);
  process.exit(1);
}

const clues = {
  across: best.words.filter((w) => w.orientation === 'across'),
  down: best.words.filter((w) => w.orientation === 'down')
};
const themeLabel = theme?.name || 'Mixed Theme';
const puzzle = {
  id: week,
  week,
  title: `THC Weekly Crossword — ${week}`,
  subtitle: `${themeLabel}: grow terms, breeding language, DTF flavor, and culture clues.`,
  status: 'published',
  theme: theme ? { id: theme.id, name: theme.name, description: theme.description } : null,
  adultUseNotice: 'Cannabis-themed parody and education content for adults 21+ where legal.',
  generatedAt: new Date().toISOString(),
  source: { generator: best.source, publicCode: 'crossword-layout-generator is used when available; local fallback is included.' },
  grid: best.grid,
  rows: best.rows,
  cols: best.cols,
  words: best.words,
  clues,
  stats: { submittedCount: best.submittedCount, placedCount: best.placedCount, score: score(best) }
};

const puzzleErrors = validatePuzzle(puzzle, { minPlacedRatio: 0.55 });
if (puzzleErrors.length) {
  console.error(puzzleErrors.join('\n'));
  process.exit(1);
}

const outDir = path.resolve('public/puzzles');
await fs.mkdir(outDir, { recursive: true });
await fs.writeFile(path.join(outDir, `${week}.json`), JSON.stringify(puzzle, null, 2));
await fs.writeFile(path.join(outDir, 'current.json'), JSON.stringify(puzzle, null, 2));
await fs.writeFile(path.join(outDir, `${week}.ipuz.json`), exportIpuz(puzzle));
await fs.writeFile(path.join(outDir, `${week}.exolve.txt`), exportExolve(puzzle));
await writeArchiveIndex(outDir);
console.log(`Generated ${puzzle.title} (${themeLabel}): ${puzzle.stats.placedCount}/${puzzle.stats.submittedCount} words, ${puzzle.cols}x${puzzle.rows}`);
