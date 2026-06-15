# Comet Design Handoff

- Change: add-player-lore-commentary
- Phase: design
- Mode: compact
- Context hash: 3d48642437e08606ca57610a937ee9e34993ffc6f3ad5e1f6d3671a3326b0a47

Generated-by: comet-handoff.sh

OpenSpec remains the canonical capability spec. This handoff is a deterministic, source-traceable context pack, not an agent-authored summary.

## openspec/changes/add-player-lore-commentary/proposal.md

- Source: openspec/changes/add-player-lore-commentary/proposal.md
- Lines: 1-18
- SHA256: dd64116716b07f5a6b7312598b1b6142f9981bdde446a6b4cc1e1c1d55686b4d

```md
## Why

Football-aware players will enjoy commentary more when famous player references carry recognizable recent context instead of only generic role copy. Current player lines mention names and positions, but most star mentions still sound interchangeable.

## What Changes

- Add source-informed player lore commentary for selected high-recognition players.
- Use lore only when the referenced player belongs to the active match team.
- Keep lore short, playful, and non-harmful.
- Update outdated France player data by replacing retired international Antoine Griezmann with Ousmane Dembele.
- Extend verification so player-lore data remains attached to valid player profiles and compatible roles.

## Out Of Scope

- No score model changes.
- No UI layout changes.
- No live network dependency at runtime.
- No claims that require private or unverifiable rumors.
```

## openspec/changes/add-player-lore-commentary/design.md

- Source: openspec/changes/add-player-lore-commentary/design.md
- Lines: 1-22
- SHA256: 817794d86141fa47cad0550e6e24435a132005d07d86d48dae4856ca3c49c4aa

```md
## Design

The implementation will add a small static lore layer to the commentary generator. Each lore entry is keyed by player name and contains short candidate lines grouped by compatible football roles such as finish, pace, control, setPiece, block, or save.

Lore lines are authored from public football context, then phrased as loose jokes rather than factual reporting. Examples include trophy-drought relief for Harry Kane, the 2025 Ballon d'Or arc for Ousmane Dembele, last-dance framing for Messi and Cristiano Ronaldo, Lamine Yamal's youth-record aura, and Vinicius Junior's Ballon d'Or controversy.

When `generateMatchCommentary` selects a player event, it will first try that player's lore pool for the selected role. If no lore exists, it will fall back to the existing role-based copy. The existing presentation ledger continues to prevent repeated narrative fragments within a run.

France's profile list should replace Griezmann with Dembele because Griezmann has retired from international football. This keeps the national-team player universe closer to the current tournament-facing context.

## Safety

The lore must avoid personal insults, body shaming, protected-class attacks, family/private-life jokes, injury mockery, and low-vulgar language. Injury or age context may be used only as broad sporting context and not as humiliation.

## Verification

Game verification will assert that:

- every lore player exists in `PLAYER_PROFILES_BY_TEAM`;
- each lore role is compatible with that player's roles;
- generated match commentary still passes player-team and role compatibility checks;
- single-run duplicate narrative checks continue to pass.
```

## openspec/changes/add-player-lore-commentary/tasks.md

- Source: openspec/changes/add-player-lore-commentary/tasks.md
- Lines: 1-10
- SHA256: 86ae6db83a22c742590456e63c6319f7023dd80072a403a34534e9f035ac54dd

```md
## 1. Player Lore

- [ ] 1.1 Add source-informed lore pools for selected star players.
- [ ] 1.2 Route player event and goal copy through player-specific lore when available.
- [ ] 1.3 Refresh outdated France player profile data.

## 2. Verification

- [ ] 2.1 Verify lore entries map to existing players and compatible roles.
- [ ] 2.2 Run syntax, game verification, build, OpenSpec validation, and diff checks.
```

## openspec/changes/add-player-lore-commentary/specs/dynamic-commentary/spec.md

- Source: openspec/changes/add-player-lore-commentary/specs/dynamic-commentary/spec.md
- Lines: 1-16
- SHA256: 51e4a4ff72c53bca4cfb99915380efbc1e813e39b77f5d845e72de475748a13e

```md
## ADDED Requirements

### Requirement: Source-informed player lore commentary
The system SHALL support curated player-specific lore lines based on public football context.

#### Scenario: Lore only applies to the active player
- **WHEN** a commentary line references a player with curated lore
- **THEN** the lore line MUST be used only for that player and MUST keep the player attached to the active match team

#### Scenario: Lore stays compatible with the football action
- **WHEN** a lore line is selected for a player event
- **THEN** the line MUST match one of that player's supported football roles such as finishing, pace, control, set pieces, saves, or blocks

#### Scenario: Lore remains safe and compact
- **WHEN** source-informed lore appears in match commentary
- **THEN** it MUST be short, non-vulgar, non-harmful, and phrased as playful football context rather than private rumor or personal attack
```

