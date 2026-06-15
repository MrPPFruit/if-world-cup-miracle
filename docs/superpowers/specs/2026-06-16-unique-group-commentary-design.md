---
comet_change: ensure-unique-group-commentary
role: technical-design
canonical_spec: openspec
archived-with: 2026-06-16-ensure-unique-group-commentary
status: final
---

# Unique Group Commentary Design

## Context

The current commentary system is deterministic, but several visible copy pools are small. During one game run, the same phrase can appear more than once across transition lines, group result helper copy, or short result notes. The group result page also shows only three score rows plus a single summary line, so the group stage feels under-written compared with knockout reports.

## Goals

- Treat "no repeated generated visible copy within one run" as a hard invariant.
- Add one compact generated detail note for each China group-stage match.
- Keep all generation deterministic for the same seed, attributes, and replacement team.
- Keep layout changes limited to the existing group match panel.

## Design

The run will own a presentation ledger shared by transition commentary, knockout commentary, and run-level short copy. Every authored narrative phrase must pass through a de-duplicating picker. If a preferred template has already been used, the picker advances to another candidate before using a deterministic fallback.

Group match details will be generated from match facts:

- match index and opponent tier
- win/draw/loss or clean-sheet/narrow-loss shape
- score pressure
- dominant attribute
- luck tone

The detail is stored as `copy.groupMatchDetails`, aligned by index with `chinaMatches`. `App.jsx` renders the detail as a secondary single-line text inside each existing group match row. When details are present, the old bottom `groupMatchesNote` is not rendered so the fixed-height mobile layout does not carry two layers of group commentary.

## Verification

`scripts/verify-game-engine.mjs` will flatten generated narrative copy units from:

- transition feed lines
- knockout commentary lines
- run copy fields, including `groupMatchDetails`

It will exclude factual tokens such as time, score, team names, player names, round labels, CTA labels, and short system tags. It will fail if any authored narrative phrase repeats in the same run. It will also assert that every sampled run has exactly three group detail notes, all distinct and within the compact budget.

## Risks

- A future copy pool may shrink and trigger the uniqueness assertion. That is desired: the failure points directly at the insufficient pool.
- More group text can crowd the mobile page. The mitigation is a strict compact budget and visual screenshot review at 400x865.
