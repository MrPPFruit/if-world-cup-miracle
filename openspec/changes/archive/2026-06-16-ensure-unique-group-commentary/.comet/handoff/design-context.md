# Comet Design Handoff

- Change: ensure-unique-group-commentary
- Phase: design
- Mode: compact
- Context hash: 2d1a69c7b5c89fbba9686b29be744bb4ccd309dbb1ab33d11e01c1bfaccc561b

Generated-by: comet-handoff.sh

OpenSpec remains the canonical capability spec. This handoff is a deterministic, source-traceable context pack, not an agent-authored summary.

## openspec/changes/ensure-unique-group-commentary/proposal.md

- Source: openspec/changes/ensure-unique-group-commentary/proposal.md
- Lines: 1-24
- SHA256: 4dbeea934071e4f8666d4a933778233e2b97b1b810359d69e75cde357e140618

```md
## Why

Dynamic commentary currently still feels template-bound because visible lines can repeat inside a single run, especially around group-stage generation. This breaks replay freshness and makes the group stage feel too thin compared with knockout reports.

## What Changes

- Add a per-run copy de-duplication rule so generated visible copy does not repeat within one game run.
- Expand group-stage copy from a single summary into three match-specific detail notes tied to opponent, score, result shape, attributes, and luck tone.
- Render those group match details on the group result screen without breaking the compact 400x865 layout.
- Extend verification so repetition and group-detail coverage fail in `npm run verify:game`.

## Capabilities

### New Capabilities

### Modified Capabilities
- `dynamic-commentary`: add single-run no-repeat guarantees and richer group-stage per-match detail requirements.

## Impact

- `src/game/commentary.js`: add de-duplicated copy selection and group match detail generation.
- `src/game/simulation.js`: pass generated group detail copy through `SimulationResult.copy`.
- `src/App.jsx`: render group-stage detail notes under each China group match.
- `scripts/verify-game-engine.mjs`: assert no duplicate visible commentary/copy in a run and assert three group match details exist.
```

## openspec/changes/ensure-unique-group-commentary/design.md

- Source: openspec/changes/ensure-unique-group-commentary/design.md
- Lines: 1-41
- SHA256: 9174405ecb4343e7663d09987a84ddaa9be5b85eb9973f410a0a0d4653ca7924

```md
## Context

The current dynamic commentary system uses deterministic seeded RNG and static player profiles, but many template pools are small. Multiple surfaces in one run can therefore reuse the same visible phrase, and the group result page still shows only score rows plus one summary sentence.

The project constraint is mobile-first: the group page must stay readable in a 400x865 viewport. The right fix is not to dump long paragraphs into compact rows, but to generate short, specific per-match notes and enforce no-repeat behavior in the generator and verification.

## Goals / Non-Goals

**Goals:**
- Guarantee that visible generated copy does not repeat within one run.
- Give each China group match a distinct compact detail note based on match facts.
- Preserve deterministic output for the same seed, attributes, and replacement team.
- Keep group result text compact enough for the existing mobile layout.

**Non-Goals:**
- No change to scoring odds, group standings, knockout path, or zero-luck routes.
- No live player API, backend, LLM calls, or external data.
- No large group page redesign beyond fitting the new details into the existing match panel.

## Decisions

1. Use a run-local copy ledger inside `generateRunCopy`.
   - Rationale: uniqueness is a per-run presentation invariant, not tournament truth. Keeping it in the copy layer avoids touching scoring or advancement.
   - Alternative considered: globally expand every pool until collisions are unlikely. That still cannot guarantee no repeats.

2. Add `groupMatchDetails` as compact generated strings in `SimulationResult.copy`.
   - Rationale: the group result screen already maps `gameRun.chinaMatches`; pairing each match with a short generated note keeps data flow simple and deterministic.
   - Alternative considered: generate JSX-specific notes in `App.jsx`. That would move copy logic back into the view layer and make verification harder.

3. Verify visible text uniqueness by flattening transition lines, knockout commentary, and run copy fields.
   - Rationale: the user's complaint is about what the player sees in one run. Verification should inspect plain text, not just object shape.
   - Alternative considered: checking only template IDs. That misses repeated literal output across different templates.

## Risks / Trade-offs

- [Risk] Strict no-repeat can fail if future pools shrink or new surfaces reuse old copy.
  -> Mitigation: verification samples multiple runs and fails on duplicate visible strings.
- [Risk] More group text can crowd the page.
  -> Mitigation: keep each detail under a short budget and use a secondary line inside each existing match row.
- [Risk] De-duplication fallback might produce awkward suffixes.
  -> Mitigation: prefer sufficiently large pools and only use fallback for short compact copy, never for rich match facts.
```

## openspec/changes/ensure-unique-group-commentary/tasks.md

- Source: openspec/changes/ensure-unique-group-commentary/tasks.md
- Lines: 1-15
- SHA256: 2553f8a0e199d4631b4685a368396dae377d3c75742c47ff2a32e17eb3571ab2

```md
## 1. Copy Engine

- [ ] 1.1 Add run-local de-duplicated copy selection helpers for short copy and group detail generation.
- [ ] 1.2 Generate three distinct group-stage match detail notes from opponent, score shape, attributes, luck tone, and match index.

## 2. UI Integration

- [ ] 2.1 Pass group match details through `SimulationResult.copy` and render them in the group result match rows.
- [ ] 2.2 Keep group match detail text compact and visually contained in the existing 400x865 layout.

## 3. Verification

- [ ] 3.1 Extend `npm run verify:game` to fail on duplicate generated visible copy within sampled runs.
- [ ] 3.2 Verify every run has three distinct compact group match detail notes.
- [ ] 3.3 Run build, OpenSpec validation, and browser screenshot review for the group result page.
```

## openspec/changes/ensure-unique-group-commentary/specs/dynamic-commentary/spec.md

- Source: openspec/changes/ensure-unique-group-commentary/specs/dynamic-commentary/spec.md
- Lines: 1-28
- SHA256: 5d0988c2a1cafc247fbddfc8506756f2104c6c63a906d55b2b6d2796dac9af53

```md
## ADDED Requirements

### Requirement: Single-run visible copy uniqueness
The system SHALL avoid repeating generated visible commentary or short-copy strings within a single game run.

#### Scenario: One run has no duplicate generated visible copy
- **WHEN** a game run generates transition lines, knockout commentary, group result copy, advancement hints, path notes, and settlement copy
- **THEN** generated visible text strings MUST NOT repeat within that run

#### Scenario: Deterministic de-duplication remains stable
- **WHEN** two runs use the same seed, attributes, and replacement team
- **THEN** the de-duplicated generated copy MUST match exactly between both runs

### Requirement: Group-stage per-match detail copy
The system SHALL generate compact group-stage detail copy for each China group match.

#### Scenario: Three China group matches have distinct detail notes
- **WHEN** China completes its three group-stage matches
- **THEN** the group result payload MUST include one detail note per China match
- **AND** the three detail notes MUST be distinct from each other

#### Scenario: Group detail reflects match facts
- **WHEN** a group match detail is generated
- **THEN** it MUST reflect the match's opponent, result shape, score pressure, attribute style, or luck tone without implying a different score or opponent

#### Scenario: Group detail remains compact
- **WHEN** group match detail text is shown on the group result page
- **THEN** each detail note MUST stay within the compact group-match text budget
```

