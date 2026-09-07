import { mkdtemp, readFile, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { writeDailyArchiveIndex } from '../../scripts/build-daily-index.mjs';

function puzzle(id, placedCount = 10) {
  return {
    id,
    date: id,
    puzzleType: 'daily',
    title: `THC Daily Crossword — ${id}`,
    status: 'published',
    stats: { submittedCount: 12, placedCount, score: 1000 + placedCount }
  };
}

describe('daily crossword archive index', () => {
  it('indexes valid daily puzzle files newest first', async () => {
    const dir = await mkdtemp(path.join(os.tmpdir(), 'thc-daily-crossword-'));
    await writeFile(path.join(dir, '2026-06-29.json'), JSON.stringify(puzzle('2026-06-29', 12)));
    await writeFile(path.join(dir, '2026-06-28.json'), JSON.stringify(puzzle('2026-06-28', 8)));
    await writeFile(path.join(dir, '2026-W26.json'), JSON.stringify({ id: '2026-W26' }));
    await writeFile(path.join(dir, 'notes.json'), JSON.stringify({ id: 'notes' }));

    const indexed = await writeDailyArchiveIndex(dir, { mirrorRoot: false });
    const index = JSON.parse(await readFile(path.join(dir, 'index.json'), 'utf8'));

    expect(indexed.map((item) => item.id)).toEqual(['2026-06-29', '2026-06-28']);
    expect(index.puzzleType).toBe('daily');
    expect(index.puzzles[0]).toMatchObject({ id: '2026-06-29', date: '2026-06-29', file: '2026-06-29.json' });
  });
});
