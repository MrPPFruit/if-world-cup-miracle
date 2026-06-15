---
comet_change: add-player-lore-commentary
role: technical-design
canonical_spec: openspec
archived-with: 2026-06-16-add-player-lore-commentary
status: final
---

# Player Lore Commentary Design

## Context

The match report already validates player-team membership and role compatibility, but star-player copy still mostly uses generic role text. The next improvement is a curated static lore layer: football fans should recognize public context around specific players, while casual players should still read it as playful match color.

## Source Notes

The initial lore set is based on public reporting and official records checked during implementation:

- Harry Kane's long trophy wait and Bayern title arc.
- Ousmane Dembele's 2025 Ballon d'Or and PSG/French-team context.
- Mbappe's Ballon d'Or ranking tension after moving from PSG to Real Madrid.
- Lamine Yamal's youngest Euro goalscorer record.
- Vinicius Junior's Ballon d'Or controversy.
- Messi, Cristiano Ronaldo, Modric, Neymar, Salah, Haaland, Bellingham, Son, De Bruyne and other high-recognition football narratives.

## Implementation

Add `PLAYER_LORE_LINES_BY_NAME` to `commentary.js`. Each entry maps a player name to role-compatible line pools. A new helper will pick lore lines before falling back to the generic `PLAYER_EVENT_LINES` / `PLAYER_GOAL_EVENT_LINES`.

The helper must:

- accept player, role, rng, and ledger;
- use the existing `pickUnique` path so same-run copy uniqueness still holds;
- fall back cleanly to generic role copy when a player has no lore for that role;
- keep player lore as a narrative phrase only, leaving player names, teams, time, and scores in structured rich parts.

Update `teams.js` to replace Griezmann with Dembele in France's player profile list because Griezmann has retired from international football.

## Verification

Extend `scripts/verify-game-engine.mjs` to import the lore map and assert that every lore player appears in the static profile table and every lore role is compatible with the player's supported roles. Existing match-commentary checks continue to verify that generated player events do not reference a player outside the match teams.
