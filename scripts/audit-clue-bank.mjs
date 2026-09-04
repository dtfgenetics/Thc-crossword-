#!/usr/bin/env node
import fs from 'node:fs/promises';
import { validateClueBank } from '../src/crossword/validate.js';
import { normalizeAnswer } from '../src/crossword/format.js';
import { loadClueBank } from './load-clue-bank.mjs';

const bank = await loadClueBank();
const themes = JSON.parse(await fs.readFile('content/themes.json', 'utf8'));
const errors = validateClueBank(bank);
const approved = bank.filter((entry) => entry.approved !== false);
const categories = new Map();
for (const entry of approved) {
  const category = entry.category || 'Uncategorized';
  categories.set(category, (categories.get(category) || 0) + 1);
}

const uniqueAnswers = new Set();
for (const entry of approved) {
  const answer = normalizeAnswer(entry.answer);
  if (uniqueAnswers.has(answer)) errors.push(`Duplicate approved answer after normalization: ${entry.answer}`);
  uniqueAnswers.add(answer);
}

for (const theme of themes) {
  for (const category of theme.preferredCategories || []) {
    const count = categories.get(category) || 0;
    if (count === 0) errors.push(`Theme ${theme.id} references empty category: ${category}`);
  }
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}

console.log(`Approved clue entries: ${approved.length}`);
console.log(`Unique answers: ${uniqueAnswers.size}`);
console.log(`Themes: ${themes.length}`);
console.log('Categories:');
for (const [category, count] of [...categories.entries()].sort()) {
  console.log(`- ${category}: ${count}`);
}
