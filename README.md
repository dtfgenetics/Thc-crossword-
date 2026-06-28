# THC Weekly Crossword

A weekly crossword generator and browser-playable crossword game for the THC / DTF games hub.

This repo is built as a clean public repository. It uses permissive public crossword tooling where useful and adds our own validation, weekly publishing, archive, export, and branded player layer.

## What it does

- Generates weekly crossword puzzle JSON from an approved clue bank.
- Publishes the current puzzle to `public/puzzles/current.json`.
- Publishes archived puzzles to `public/puzzles/YYYY-WW.json`.
- Exports matching `YYYY-WW.ipuz.json` and `YYYY-WW.exolve.txt` files.
- Runs a mobile-friendly browser crossword player.
- Saves solver progress in `localStorage`.
- Supports check, reveal, clear, print, clue highlighting, progress tracking, archive links, and export links.
- Rejects invalid puzzle week IDs such as `2026-W99`.

## Public code used

- `crossword-layout-generator` is used as the primary public layout engine when available.
- The project also includes a local fallback layout engine so weekly generation can still work if the public generator is unavailable or produces a weak layout.
- IPUZ and Exolve exports are generated and validated for interoperability.

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
npm run crossword:generate -- --week 2026-W26 --theme grow-room-basics --max 28 --attempts 200
```

## Publish the next weekly puzzle

```sh
npm run crossword:publish-next -- --theme plant-science
```

Dry run without writing files:

```sh
npm run crossword:publish-next -- --theme plant-science --dry-run
```

## Verify the project

```sh
npm run crossword:audit
npm test
npm run crossword:validate
npm run crossword:validate-ipuz
npm run crossword:validate-exolve
npm run crossword:check-exports
npm run verify
npm run build
```

## Main files

- `content/clue-bank.json` — original approved clue bank.
- `content/themes.json` — weekly theme definitions.
- `scripts/generate-weekly-crossword.mjs` — CLI wrapper for weekly generation.
- `scripts/publish-next.mjs` — next-week publisher.
- `src/crossword/generatePuzzle.js` — reusable generation core.
- `src/crossword/localLayout.js` — local fallback layout engine.
- `src/crossword/publicLayout.js` — public generator adapter.
- `src/main.js` — browser player.

## Content rules

Do not copy newspaper clues, paid puzzle clues, or copyrighted puzzle content. Add only original clue/answer pairs to `content/clue-bank.json`.

Answers should be clean, playable, and normalized to letters only. The clue bank keeps display text for humans.

## Adult-use disclaimer

This game is cannabis-themed parody/education content intended for adults 21+ where legal. It is not medical, legal, or cultivation compliance advice.
