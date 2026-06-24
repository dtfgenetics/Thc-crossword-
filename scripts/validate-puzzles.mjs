#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import { validatePuzzle } from '../src/crossword/validate.js';

const puzzleDir = path.resolve('public/puzzles');
const files = await fs.readdir(puzzleDir).catch(() => []);
const puzzleFiles = files.filter((file) => /^\d{4}-W\d{2}\.json$/.test(file) || file === 'current.json');
let failures = 0;

for (const file of puzzleFiles) {
  const puzzle = JSON.parse(await fs.readFile(path.join(puzzleDir, file), 'utf8'));
  const errors = validatePuzzle(puzzle, { minPlacedRatio: 0.55 });
  if (errors.length) {
    failures++;
    console.error(`${file}:`);
    for (const error of errors) console.error(`  - ${error}`);
  } else {
    console.log(`${file}: OK`);
  }
}

if (!puzzleFiles.length) {
  console.error('No puzzle JSON files found.');
  process.exit(1);
}

if (failures) process.exit(1);
console.log(`Validated ${puzzleFiles.length} puzzle file(s).`);
