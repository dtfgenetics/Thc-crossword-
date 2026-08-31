# THC Crossword Clue Style Guide

The daily crossword depends on clue quality. Bad clues make the game feel cheap even when the generator works.

## Core rules

1. Every answer must be legal, clean, and usable in a public-facing adult 21+ cannabis-themed education game.
2. Do not copy newspaper clues or commercial puzzle content.
3. Do not use medical claims, dosage instructions, or legal advice.
4. Avoid inside jokes unless the clue is clearly understandable to a normal player.
5. Avoid clues that are so obvious they remove the puzzle challenge.
6. Avoid clues that require unsafe cultivation behavior.
7. Keep clue wording short enough for mobile play.

## Answer format

Answers can be stored with spaces for display:

```json
{ "answer": "Grow Tent", "clue": "Indoor enclosure used to control light, smell, and environment" }
```

The generator normalizes answers for grid placement, so `Grow Tent` can become `GROWTENT` internally while still displaying as `Grow Tent`.

## Difficulty guide

### Easy

Use for common grower terms, tools, and beginner education.

Example:

```json
{ "answer": "Clone", "clue": "A cutting that preserves the genetics of the source plant", "difficulty": "easy" }
```

### Medium

Use for terms that growers recognize but beginners may need to learn.

Example:

```json
{ "answer": "Phenotype", "clue": "The visible expression of genetics and environment working together", "difficulty": "medium" }
```

### Hard

Use for science, breeding, or environment terms that require more knowledge.

Example:

```json
{ "answer": "Vapor Pressure Deficit", "clue": "Environmental metric combining temperature and humidity pressure", "difficulty": "hard" }
```

## Category guide

Use consistent categories so the theme picker works.

Recommended categories:

```text
DTF Genetics
Lineage
Breeding
Plant Science
Plant Anatomy
Cultivation
Tools
Environment
Seeds
Harvest
Extracts
Nutrients
Culture
Game Terms
```

## Good clue patterns

Good clues define the answer without giving it away too cheaply.

```json
{ "answer": "Trichome", "clue": "Tiny resin gland growers inspect when judging maturity" }
```

```json
{ "answer": "Backcross", "clue": "Breeding move where offspring are crossed back to a parent or parent-like plant" }
```

```json
{ "answer": "Carbon Filter", "clue": "Odor-control part commonly paired with an exhaust fan" }
```

## Bad clue patterns

Too obvious:

```json
{ "answer": "Seed", "clue": "A seed" }
```

Too vague:

```json
{ "answer": "Clone", "clue": "A plant thing" }
```

Too long:

```json
{ "answer": "Trellis", "clue": "A netting system that people use in a grow room when they want branches spread out and supported during flower because the flowers can get heavy" }
```

Potentially risky:

```json
{ "answer": "Pesticide", "clue": "Spray anything strong to kill pests fast" }
```

## Approval checklist for new clues

Before adding clues to `content/clue-bank.json`, check:

- Answer is at least 3 letters after normalization.
- Answer is not a duplicate.
- Clue is at least 8 characters.
- Category matches the theme system.
- Difficulty is one of `easy`, `medium`, or `hard`.
- `approved` is set to `true` only after review.

## Daily puzzle content target

For a reliable daily crossword, aim for at least:

```text
300 approved clue-bank entries minimum
500 approved clue-bank entries preferred
25+ clues per major category
```

Do not generate a full year of puzzles until the clue bank is large enough. A small bank will repeat too often and make the daily feature feel stale.
