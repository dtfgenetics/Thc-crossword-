# THC Weekly Crossword

A weekly crossword generator and browser-playable crossword game for the THC / DTF games hub.

This repo is intentionally built as its own clean public repository. It uses public MIT-licensed crossword tooling where useful and adds our own validation, weekly publishing, archive, and branded player layer.

## What it does

- Generates weekly crossword puzzle JSON from an approved clue bank.
- Publishes the current puzzle to `public/puzzles/current.json`.
- Publishes archived puzzles to `public/puzzles/YYYY-WW.json`.
- Runs a mobile-friendly browser crossword player.
- Saves solver progress in `localStorage`.
- Supports check, reveal, clear, print, and clue highlighting.
- Exports internal JSON, IPUZ-style JSON, and Exolve puzzle text from the generator.

## Public code used

- `crossword-layout-generator` by Michael Wehar and contributors is listed as a dependency and used by the generator when available. It is MIT licensed. The repo docs state that it accepts clue/answer JSON and outputs crossword layout positions.
- This project also contains a local fallback layout engine so the generator remains usable if the dependency is unavailable or produces a weak layout.

## Install

```sh
npm install
```

## Run locally

```sh
npm run dev
```

## Generate a weekly puzzle

```sh
npm run crossword:generate -- --week 2026-W26
```

Optional flags:

```sh
npm run crossword:generate -- --week 2026-W26 --seed blue-mango --min 18 --max 28 --attempts 250
```

## Build

```sh
npm run build
```

## Test

```sh
npm test
```

## Content rules

Do not copy newspaper clues, paid puzzle clues, or copyrighted puzzle content. Add only original clue/answer pairs to `content/clue-bank.json`.

Answers should be clean, playable, and normalized to letters only. The generator removes spaces and punctuation for the grid, but the clue bank keeps display text for humans.

## Adult-use disclaimer

This game is cannabis-themed parody/education content intended for adults 21+ where legal. It is not medical, legal, or cultivation compliance advice.
