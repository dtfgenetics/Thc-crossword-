#!/usr/bin/env node
import fs from 'node:fs/promises';
import { validateClueBank } from '../src/crossword/validate.js';
import { normalizeAnswer } from '../src/crossword/format.js';

const bank = JSON.parse(await fs.readFile('content/clue-bank.json', 'utf8'));
const errors = validateClueBank(bank);
const approved = bank.filter((entry) => entry.approved !== false);
const categories = new Map();
for (const entry of approved) {
  const category = entry.category || 'Uncategorized';
  categories.set(category, (categories.get(category) || 0) + 1);
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}

console.log(`Approved clue entries: ${approved.length}`);
console.log(`Unique answers: ${new Set(approved.map((entry) => normalizeAnswer(entry.answer))).size}`);
console.log('Categories:');
for (const [category, count] of [...categories.entries()].sort()) {
  console.log(`- ${category}: ${count}`);
}
