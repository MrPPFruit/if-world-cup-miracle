## 1. Project Contracts

- [ ] 1.1 Record durable game logic, settlement character, deployment, and telemetry decisions in project docs.
- [ ] 1.2 Configure Vite production build for static deployment safety and add the CDN telemetry pixel asset.

## 2. Simulation Engine

- [ ] 2.1 Create `src/game/` team data, ranking snapshot metadata, group slots, ratings, and replacement tags.
- [ ] 2.2 Create deterministic RNG, stable seed, score helpers, outcome probability bands, and zero-luck hidden route tables.
- [ ] 2.3 Implement group and knockout simulation that outputs standings, China matches, advancement states, final achievement, settlement payload, and share-safe summary data.
- [ ] 2.4 Implement attribute-weighted commentary generation with semantic rich parts and luck-based exaggeration.

## 3. UI Integration

- [ ] 3.1 Generate and store `SimulationResult` at game start, including random-start support.
- [ ] 3.2 Update transition, group result, knockout, advancement board, and settlement screens to render generated result data.
- [ ] 3.3 Wire champion/failure settlement character selection to final defeated opponent or China failure variant.
- [ ] 3.4 Add first-version telemetry events without storing ordinary game progress.

## 4. Verification

- [ ] 4.1 Add deterministic checks for zero-luck repeatability and the China vs Japan hidden champion route.
- [ ] 4.2 Add distribution/sanity checks for luck probability bands, ranking strength behavior, and score margin behavior.
- [ ] 4.3 Run `npm run build` and verify `dist/index.html`, `dist/__track/pixel.gif`, absence of `.map` files, and no nested `dist/dist`.
- [ ] 4.4 Run local preview/browser smoke for one champion path and one failure path on a mobile viewport.
