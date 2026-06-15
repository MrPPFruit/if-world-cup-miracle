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
