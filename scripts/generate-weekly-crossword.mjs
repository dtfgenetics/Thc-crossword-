#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import { validateClueBank } from '../src/crossword/validate.js';
import { exportIpuz, exportExolve } from '../src/crossword/exporters.js';
import { buildWeeklyPuzzle } from '../src/crossword/generatePuzzle.js';

function arg(name, fallback) {
  const index = process.argv.indexOf(`--${name}`);
  return index >= 0 && process.argv[index + 1] ? process.argv[index + 1] : fallback;
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

const week = arg('week', '2026-W26');
const max = Number(arg('max', '28'));
const attempts = Number(arg('attempts', '200'));
const themeId = arg('theme', 'grow-room-basics');
const bank = JSON.parse(await fs.readFile('content/clue-bank.json', 'utf8'));
const themes = JSON.parse(await fs.readFile('content/themes.json', 'utf8').catch(() => '[]'));
const bankErrors = validateClueBank(bank);

if (bankErrors.length) {
  console.error(bankErrors.join('\n'));
  process.exit(1);
}

let puzzle;
try {
  puzzle = buildWeeklyPuzzle({ bank, themes, week, themeId, max, attempts });
} catch (error) {
  console.error(error.message);
  process.exit(1);
}

const outDir = path.resolve('public/puzzles');
await fs.mkdir(outDir, { recursive: true });
await fs.writeFile(path.join(outDir, `${week}.json`), JSON.stringify(puzzle, null, 2));
await fs.writeFile(path.join(outDir, 'current.json'), JSON.stringify(puzzle, null, 2));
await fs.writeFile(path.join(outDir, `${week}.ipuz.json`), exportIpuz(puzzle));
await fs.writeFile(path.join(outDir, `${week}.exolve.txt`), exportExolve(puzzle));
await writeArchiveIndex(outDir);
console.log(`Generated ${puzzle.title} (${puzzle.theme?.name || 'Mixed Theme'}): ${puzzle.stats.placedCount}/${puzzle.stats.submittedCount} words, ${puzzle.cols}x${puzzle.rows}`);
