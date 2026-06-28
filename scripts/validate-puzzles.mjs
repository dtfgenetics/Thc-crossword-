#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import { validatePuzzle } from '../src/crossword/validate.js';

const puzzleDir = path.resolve('public/puzzles');
const dailyDir = path.join(puzzleDir, 'daily');
const rootFiles = await fs.readdir(puzzleDir).catch(() => []);
const dailyFiles = await fs.readdir(dailyDir).catch(() => []);

const puzzleFiles = [
  ...rootFiles
    .filter((file) => /^\d{4}-W\d{2}\.json$/.test(file) || file === 'current.json')
    .map((file) => ({ label: file, filePath: path.join(puzzleDir, file) })),
  ...dailyFiles
    .filter((file) => /^\d{4}-\d{2}-\d{2}\.json$/.test(file) || file === 'current.json')
    .map((file) => ({ label: `daily/${file}`, filePath: path.join(dailyDir, file) }))
];

let failures = 0;

for (const file of puzzleFiles) {
  const puzzle = JSON.parse(await fs.readFile(file.filePath, 'utf8'));
  const errors = validatePuzzle(puzzle, { minPlacedRatio: 0.55 });
  if (errors.length) {
    failures++;
    console.error(`${file.label}:`);
    for (const error of errors) console.error(`  - ${error}`);
  } else {
    console.log(`${file.label}: OK`);
  }
}

if (!puzzleFiles.length) {
  console.error('No puzzle JSON files found.');
  process.exit(1);
}

if (failures) process.exit(1);
console.log(`Validated ${puzzleFiles.length} puzzle file(s).`);
