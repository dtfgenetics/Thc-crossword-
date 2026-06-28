#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import { validateClueBank, validatePuzzle } from '../src/crossword/validate.js';
import { parseIpuzJson } from '../src/crossword/ipuz.js';
import { parseExolveText } from '../src/crossword/exolve.js';

const requiredFiles = [
  'package.json',
  'index.html',
  'src/main.js',
  'src/styles.css',
  'src/crossword/format.js',
  'src/crossword/random.js',
  'src/crossword/routes.js',
  'src/crossword/validate.js',
  'src/crossword/exporters.js',
  'src/crossword/selectEntries.js',
  'src/crossword/week.js',
  'src/crossword/progress.js',
  'src/crossword/ipuz.js',
  'src/crossword/exolve.js',
  'src/crossword/localLayout.js',
  'src/crossword/publicLayout.js',
  'src/crossword/generatePuzzle.js',
  'src/crossword/generatorAdapters.js',
  'content/clue-bank.json',
  'content/themes.json',
  'docs/public-code-audit.md',
  'scripts/generate-weekly-crossword.mjs',
  'scripts/publish-next.mjs',
  'scripts/audit-clue-bank.mjs',
  'scripts/validate-puzzles.mjs',
  'scripts/validate-ipuz.mjs',
  'scripts/validate-exolve.mjs',
  'scripts/check-export-set.mjs',
  'public/puzzles/current.json'
];

const errors = [];
async function exists(file) { try { await fs.access(file); return true; } catch { return false; } }
for (const file of requiredFiles) if (!(await exists(file))) errors.push(`Missing required file: ${file}`);

const pkg = JSON.parse(await fs.readFile('package.json', 'utf8'));
for (const script of ['dev','build','crossword:generate','crossword:publish-next','crossword:audit','crossword:validate','crossword:validate-ipuz','crossword:validate-exolve','crossword:check-exports','verify','test']) {
  if (!pkg.scripts?.[script]) errors.push(`Missing npm script: ${script}`);
}

const bank = JSON.parse(await fs.readFile('content/clue-bank.json', 'utf8'));
errors.push(...validateClueBank(bank));
const approvedCount = bank.filter((entry) => entry.approved !== false).length;
if (approvedCount < 80) errors.push(`Clue bank too small for weekly production: ${approvedCount}/80 approved entries.`);

const themes = JSON.parse(await fs.readFile('content/themes.json', 'utf8'));
if (!themes.length) errors.push('No crossword themes defined.');

const puzzleDir = 'public/puzzles';
const files = await fs.readdir(puzzleDir).catch(() => []);
const puzzleFiles = files.filter((file) => file === 'current.json' || /^\d{4}-W\d{2}\.json$/.test(file));
if (!puzzleFiles.length) errors.push('No playable puzzle JSON files found.');
for (const file of puzzleFiles) {
  const puzzle = JSON.parse(await fs.readFile(path.join(puzzleDir, file), 'utf8'));
  for (const error of validatePuzzle(puzzle, { minPlacedRatio: 0.55 })) errors.push(`${file}: ${error}`);
}

const ipuzFiles = files.filter((file) => file.endsWith('.ipuz.json'));
const exolveFiles = files.filter((file) => file.endsWith('.exolve.txt'));
if (!ipuzFiles.length) errors.push('No IPUZ export files found.');
if (!exolveFiles.length) errors.push('No Exolve export files found.');
for (const file of ipuzFiles) parseIpuzJson(await fs.readFile(path.join(puzzleDir, file), 'utf8'));
for (const file of exolveFiles) parseExolveText(await fs.readFile(path.join(puzzleDir, file), 'utf8'));

if (errors.length) {
  console.error('Project verification failed:');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}
console.log('Project verification passed.');
console.log(`Approved clues: ${approvedCount}`);
console.log(`Themes: ${themes.length}`);
console.log(`Puzzle files: ${puzzleFiles.length}`);
console.log(`IPUZ files: ${ipuzFiles.length}`);
console.log(`Exolve files: ${exolveFiles.length}`);
