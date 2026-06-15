---
comet_change: expand-dynamic-commentary-system
role: technical-design
canonical_spec: openspec
archived-with: 2026-06-16-expand-dynamic-commentary-system
status: final
---

# Dynamic Commentary System Design

## Context

The game already generates a full `SimulationResult` before leaving the transition screen. That result owns the tournament truth: selected replacement team, attributes, group matches, knockout path, advancement boards, settlement state, and seeded randomness.

The current commentary layer is useful but narrow. It has a few attribute templates, a small China player pool, generic opponent references, and several fixed page-level strings in `App.jsx`. This makes repeated playthroughs feel too similar and risks a mismatch between dynamic match facts and static copy.

## Design Goals

- Make commentary a deterministic projection of simulation facts.
- Add static national-team player profiles and use them by team and position.
- Keep compact UI surfaces short while allowing battle-report/feed surfaces to be richer.
- Preserve the existing rich-part rendering protocol: `text`, `time`, `team`, `player`, `system`, and `score`.
- Keep humor absurd, meme-like, and sometimes culturally referential, but not vulgar or hostile.
- Keep the app pure frontend and static.

## Non-Goals

- No external player API, live roster updates, LLM calls, backend services, or persistent storage.
- No changes to match odds, score generation, group/bracket rules, hidden zero-luck route tables, or telemetry model.
- No attempt to make every possible line unique. The target is broad variation with factual consistency.

## Architecture

### 1. Static Player Profiles

Add a static player profile map keyed by team code. Each profile contains:

- `name`: display name in Chinese UI.
- `position`: `goalkeeper`, `defender`, `midfielder`, `forward`, or `creator`.
- `roles`: safe event tags such as `save`, `block`, `control`, `finish`, `pace`, `setPiece`.

These profiles are game copy data, not a live roster promise. They should represent recognizable current national-team context where possible and avoid retired legends or players outside the project’s tournament universe.

China profiles remain explicitly IF-game national-team copy. The text must not imply China qualified for the real World Cup outside the game simulation.

### 2. Commentary Context

Create helper functions that derive a compact `CommentaryContext` from existing inputs:

- `dominantAttribute`: attack, defense, midfield, stamina, or tactics.
- `luckTone`: none, mild, high, or absurd.
- `opponentTier`: superpower, strong, mid, underdog, host, or asia.
- `scoreShape`: clean sheet, comeback, draw, penalty, late win, heavy loss, narrow loss, upset.
- `surface`: feed, battle-report, group-hero, advancement-hint, path-note, settlement-hero.

This context should only describe already-decided facts. It must not decide winners, scores, standings, or advancement.

### 3. Template Pools

Use grouped template pools rather than one giant list:

- Attribute flavor templates: attack, defense, midfield, stamina, tactics.
- Luck/absurd templates: VAR, post, own-goal, referee, cosmic arithmetic.
- Score-shape templates: comeback, clean sheet, penalty, narrow survival, exit.
- Player-position templates: goalkeeper saves, defender blocks, midfielder controls, forward finishes, creator unlocks.
- Short-copy templates: group hero, advancement hint, settlement hero note, path small text.

Templates return rich parts. This keeps semantic highlighting consistent with current CSS.

### 4. Surface Budgets

Budget checks should be conservative:

- CTA and button labels: keep existing or similarly short labels.
- Status chips and advancement hints: roughly one short phrase.
- Path small text: one compact line.
- Group helper copy: one compact sentence without punctuation-heavy formatting.
- Transition feed and knockout battle report: may be longer, but each line should stay readable as a single feed/report item.

If a surface has a short-copy budget, it should use a dedicated short template. It should not truncate a long battle-report line after generation.

### 5. Legacy Copy Cleanup

Keep static labels that are true UI chrome, such as page titles and table headers. Replace or neutralize copy that implies a fixed tournament path when a real `gameRun` exists.

Fallback copy can remain for development safety, but it must be generic and should not advertise a fixed “China beats Brazil” style route unless the simulation produced it.

## Data Flow

```
attributes + selectedTeam + seed
  -> simulateWorldCupRun()
    -> runPlan / groups / knockout / settlement
    -> commentary context helpers
    -> transitionLines
    -> knockoutRounds[].commentary
    -> group/advancement/settlement short copy
  -> React screens render generated result
```

All template selection uses the existing seeded rng passed through simulation generation.

## Testing Strategy

- Extend `scripts/verify-game-engine.mjs` to compare two same-seed runs and assert commentary equality.
- Validate that opponent player names in generated lines belong to the opponent team profile.
- Validate that role-tagged player templates use compatible event tags.
- Validate that compact copy fields stay within agreed budgets.
- Validate rich part kinds remain within the existing renderer’s known set.
- Re-run existing zero-luck route checks to confirm results and commentary remain deterministic.
- Run `npm run verify:game` and `npm run build`.

## Risks And Mitigations

- Player profile drift: keep the profile list static and treat it as game snapshot data.
- Overlong text in compact UI: use short templates and verification budgets.
- Too much randomness: use context weights, not unconditional chaos.
- Unsafe humor: avoid vulgar insults, body shaming, protected-class references, and hostile personal humiliation.
- Hidden simulation coupling: keep commentary context derived from final facts only.
