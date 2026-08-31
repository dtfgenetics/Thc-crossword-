# THC Daily Crossword System

This project supports two publishing modes:

- Weekly crossword files using IDs like `2026-W26`.
- Daily crossword files using IDs like `2026-06-29`.

The daily system was added without deleting the weekly system so existing weekly puzzles and exports remain usable.

## Daily file layout

Daily puzzles are stored under:

```text
public/puzzles/daily/
```

Generated daily files use this shape:

```text
public/puzzles/daily/YYYY-MM-DD.json
public/puzzles/daily/YYYY-MM-DD.ipuz.json
public/puzzles/daily/YYYY-MM-DD.exolve.txt
public/puzzles/daily/current.json
public/puzzles/daily/index.json
public/puzzles/current.json
public/puzzles/index.json
```

`public/puzzles/current.json` is intentionally updated by the daily generator so the existing browser player can load the current daily puzzle without needing a frontend rewrite.

`public/puzzles/index.json` is mirrored from the daily archive index so the existing archive panel can list daily puzzles.

## Main scripts

```bash
npm run crossword:generate:daily
npm run crossword:publish-today
npm run crossword:daily-index
npm run crossword:validate
```

### Generate a specific date

```bash
npm run crossword:generate:daily -- --date 2026-06-29 --theme grow-room-basics --max 18 --attempts 200
```

### Publish today

```bash
npm run crossword:publish-today
```

The publish command checks the current date in `America/Chicago` by default. If today's puzzle already exists, it promotes the existing daily puzzle to `current.json`. If it does not exist, it generates a new daily puzzle.

### Dry run

```bash
npm run crossword:publish-today -- --dry-run
```

Dry run reports what would happen without writing puzzle files.

### Force regeneration

```bash
npm run crossword:publish-today -- --force
```

Use force only when the existing puzzle for that date is bad and needs to be replaced.

## Validation

The validator now checks:

- weekly root puzzle files like `public/puzzles/2026-W26.json`
- root `public/puzzles/current.json`
- daily puzzle files like `public/puzzles/daily/2026-06-29.json`
- daily `public/puzzles/daily/current.json`

Run:

```bash
npm run crossword:validate
```

## Daily theme calendar

The daily rotation lives at:

```text
content/daily-theme-calendar.json
```

This file defines a default weekly theme schedule. It does not yet automatically drive the generator. The next improvement is to make `scripts/run-daily-crossword.mjs` read this file when no explicit `--theme` argument is supplied.

## GitHub Actions

The workflow lives at:

```text
.github/workflows/daily-crossword.yml
```

It runs once per day and can also be triggered manually. It installs dependencies, generates or promotes the daily puzzle, validates puzzles, runs tests, builds the app, and commits generated puzzle files.

## Recovery checklist

If the daily crossword breaks:

1. Run `npm run crossword:validate`.
2. Check the generated file in `public/puzzles/daily/YYYY-MM-DD.json`.
3. If the file is malformed, regenerate with `--force`.
4. If the clue bank fails, run `npm run crossword:audit`.
5. If the site loads the wrong puzzle, confirm `public/puzzles/current.json` matches the desired daily puzzle.
6. If archive links are wrong, confirm `public/puzzles/index.json` contains daily IDs, not only weekly IDs.

## Merge checklist

Before merging daily support:

```bash
npm install
npm run crossword:publish-today -- --dry-run
npm run crossword:publish-today
npm run crossword:validate
npm test
npm run build
```

Do not merge until those commands pass.
