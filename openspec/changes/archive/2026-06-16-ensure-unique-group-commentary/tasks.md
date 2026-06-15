## 1. Copy Engine

- [x] 1.1 Add run-local de-duplicated copy selection helpers for short copy and group detail generation.
- [x] 1.2 Generate three distinct group-stage match detail notes from opponent, score shape, attributes, luck tone, and match index.

## 2. UI Integration

- [x] 2.1 Pass group match details through `SimulationResult.copy` and render them in the group result match rows.
- [x] 2.2 Keep group match detail text compact and visually contained in the existing 400x865 layout.

## 3. Verification

- [x] 3.1 Extend `npm run verify:game` to fail on duplicate generated visible copy within sampled runs.
- [x] 3.2 Verify every run has three distinct compact group match detail notes.
- [x] 3.3 Run build, OpenSpec validation, and browser screenshot review for the group result page.
