# Comet Design Handoff

- Change: build-game-simulation-engine
- Phase: design
- Mode: compact
- Context hash: 00dd33c13c00e6504b87c268e56b9c776679711c11e19e309278c6f3a4aa613c

Generated-by: comet-handoff.sh

OpenSpec remains the canonical capability spec. This handoff is a deterministic, source-traceable context pack, not an agent-authored summary.

## openspec/changes/build-game-simulation-engine/proposal.md

- Source: openspec/changes/build-game-simulation-engine/proposal.md
- Lines: 1-27
- SHA256: 7f577750056d314f4aab06dffdee002e776067f36a632293fe315164fb8a5861

```md
## Why

The current prototype has a polished mobile UI, but tournament results, scores, opponents, advancement boards, and settlement paths are still hardcoded for demonstration. The next product step is to replace that demo script with a deterministic, testable, pure-frontend game simulation engine that can generate believable and shareable World Cup IF runs.

## What Changes

- Introduce a frontend-only game simulation engine that produces a full tournament result from attributes and replacement team.
- Freeze a FIFA men's ranking snapshot as source data and derive game-balanced team ratings from it.
- Make luck a controlled outcome and event-exaggeration input, while non-luck attributes drive match content and report flavor.
- Add deterministic zero-luck hidden champion routes, including a fixed China vs Japan final victory route.
- Connect generated simulation output to group result, knockout, advancement, and settlement screens.
- Preserve the existing UI layout decisions and settlement character asset API.
- Add CDN-log pixel telemetry and static deployment safety requirements for the COS/CDN production path.

## Capabilities

### New Capabilities
- `game-simulation`: Rules and outputs for generating tournament paths, scores, reports, zero-luck routes, and settlement payloads from a player configuration.
- `static-deployment-telemetry`: Static-site build, deployment, security, and CDN-log telemetry requirements for the production domain.

### Modified Capabilities

## Impact

- Affects `src/App.jsx`, new `src/game/*` modules, `src/characterAssets.js` call sites, and production build configuration.
- Affects documentation in `AGENTS.md`, `README.md`, and Comet/OpenSpec artifacts.
- Requires tests or deterministic checks for hidden zero-luck routes, seeded repeatability, luck probability bands, ranking-based strength sanity, static build structure, and telemetry pixel availability.
```

## openspec/changes/build-game-simulation-engine/design.md

- Source: openspec/changes/build-game-simulation-engine/design.md
- Lines: 1-82
- SHA256: 5873a853c19c82ca4682beb691e76570ea3e8cc7dc516890d75b2ed6b08d77ab

[TRUNCATED]

```md
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
```

Full source: openspec/changes/build-game-simulation-engine/design.md

## openspec/changes/build-game-simulation-engine/tasks.md

- Source: openspec/changes/build-game-simulation-engine/tasks.md
- Lines: 1-25
- SHA256: 17e447ab20e106b0e668e2e73ad562189e30c1a998d057d3c096053d14551483

```md
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
```

## openspec/changes/build-game-simulation-engine/specs/game-simulation/spec.md

- Source: openspec/changes/build-game-simulation-engine/specs/game-simulation/spec.md
- Lines: 1-86
- SHA256: c185c72e95fabdb2ec0c5df43e0be4e6a14b01450752ee0a057674ad38a59aa7

[TRUNCATED]

```md
## ADDED Requirements

### Requirement: Simulation result contract
The system SHALL generate a complete in-memory `SimulationResult` from player attributes, replacement team, and game seed before leaving the transition flow.

#### Scenario: Result drives post-replacement screens
- **WHEN** a player submits valid attributes and a replacement team
- **THEN** group result, knockout, advancement, and settlement screens MUST render from the generated simulation result rather than hardcoded demo constants

#### Scenario: Refresh resets ordinary game state
- **WHEN** the page is refreshed during an ordinary non-share game
- **THEN** the app MUST be allowed to return to the start state without restoring the previous run

### Requirement: Luck and attribute roles
The system SHALL use non-luck attributes to shape football content and use luck to shape positive miracle probability and commentary exaggeration.

#### Scenario: Defensive build changes report flavor
- **WHEN** defense is the dominant non-luck attribute
- **THEN** China match reports MUST favor keeper, bunker, clearance, low-score, and survival events over attacking fireworks

#### Scenario: High luck increases absurd positive events
- **WHEN** luck is high
- **THEN** China match reports MAY contain more VAR favors, posts, own goals, strange accidents, and exaggerated meme-like turns

#### Scenario: Luck does not punish China
- **WHEN** luck changes from low to high with other attributes unchanged
- **THEN** the engine MUST NOT introduce additional negative China-only penalties because of higher luck

### Requirement: Zero-luck determinism
The system SHALL make every `luck = 0` game deterministic for the same attributes and replacement team.

#### Scenario: Same zero-luck configuration repeats exactly
- **WHEN** a player starts two games with the same `luck = 0` attributes and replacement team
- **THEN** the final achievement, opponents, scores, group standings, and settlement payload MUST match exactly

#### Scenario: Zero-luck has no rescue randomness
- **WHEN** a zero-luck match result would eliminate China and the configuration is not an explicit hidden champion route
- **THEN** the engine MUST NOT apply luck rescue or random miracle events

### Requirement: Hidden zero-luck champion routes
The system SHALL support explicit table-driven hidden champion routes for zero-luck games.

#### Scenario: China defeats Japan in hidden zero-luck final
- **WHEN** attributes are exactly `attack=7`, `defense=7`, `midfield=6`, `stamina=5`, `tactics=5`, `luck=0` and China replaces Netherlands
- **THEN** the engine MUST generate a champion route whose final match is China defeating Japan

#### Scenario: Non-hidden zero-luck route fails
- **WHEN** `luck = 0` and the attributes plus replacement team do not match a hidden champion route
- **THEN** the engine MUST produce a non-champion final achievement

### Requirement: Ranking-based football realism
The system SHALL use frozen team ranking data and game ratings so stronger ranked teams usually perform better over large samples.

#### Scenario: Strong team usually beats weak team
- **WHEN** the engine simulates many neutral non-China matches between a high-rated team and a low-rated team
- **THEN** the high-rated team MUST win materially more often than the low-rated team

#### Scenario: Ranking gap affects score margin
- **WHEN** two teams have a large rating gap
- **THEN** the expected score margin MUST generally be larger than for two closely rated teams while still allowing low-score football outcomes

#### Scenario: Upsets remain possible
- **WHEN** a weaker team plays a stronger team outside deterministic hidden routes
- **THEN** the simulation MUST allow occasional upsets rather than enforcing the ranking order as a fixed bracket

### Requirement: Outcome-first tournament path
The system SHALL decide the final achievement first and then generate a consistent tournament path.

#### Scenario: Champion result has complete path
- **WHEN** the outcome gate selects champion
- **THEN** the generated path MUST include group advancement, five China knockout wins, a final defeated opponent, champion advancement board state, and champion settlement payload

#### Scenario: Failure result has failure payload
- **WHEN** the outcome gate selects a failure achievement
- **THEN** the generated path MUST stop at the correct round and include failure reason, failure seed, last opponent, final score, and failure settlement payload

### Requirement: Settlement character selection
The system SHALL select settlement character assets from simulation payloads.

#### Scenario: Champion shows final defeated opponent
```

Full source: openspec/changes/build-game-simulation-engine/specs/game-simulation/spec.md

## openspec/changes/build-game-simulation-engine/specs/static-deployment-telemetry/spec.md

- Source: openspec/changes/build-game-simulation-engine/specs/static-deployment-telemetry/spec.md
- Lines: 1-49
- SHA256: ef2fadf0f93a792cb4167b3b22cf1c60594f2e9ddcd0204b33294055fdc1ca63

```md
## ADDED Requirements

### Requirement: Static build output
The system SHALL build as a static frontend site suitable for Tencent Cloud COS and CDN deployment.

#### Scenario: Build emits correct root structure
- **WHEN** `npm run build` completes
- **THEN** `dist/index.html` MUST exist and the build MUST NOT create `dist/dist/index.html`

#### Scenario: Main game works without backend
- **WHEN** the built site is served as static files
- **THEN** the core game flow MUST run without requiring server APIs, database access, login, or external runtime data fetches

### Requirement: Production source-map safety
The system SHALL keep production sourcemaps disabled.

#### Scenario: Vite sourcemap disabled
- **WHEN** production build configuration is inspected
- **THEN** Vite build sourcemaps MUST be false

#### Scenario: No map artifacts
- **WHEN** `npm run build` completes
- **THEN** no `.map` files MUST exist under `dist/assets/`

### Requirement: CDN-log telemetry pixel
The system SHALL support first-version analytics through CDN log pixel requests only.

#### Scenario: Pixel asset exists in build
- **WHEN** `npm run build` completes
- **THEN** `dist/__track/pixel.gif` MUST exist

#### Scenario: Telemetry does not require backend
- **WHEN** `track(eventName, data)` is called
- **THEN** the frontend MUST request `/__track/pixel.gif` with query parameters and MUST NOT require a backend endpoint

#### Scenario: Telemetry avoids sensitive data
- **WHEN** telemetry events are emitted
- **THEN** event parameters MUST NOT include phone number, WeChat id, real name, precise location, identity number, email, secret, or admin credential data

### Requirement: No long-term game persistence
The system SHALL avoid long-term ordinary game state persistence.

#### Scenario: Session id is not progress save
- **WHEN** the telemetry helper stores an anonymous session id in `sessionStorage`
- **THEN** it MUST NOT store attributes, replacement team, tournament path, score history, or settlement result for continuation

#### Scenario: No localStorage progress
- **WHEN** ordinary game state changes
- **THEN** the app MUST NOT write progress to `localStorage` or persistent browser storage
```

