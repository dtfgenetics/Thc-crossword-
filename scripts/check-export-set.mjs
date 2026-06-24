#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';

const puzzleDir = path.resolve('public/puzzles');
const files = await fs.readdir(puzzleDir).catch(() => []);
const weeks = files
  .map((file) => /^(\d{4}-W\d{2})\.json$/.exec(file)?.[1])
  .filter(Boolean)
  .sort();

const errors = [];
for (const week of weeks) {
  for (const suffix of ['.json', '.ipuz.json', '.exolve.txt']) {
    const file = `${week}${suffix}`;
    if (!files.includes(file)) errors.push(`Missing export: ${file}`);
  }
}

if (!weeks.length) errors.push('No weekly puzzle JSON files found.');

if (errors.length) {
  console.error('Export set check failed:');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Export sets complete for ${weeks.length} weekly puzzle(s).`);
