#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import { isValidDailyDate } from '../src/crossword/date.js';

export async function writeDailyArchiveIndex(outDir = path.resolve('public/puzzles/daily')) {
  const files = await fs.readdir(outDir).catch(() => []);
  const puzzles = [];

  for (const file of files.filter((name) => /^(\d{4}-\d{2}-\d{2})\.json$/.test(name)).sort().reverse()) {
    const id = file.replace(/\.json$/, '');
    if (!isValidDailyDate(id)) continue;
    const puzzle = JSON.parse(await fs.readFile(path.join(outDir, file), 'utf8'));
    puzzles.push({
      id: puzzle.id,
      date: puzzle.date || puzzle.id,
      title: puzzle.title,
      status: puzzle.status,
      theme: puzzle.theme,
      stats: puzzle.stats,
      file
    });
  }

  await fs.mkdir(outDir, { recursive: true });
  await fs.writeFile(path.join(outDir, 'index.json'), JSON.stringify({ updatedAt: new Date().toISOString(), puzzles }, null, 2));
  return puzzles;
}

const isDirectRun = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname);
if (isDirectRun) {
  const puzzles = await writeDailyArchiveIndex();
  console.log(`Indexed ${puzzles.length} daily crossword puzzle(s).`);
}
