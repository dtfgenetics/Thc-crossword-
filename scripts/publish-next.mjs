#!/usr/bin/env node
import fs from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { currentIsoWeek, latestArchivedWeek, nextIsoWeek } from '../src/crossword/week.js';

function arg(name, fallback) {
  const index = process.argv.indexOf(`--${name}`);
  return index >= 0 && process.argv[index + 1] ? process.argv[index + 1] : fallback;
}

function hasFlag(name) {
  return process.argv.includes(`--${name}`);
}

async function readArchiveIds() {
  const files = await fs.readdir('public/puzzles').catch(() => []);
  const fileIds = files
    .map((file) => /^(\d{4}-W\d{2})\.json$/.exec(file)?.[1])
    .filter(Boolean);

  try {
    const index = JSON.parse(await fs.readFile('public/puzzles/index.json', 'utf8'));
    const indexIds = (index.puzzles || []).map((puzzle) => puzzle.id).filter(Boolean);
    return [...new Set([...fileIds, ...indexIds])];
  } catch {
    return fileIds;
  }
}

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: 'inherit', shell: process.platform === 'win32' });
    child.on('exit', (code) => code === 0 ? resolve() : reject(new Error(`${command} exited with ${code}`)));
    child.on('error', reject);
  });
}

const theme = arg('theme', 'grow-room-basics');
const max = arg('max', '28');
const attempts = arg('attempts', '200');
const explicitWeek = arg('week', null);
const archivedIds = await readArchiveIds();
const latest = latestArchivedWeek(archivedIds);
const week = explicitWeek || (latest ? nextIsoWeek(latest) : currentIsoWeek(new Date()));

console.log(`Next weekly crossword: ${week}`);
console.log(`Theme: ${theme}`);

if (hasFlag('dry-run')) {
  console.log('Dry run only. No files were generated.');
  process.exit(0);
}

await run(process.execPath, [
  'scripts/generate-weekly-crossword.mjs',
  '--week', week,
  '--theme', theme,
  '--max', max,
  '--attempts', attempts
]);

await run(process.execPath, ['scripts/validate-puzzles.mjs']);
console.log(`Published ${week}.`);
