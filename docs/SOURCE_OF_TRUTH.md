# THC Daily Crossword — Source of Truth

`dtfgenetics/Thc-crossword-` is the canonical code and machine-readable content repository for the THC Daily Crossword.

Google Drive `04 Games/THC Crossword` is canonical for approved brand/art masters, human review records, printable release packages, and archived approved exports intended for long-term project control.

## Machine sources

- `content/clue-bank.json` — original approved clue bank.
- `content/themes.json` — theme definitions used by daily generation and retained weekly archive/export tooling.
- `public/puzzles/current.json`, `public/puzzles/daily/current.json`, and daily archives — current published game data; legacy weekly archives remain supported.
- IPUZ and Exolve exports are generated from the canonical puzzle data.

## Rules

Do not copy paid/newspaper clues or copyrighted puzzle content. Only original approved clue/answer pairs enter the clue bank.

## Release

Run the repository audit, tests, puzzle validation, IPUZ/Exolve validation, export checks, verification and build commands before a weekly release. Store final approved human-facing release evidence in Drive.
