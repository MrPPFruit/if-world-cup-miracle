## Context

The app is a pure frontend React/Vite mobile-first mini-game. Its UI already covers home, attributes, replacement, transition, group result, knockout, and settlement pages, but the tournament truth currently lives in constants inside `src/App.jsx`. That couples visual components to demo data and blocks real replayability, failure states, settlement character selection, and CDN-log telemetry.

The product constraints are strict: no backend, no database, no login, no long-term save, no secrets in frontend code, and production deployment as static `dist/` contents to COS/CDN. Ordinary gameplay state may live in memory and reset on refresh. A session id in `sessionStorage` is allowed only for anonymous CDN-log telemetry.

## Goals / Non-Goals

**Goals:**
- Move tournament rules into focused `src/game/` modules with stable data contracts.
- Generate a single `SimulationResult` that drives all post-replacement screens.
- Keep zero-luck deterministic and make hidden champion routes explicit.
- Use FIFA ranking snapshot data as source input while keeping game ratings tunable.
- Preserve current UI density, transition timing, advancement board rules, and settlement character asset API.
- Add static deployment and telemetry safety checks.

**Non-Goals:**
- No backend simulation service.
- No live ranking fetch at runtime.
- No user account, leaderboard, cloud save, or anti-cheat system.
- No major visual redesign in this change.
- No serious prediction claim.

## Decisions

1. **Create a pure simulation layer instead of patching components.**
   - `src/game/teams.js` owns groups, slots, rankings, ratings, tags, and display names.
   - `src/game/random.js` owns stable hashing and seeded RNG.
   - `src/game/simulation.js` owns outcome gating, group and knockout generation, scoring, advancement, and settlement payloads.
   - `src/game/commentary.js` owns event templates and semantic rich text parts.
   - React screens receive generated data and remain primarily presentational.
   - Alternative considered: keep adding conditional logic to `App.jsx`. Rejected because it would deepen the current demo-data coupling.

2. **Use outcome-first simulation with explainable backfill.**
   - At game start, the engine determines the final achievement from attributes, replacement difficulty, rating path, and luck.
   - The engine then generates group standings, knockout opponents, scores, report rows, advancement board state, and settlement copy consistent with that achievement.
   - This gives product-level control over champion/failure rates while still producing realistic-looking football output.

3. **Model luck separately from paper strength.**
   - Non-luck attributes form China skill and choose report/event pools.
   - Luck affects champion probability, positive rescue chance, miracle event count, and commentary absurdity.
   - Luck never directly lowers China performance and never creates negative punishment.

4. **Freeze ranking data instead of runtime fetching.**
   - Store a 2026-06-11 FIFA men's ranking snapshot note with each team.
   - Convert rank/points to `baseRating` for gameplay.
   - Use rating gaps to influence expected goals and score margin, while preserving low-score football and upsets.
   - Alternative considered: fetch rankings from FIFA at runtime. Rejected because the production game must run without network requests and remain static.

5. **Make zero-luck champion routes explicit.**
   - Luck 0 uses a stable seed derived from config.
   - Primary hidden route: `7/7/6/5/5/0`, replacing Netherlands in F1, ending with China 1:0 Japan in the final.
   - Additional hidden routes can be table-driven, but there is no luck rescue at `luck=0`.
   - The approximate 3% target applies to guided hardcore attempts, not random all-configuration sampling.

6. **Settlement character payload comes from final result.**
   - Champion settlement passes the final defeated opponent to `getSettlementCharacterAsset`.
   - Failure settlement passes failure reason or failure seed to choose one of five China defeated variants.
   - UI components must not handwrite character asset paths.

7. **Static deployment constraints are testable.**
   - Vite build must emit `dist/index.html` and not `dist/dist/index.html`.
   - `build.sourcemap` is false.
   - `public/__track/pixel.gif` is copied to `dist/__track/pixel.gif`.
   - No `.map` files are allowed under `dist/assets/`.

## Risks / Trade-offs

- **Probability tuning may feel too generous or too impossible** -> Add deterministic distribution tests and keep constants centralized.
- **Ranking realism may make China fail too often** -> Use outcome gates and luck rescue to preserve entertainment without lying that ratings are official predictions.
- **Generated reports may feel generic** -> Weight templates by dominant attributes and luck level so builds read differently.
- **App.jsx may still remain large after first pass** -> Keep this change focused on extracting game truth first; component decomposition can be a later change if needed.
- **Telemetry could be mistaken for progress persistence** -> Store only anonymous per-session id, never game state.

## Migration Plan

1. Add simulation modules and tests without changing UI behavior.
2. Wire game start to create a `SimulationResult` in memory.
3. Replace hardcoded group, knockout, advancement, and settlement data reads with generated data.
4. Add telemetry helper and static pixel asset.
5. Add build configuration and deployment checks.
6. Run build and browser smoke through a complete champion and failure path.
