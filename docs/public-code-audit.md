# Public GitHub Code Audit

This document tracks public GitHub projects that can help build the THC Weekly Crossword project.

## Best fit for this repo

| Project | License | Use | Decision |
|---|---:|---|---|
| MichaelWehar/Crossword-Layout-Generator | MIT | Layout generation from answer/clue JSON | Already used as dependency/fallback input source. Keep wrapped by validation because it can omit words or create disconnected islands. |
| viresh-ratnakar/exolve | MIT | Full interactive crossword player and Exolve text format | Keep our Exolve exporter. Consider optional Exolve embed/export route, not required for first launch. |
| dylanbeattie/ipuzzler | MIT | IPUZ-format JavaScript player | Strong candidate if we want standards-first IPUZ rendering later. Keep our IPUZ exporter compatible. |
| JaredReisinger/react-crossword | MIT | React crossword component | Useful if the main games hub is React. Do not add now unless the site becomes React-based. |
| papauschek/crossword-puzzle-maker | MIT | Dense generator reference, Scala.js, PDF/browser ideas | Reference only. Useful for algorithm and print/export ideas, too heavy for current JS app. |
| gaoryrt/crossword-generator | MIT | Small JS generator package with ownerMap output | Reference/possible secondary generator adapter. Has TODOs around no-result words. |
| satchamo/Crossword-Generator | MIT | Older small JS generator | Reference only. Simple but old. |

## Avoid embedding directly

| Project | License | Reason |
|---|---:|---|
| pycrossword / S0mbre crossword | GPLv3 | Powerful editor/generator, but GPLv3 is not a good fit for this website repo unless the whole derivative work accepts GPL obligations. Use only as feature reference. |

## Current implementation choice

The repo should stay dependency-light and own its core game player. Public code should be used in three safe ways:

1. Depend on permissive packages when useful.
2. Export standard formats so other tools can render our puzzles.
3. Use older/heavier projects as reference only, not copied code.

## Next integration targets

1. Add an optional Exolve preview page that reads `public/puzzles/YYYY-WW.exolve.txt`.
2. Add an IPUZ import/export validation test using our generated IPUZ files.
3. Add a second generator adapter interface so gaoryrt/crossword-generator or another MIT generator can be tested without replacing the current pipeline.
4. Keep GPL tools out of runtime dependencies.
