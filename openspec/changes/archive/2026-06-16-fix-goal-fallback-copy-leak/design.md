## Fix

Expand the goal-copy candidate pools with extra China and opponent goal lines, then replace the fallback text with a base-id-free set of deterministic Chinese fallbacks. The fallback may mention goal sequence in human language, but must not include internal ids.

Verification will scan generated narrative fragments for internal patterns such as `knockout-SF`, `knockout-R32`, `knockout-FINAL`, and `run-`.

## Scope

- `src/game/commentary.js`
- `scripts/verify-game-engine.mjs`
