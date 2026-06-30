#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { currentDailyDate } from '../src/crossword/date.js';
import { writeDailyArchiveIndex } from './build-daily-index.mjs';

function arg(name, fallback) {
  const index = process.argv.indexOf(`--${name}`);
  return index >= 0 && process.argv[index + 1] ? process.argv[index + 1] : fallback;
}

function hasFlag(name) {
  return process.argv.includes(`--${name}`);
}

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: 'inherit', shell: process.platform === 'win32' });
    child.on('exit', (code) => code === 0 ? resolve() : reject(new Error(`${command} exited with ${code}`)));
    child.on('error', reject);
  });
}

const zone = arg('timezone', 'America/Chicago');
const runDate = arg('date', currentDailyDate(new Date(), zone));
const theme = arg('theme', 'grow-room-basics');
const limit = arg('max', '18');
const tries = arg('attempts', '200');
const dailyDir = path.resolve('public/puzzles/daily');
const rootDir = path.resolve('public/puzzles');
const dailyFile = path.join(dailyDir, `${runDate}.json`);
const exists = await fs.access(dailyFile).then(() => true).catch(() => false);

console.log(`Daily crossword target: ${runDate}`);

if (hasFlag('dry-run')) {
  console.log(exists ? 'Dry run: existing puzzle would become current.' : 'Dry run: new puzzle would be generated.');
  process.exit(0);
}

if (exists && !hasFlag('force')) {
  const puzzleJson = await fs.readFile(dailyFile, 'utf8');
  await fs.mkdir(dailyDir, { recursive: true });
  await fs.writeFile(path.join(dailyDir, 'current.json'), puzzleJson);
  await fs.writeFile(path.join(rootDir, 'current.json'), puzzleJson);
  await writeDailyArchiveIndex(dailyDir);
  await run(process.execPath, ['scripts/validate-puzzles.mjs']);
  console.log(`Current daily crossword set to ${runDate}.`);
} else {
  await run(process.execPath, [
    'scripts/generate-daily-crossword.mjs',
    '--date', runDate,
    '--timezone', zone,
    '--theme', theme,
    '--max', limit,
    '--attempts', tries
  ]);
  await run(process.execPath, ['scripts/validate-puzzles.mjs']);
  console.log(`Generated and set current daily crossword ${runDate}.`);
}
