#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import { parseIpuzJson } from '../src/crossword/ipuz.js';

const puzzleDir = path.resolve('public/puzzles');
const files = (await fs.readdir(puzzleDir).catch(() => [])).filter((file) => file.endsWith('.ipuz.json'));
let failures = 0;

if (!files.length) {
  console.error('No IPUZ export files found.');
  process.exit(1);
}

for (const file of files) {
  try {
    parseIpuzJson(await fs.readFile(path.join(puzzleDir, file), 'utf8'));
    console.log(`${file}: OK`);
  } catch (error) {
    failures++;
    console.error(`${file}: ${error.message}`);
  }
}

if (failures) process.exit(1);
console.log(`Validated ${files.length} IPUZ export file(s).`);
