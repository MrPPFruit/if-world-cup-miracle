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
