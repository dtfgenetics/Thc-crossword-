import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import { loadStoredLetters, saveStoredLetters } from '../src/crossword/storage.js';

describe('crossword persistence', () => {
  it('guards browser storage acquisition before calling persistence helpers', () => {
    const main = fs.readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
    expect(main).toMatch(/function browserStorage\(\) \{[\s\S]*return window\.localStorage;[\s\S]*catch \{[\s\S]*return null;/);
    expect(main).toContain('loadStoredLetters(browserStorage()');
    expect(main).toContain('saveStoredLetters(browserStorage()');
  });

  it('loads valid saved letters', () => {
    const storage = { getItem: () => '{"2,3":"S"}' };
    expect(loadStoredLetters(storage, 'puzzle')).toEqual({ '2,3': 'S' });
  });

  it('falls back when storage reads throw', () => {
    const storage = { getItem: () => { throw new Error('blocked'); } };
    expect(loadStoredLetters(storage, 'puzzle')).toEqual({});
  });

  it('rejects malformed or non-object saved data', () => {
    expect(loadStoredLetters({ getItem: () => 'not-json' }, 'puzzle')).toEqual({});
    expect(loadStoredLetters({ getItem: () => '[]' }, 'puzzle')).toEqual({});
    expect(loadStoredLetters({ getItem: () => '42' }, 'puzzle')).toEqual({});
  });

  it('does not crash when storage writes are blocked', () => {
    const storage = { setItem: () => { throw new Error('quota'); } };
    expect(saveStoredLetters(storage, 'puzzle', { '2,3': 'S' })).toBe(false);
  });

  it('reports successful writes', () => {
    let value = '';
    const storage = { setItem: (_key, next) => { value = next; } };
    expect(saveStoredLetters(storage, 'puzzle', { '2,3': 'S' })).toBe(true);
    expect(value).toBe('{"2,3":"S"}');
  });
});
