#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import { parseExolveText } from '../src/crossword/exolve.js';

const puzzleDir = path.resolve('public/puzzles');
const files = (await fs.readdir(puzzleDir).catch(() => [])).filter((file) => file.endsWith('.exolve.txt'));
let failures = 0;

if (!files.length) {
  console.error('No Exolve export files found.');
  process.exit(1);
}

for (const file of files) {
  try {
    parseExolveText(await fs.readFile(path.join(puzzleDir, file), 'utf8'));
    console.log(`${file}: OK`);
  } catch (error) {
    failures++;
    console.error(`${file}: ${error.message}`);
  }
}

if (failures) process.exit(1);
console.log(`Validated ${files.length} Exolve export file(s).`);
