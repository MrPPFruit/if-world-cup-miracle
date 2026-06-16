---
comet_change: fix-goal-fallback-copy-leak
role: verification-report
canonical_spec: openspec
---

# Goal Fallback Copy Leak Verification

## Scope

- Removed visible internal ids from exhausted goal-copy fallback text.
- Added more varied China and opponent goal-copy candidates.
- Updated `pickUnique` so fallback factories can provide multiple candidates and still respect the run-local copy ledger.
- Added regression checks for internal id leakage and the old repetitive fallback phrase.

## Verification

- `node --check src/game/commentary.js && node --check scripts/verify-game-engine.mjs` passed.
- `npm run verify:game` passed.
- Manual high-score sample with `match.id = "knockout-SF"` and China 12 goals showed no visible internal id and no repeated fallback phrase.
- `npm run build` passed. Vite reported the existing lucide-react `"use client"` warning only.
- `openspec validate --all --strict` passed.
- `git diff --check` passed.
