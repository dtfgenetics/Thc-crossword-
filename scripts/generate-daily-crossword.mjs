#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import { validateClueBank } from '../src/crossword/validate.js';
import { exportIpuz, exportExolve } from '../src/crossword/exporters.js';
import { buildDailyPuzzle } from '../src/crossword/generatePuzzle.js';
import { currentDailyDate } from '../src/crossword/date.js';
import { writeDailyArchiveIndex } from './build-daily-index.mjs';

function arg(name, fallback) {
  const index = process.argv.indexOf(`--${name}`);
  return index >= 0 && process.argv[index + 1] ? process.argv[index + 1] : fallback;
}

console.log('Daily crossword generator ready.');
