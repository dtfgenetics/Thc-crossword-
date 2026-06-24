#!/usr/bin/env node
import fs from 'node:fs/promises';
import { selectEntries } from '../src/crossword/selectEntries.js';

function readArg(name, fallback) {
  const index = process.argv.indexOf(`--${name}`);
  return index >= 0 && process.argv[index + 1] ? process.argv[index + 1] : fallback;
}

const themeId = readArg('theme', 'grow-room-basics');
const max = Number(readArg('max', '20'));
const bank = JSON.parse(await fs.readFile('content/clue-bank.json', 'utf8'));
const themes = JSON.parse(await fs.readFile('content/themes.json', 'utf8'));
const theme = themes.find((item) => item.id === themeId) || themes[0];
const selected = selectEntries({ bank, theme, max, random: () => 0 });

console.log(`${theme.name} preview`);
for (const entry of selected) console.log(`- ${entry.answer}: ${entry.clue}`);
