#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import { validateClueBank } from '../src/crossword/validate.js';
import { exportIpuz, exportExolve } from '../src/crossword/exporters.js';
import { buildDailyPuzzle } from '../src/crossword/generatePuzzle.js';
import { currentDailyDate } from '../src/crossword/date.js';
import { writeDailyArchiveIndex } from './build-daily-index.mjs';

function arg(name, fallback) {
  const index = process.argv.indexOf(`--${name}`);
  return index >= 0 && process.argv[index + 1] ? process.argv[index + 1] : fallback;
}

const zone = arg('timezone', 'America/Chicago');
const runDate = arg('date', currentDailyDate(new Date(), zone));
const limit = Number(arg('max', '18'));
const tries = Number(arg('attempts', '200'));
const theme = arg('theme', 'grow-room-basics');
const bank = JSON.parse(await fs.readFile('content/clue-bank.json', 'utf8'));
const themes = JSON.parse(await fs.readFile('content/themes.json', 'utf8').catch(() => '[]'));
const bankErrors = validateClueBank(bank);

if (bankErrors.length) {
  console.error(bankErrors.join('\n'));
  throw new Error('Clue bank validation failed.');
}

const puzzle = buildDailyPuzzle({ bank, themes, date: runDate, themeId: theme, max: limit, attempts: tries });
const dailyDir = path.resolve('public/puzzles/daily');
const rootDir = path.resolve('public/puzzles');

await fs.mkdir(dailyDir, { recursive: true });
await fs.writeFile(path.join(dailyDir, `${runDate}.json`), JSON.stringify(puzzle, null, 2));
await fs.writeFile(path.join(dailyDir, 'current.json'), JSON.stringify(puzzle, null, 2));
await fs.writeFile(path.join(rootDir, 'current.json'), JSON.stringify(puzzle, null, 2));
await fs.writeFile(path.join(dailyDir, `${runDate}.ipuz.json`), exportIpuz(puzzle));
await fs.writeFile(path.join(dailyDir, `${runDate}.exolve.txt`), exportExolve(puzzle));
await writeDailyArchiveIndex(dailyDir);

console.log('Generated daily crossword:', puzzle.id, puzzle.stats);
