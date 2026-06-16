# Comet Design Handoff

- Change: vary-commentary-across-runs
- Phase: design
- Mode: compact
- Context hash: 7e7a4eff26f19bce306da3ca66aa01befda3c9b380b318d7a95eace7bc3a6bd2

Generated-by: comet-handoff.sh

OpenSpec remains the canonical capability spec. This handoff is a deterministic, source-traceable context pack, not an agent-authored summary.

## openspec/changes/vary-commentary-across-runs/proposal.md

- Source: openspec/changes/vary-commentary-across-runs/proposal.md
- Lines: 1-15
- SHA256: 4bc249bff3095157da1b2e811e657749ad56aaa88d6f81c78273a2e8238f82cb

```md
## Why

The game now avoids duplicate copy inside one run, but repeated match facts can still produce the same commentary across different runs. This happens because some commentary RNG seeds are tied only to round, opponent, score, and attributes instead of the run seed. The visible effect is that a player who replays similar paths can see the same report too often.

## What Changes

- Bind transition and knockout commentary RNG to the game run seed while keeping same-seed determinism.
- Add more event-copy candidates for common match-report surfaces.
- Extend verification so identical match facts can produce different commentary when the commentary seed changes.

## Out Of Scope

- No UI layout changes.
- No scoring model changes.
- No runtime network or AI generation.
```

## openspec/changes/vary-commentary-across-runs/design.md

- Source: openspec/changes/vary-commentary-across-runs/design.md
- Lines: 1-13
- SHA256: 12834064a25ee894fbccebf7632b1b1ba38f305f7373f9906e4a1767b9f091d4

```md
## Design

The simulation should keep deterministic reproducibility for the same run seed, attributes, and replacement team. However, commentary text should not be keyed only by match facts, because different runs can legitimately share the same opponent, score, and attribute profile.

`simulateWorldCupRun` will derive a `commentarySeed` from the run seed and selected team. That seed is passed into transition commentary and knockout commentary. Knockout per-round commentary still includes round, opponent, score, and attributes in its RNG key, but now also includes the run commentary seed.

The authored copy pools for match openings, player interventions, late phases, no-goal near misses, and final whistles will be expanded. Existing run-local copy ledger behavior remains unchanged: it prevents same-run repeats, while the new seed gives different runs more ways to select from the pools.

## Verification

- Same seed still generates identical transition, knockout commentary, path rows, and run copy.
- Direct fixed-match samples with different commentary RNG seeds produce different visible commentary.
- Existing duplicate-copy and player-role checks continue to pass.
```

## openspec/changes/vary-commentary-across-runs/tasks.md

- Source: openspec/changes/vary-commentary-across-runs/tasks.md
- Lines: 1-9
- SHA256: 929f02de5d84702c608b4d134848929f3e0263d765c78645532a750b3ded6db7

```md
## 1. Commentary Entropy

- [ ] 1.1 Include run-level commentary seed in transition and knockout commentary RNG.
- [ ] 1.2 Expand match-report copy pools for common repeated surfaces.

## 2. Verification

- [ ] 2.1 Add a fixed-match commentary variability regression.
- [ ] 2.2 Run syntax, game verification, build, OpenSpec validation, and diff checks.
```

## openspec/changes/vary-commentary-across-runs/specs/dynamic-commentary/spec.md

- Source: openspec/changes/vary-commentary-across-runs/specs/dynamic-commentary/spec.md
- Lines: 1-20
- SHA256: c8aa18d6b9f0760cb2fbf514a227db5afec1e865e82646a725ad13eb9f40658d

```md
## MODIFIED Requirements

### Requirement: Single-run visible copy uniqueness
The system SHALL avoid repeating generated visible commentary or short-copy strings within a single game run, generated visible copy SHALL NOT expose internal ids, and different run seeds SHOULD produce varied generated commentary even when match facts are similar.

#### Scenario: One run has no duplicate generated visible copy
- **WHEN** a game run generates transition lines, knockout commentary, group result copy, advancement hints, path notes, and settlement copy
- **THEN** generated visible text strings MUST NOT repeat within that run

#### Scenario: Deterministic de-duplication remains stable
- **WHEN** two runs use the same seed, attributes, and replacement team
- **THEN** the de-duplicated generated copy MUST match exactly between both runs

#### Scenario: Internal ids stay hidden
- **WHEN** generated visible commentary falls back after normal copy pools are exhausted
- **THEN** visible text MUST NOT contain internal identifiers such as knockout round ids, match ids, or run ids

#### Scenario: Different run seeds vary similar match commentary
- **WHEN** two generated reports share the same match facts but use different run commentary seeds
- **THEN** visible commentary SHOULD differ while still respecting score, team, and player-role facts
```
