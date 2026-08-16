# THC Weekly Crossword — Source of Truth

`dtfgenetics/Thc-crossword-` is the canonical code and machine-readable content repository for the THC Weekly Crossword.

Google Drive `04 Games/THC Crossword` is canonical for approved brand/art masters, human review records, printable release packages, and archived approved exports intended for long-term project control.

## Machine sources

- `content/clue-bank.json` — original approved clue bank.
- `content/themes.json` — weekly theme definitions.
- `public/puzzles/current.json` and archived weekly puzzle JSON — published game data.
- IPUZ and Exolve exports are generated from the canonical puzzle data.

## Rules

Do not copy paid/newspaper clues or copyrighted puzzle content. Only original approved clue/answer pairs enter the clue bank.

## Release

Run the repository audit, tests, puzzle validation, IPUZ/Exolve validation, export checks, verification and build commands before a weekly release. Store final approved human-facing release evidence in Drive.
