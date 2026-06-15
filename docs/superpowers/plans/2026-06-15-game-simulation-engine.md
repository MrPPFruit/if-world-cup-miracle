# Game Simulation Engine Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace demo-hardcoded tournament results with a pure frontend simulation engine that generates believable China World Cup IF runs and static-deployment telemetry.

**Architecture:** Add a focused `src/game/` layer for data, randomization, probability, commentary, and tournament output. Keep existing React screens mostly presentational by feeding them a `SimulationResult`. Add deployment checks and CDN pixel telemetry without introducing backend dependencies.

**Tech Stack:** React 19, Vite 6, plain JavaScript ES modules, Node-based verification scripts, static assets under `public/`.

---

## File Structure

- Create `src/game/teams.js`: 48-team data, groups, slots, names, flag codes, ranking snapshot metadata, base ratings, tags.
- Create `src/game/random.js`: stable hash, deterministic RNG, weighted choice, Poisson-like score sampling.
- Create `src/game/model.js`: attribute constants, China skill, luck probability bands, score helpers, achievement gates.
- Create `src/game/commentary.js`: rich-part helpers and attribute/luck weighted report templates.
- Create `src/game/simulation.js`: public `simulateTournament(config)` and result assembly.
- Create `src/game/telemetry.js`: `track(eventName, data)` via `/__track/pixel.gif`.
- Create `scripts/verify-game-engine.mjs`: deterministic and distribution sanity checks.
- Create `scripts/verify-static-build.mjs`: `dist/` deployment checks.
- Create `public/__track/pixel.gif`: transparent tracking pixel.
- Modify `src/App.jsx`: import game data/simulation, generate `simulationResult`, and render generated group/knockout/final data.
- Modify `vite.config.mjs`: set `build.sourcemap = false`.
- Modify `package.json`: add verification scripts.
- Modify `README.md`: document static deployment, telemetry, and no-backend constraints.
- Modify `openspec/changes/build-game-simulation-engine/tasks.md`: check off tasks as completed.

### Task 1: Static Deployment Contract

**Files:**
- Modify: `vite.config.mjs`
- Create: `public/__track/pixel.gif`
- Create: `scripts/verify-static-build.mjs`
- Modify: `package.json`
- Modify: `README.md`
- Modify: `openspec/changes/build-game-simulation-engine/tasks.md`

- [ ] **Step 1: Disable production sourcemaps**

Replace `vite.config.mjs` with:

```js
export default {
  optimizeDeps: {
    include: ["react", "react-dom/client"],
  },
  server: {
    warmup: {
      clientFiles: ["./src/main.jsx"],
    },
  },
  build: {
    sourcemap: false,
  },
};
```

- [ ] **Step 2: Add tracking pixel asset**

Create `public/__track/pixel.gif` as a 1x1 transparent GIF. Use a binary-safe command or checked-in fixture; verify with:

```bash
file public/__track/pixel.gif
```

Expected: GIF image data.

- [ ] **Step 3: Add static build verification**

Create `scripts/verify-static-build.mjs` that checks:

```js
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const dist = path.join(root, "dist");
const required = [
  path.join(dist, "index.html"),
  path.join(dist, "__track", "pixel.gif"),
];
const forbidden = [
  path.join(dist, "dist", "index.html"),
];

for (const file of required) {
  if (!fs.existsSync(file)) {
    throw new Error(`Missing required build artifact: ${path.relative(root, file)}`);
  }
}

for (const file of forbidden) {
  if (fs.existsSync(file)) {
    throw new Error(`Forbidden nested build artifact exists: ${path.relative(root, file)}`);
  }
}

const assetDir = path.join(dist, "assets");
const mapFiles = fs.existsSync(assetDir)
  ? fs.readdirSync(assetDir, { recursive: true }).filter((name) => String(name).endsWith(".map"))
  : [];

if (mapFiles.length > 0) {
  throw new Error(`Source maps must not be emitted: ${mapFiles.join(", ")}`);
}

console.log("Static build artifacts verified");
```

- [ ] **Step 4: Add npm script**

Add:

```json
"verify:static": "node scripts/verify-static-build.mjs"
```

- [ ] **Step 5: Update README deployment notes**

Add production notes: domain, Cloudflare DNS-only CNAME, Tencent CDN/COS static upload root, no backend/database/login, `dist/` only upload, no `.map`, pixel telemetry by CDN logs.

- [ ] **Step 6: Run verification**

Run:

```bash
npm run build
npm run verify:static
```

Expected: both pass.

- [ ] **Step 7: Commit**

```bash
git add vite.config.mjs public/__track/pixel.gif scripts/verify-static-build.mjs package.json package-lock.json README.md openspec/changes/build-game-simulation-engine/tasks.md
git commit -m "chore: add static deployment contract"
```

### Task 2: Game Data And Model

**Files:**
- Create: `src/game/teams.js`
- Create: `src/game/random.js`
- Create: `src/game/model.js`
- Create: `scripts/verify-game-engine.mjs`
- Modify: `package.json`
- Modify: `openspec/changes/build-game-simulation-engine/tasks.md`

- [ ] **Step 1: Create team data**

Implement `src/game/teams.js` with:

```js
export const RANKING_SNAPSHOT = {
  source: "FIFA/Coca-Cola Men's World Ranking",
  officialUpdate: "2026-06-11",
  nextUpdate: "2026-07-20",
};

export const GROUP_MATCH_PATTERN = [[1, 2], [3, 4], [4, 2], [1, 3], [4, 1], [2, 3]];
export const team = ({ code, name, group, slot, fifaRank, fifaPoints, baseRating, tags = [] }) => ({ code, flag: code, name, group, slot, fifaRank, fifaPoints, baseRating, tags });
export const TEAMS = [/* all 48 teams matching current GROUPS */];
export const GROUPS = [/* derived or explicit A-L groups */];
export const TEAM_BY_CODE = Object.fromEntries(TEAMS.map((item) => [item.code, item]));
export const getTeamByCode = (code) => TEAM_BY_CODE[code];
```

Use the existing team codes/names in `src/App.jsx` and the current flags/character codes. Include ranking values for all teams; if exact FIFA points are not available from current source for lower teams, use documented game-balanced `baseRating` and keep `fifaPoints: null`.

- [ ] **Step 2: Create deterministic random helpers**

Implement `src/game/random.js` with exported `stableHash`, `createRng`, `pick`, `weightedPick`, `chance`, and `poisson`.

- [ ] **Step 3: Create model helpers**

Implement `src/game/model.js` with:

```js
export const CHINA_CODE = "cn";
export const ATTRIBUTE_KEYS = ["attack", "defense", "midfield", "stamina", "tactics", "luck"];
export const ZERO_LUCK_CHAMPION_ATTRIBUTES = { attack: 7, defense: 7, midfield: 6, stamina: 5, tactics: 5, luck: 0 };
export function getChinaSkill(attributes) { /* formula from design doc */ }
export function championChance(attributes, replacedTeam) { /* luck table + modifiers */ }
export function expectedGoals(powerA, powerB) { /* clamp formula */ }
export function scoreMatch(homePower, awayPower, rng) { /* low-score football */ }
```

- [ ] **Step 4: Add model verification skeleton**

Create `scripts/verify-game-engine.mjs` with imports from `src/game/model.js`, `src/game/teams.js`, and later `src/game/simulation.js`. Initial checks should validate team count, group count, rating order sanity, and zero-luck attribute helper.

- [ ] **Step 5: Add npm script**

Add:

```json
"verify:game": "node scripts/verify-game-engine.mjs"
```

- [ ] **Step 6: Run verification**

Run:

```bash
npm run verify:game
npm run build
```

Expected: both pass.

- [ ] **Step 7: Commit**

```bash
git add src/game/teams.js src/game/random.js src/game/model.js scripts/verify-game-engine.mjs package.json package-lock.json openspec/changes/build-game-simulation-engine/tasks.md
git commit -m "feat: add game data and simulation model"
```

### Task 3: Simulation And Commentary

**Files:**
- Create: `src/game/zeroLuckRoutes.js`
- Create: `src/game/commentary.js`
- Create: `src/game/simulation.js`
- Modify: `scripts/verify-game-engine.mjs`
- Modify: `openspec/changes/build-game-simulation-engine/tasks.md`

- [ ] **Step 1: Add zero-luck route table**

Create a route entry for `7/7/6/5/5/0 + nl` with final China 1:0 Japan. Keep route rows table-driven and include `defeatedOpponentCode: "jp"`.

- [ ] **Step 2: Add commentary builders**

Create rich-part helpers equivalent to current `transitionLine`, `time`, `teamName`, `playerName`, `systemTag`, and `score`. Export functions that generate transition and knockout report lines from match context and dominant attributes.

- [ ] **Step 3: Implement `simulateTournament(config)`**

Return a complete `SimulationResult`. For hidden zero-luck route, return fixed route. For normal routes, use outcome-first champion probability, group backfill, knockout backfill, score generation, and settlement payload.

- [ ] **Step 4: Expand verification**

In `scripts/verify-game-engine.mjs`, assert:

```js
const hidden = simulateTournament({ attributes: ZERO_LUCK_CHAMPION_ATTRIBUTES, replacedTeamCode: "nl" });
assert.equal(hidden.finalAchievement, "CHAMPION");
assert.equal(hidden.settlement.defeatedOpponentCode, "jp");
assert.deepEqual(hidden.knockout.rounds.at(-1).score, [1, 0]);
```

Also assert two identical zero-luck non-hidden configs deep-equal, and high-rated teams beat low-rated teams more often in a deterministic sample.

- [ ] **Step 5: Run verification**

Run:

```bash
npm run verify:game
npm run build
```

Expected: both pass.

- [ ] **Step 6: Commit**

```bash
git add src/game/zeroLuckRoutes.js src/game/commentary.js src/game/simulation.js scripts/verify-game-engine.mjs openspec/changes/build-game-simulation-engine/tasks.md
git commit -m "feat: simulate tournament outcomes"
```

### Task 4: UI Integration

**Files:**
- Modify: `src/App.jsx`
- Modify: `src/characterAssets.js` only if existing API needs small compatibility support
- Modify: `openspec/changes/build-game-simulation-engine/tasks.md`

- [ ] **Step 1: Replace local team constants**

Import `GROUPS`, `getTeamByCode`, and any display helpers from `src/game/teams.js`. Keep existing visual structure and `FlagIcon` behavior.

- [ ] **Step 2: Add simulation state**

Add `simulationResult` state in `App`. Generate it when starting transition from replacement page and when using random game start.

- [ ] **Step 3: Wire group screen**

Change `GroupOverviewScreen` props from raw selected team only to generated `groupStage` data, preserving the current DOM classes and CTA placement.

- [ ] **Step 4: Wire knockout screen**

Change `KnockoutScreen` to read generated rounds and advancement stages. If a round is a failure round, CTA should move to failure settlement after report completion.

- [ ] **Step 5: Wire settlement screen**

Change `FinalScreen` to read `settlement.pathRows`, `settlement.defeatedOpponentCode`, `settlement.failureReason`, and `settlement.failureSeed`. Champion uses final defeated opponent; failure uses China variant.

- [ ] **Step 6: Run verification**

Run:

```bash
npm run verify:game
npm run build
```

Expected: both pass.

- [ ] **Step 7: Commit**

```bash
git add src/App.jsx src/characterAssets.js openspec/changes/build-game-simulation-engine/tasks.md
git commit -m "feat: render generated tournament results"
```

### Task 5: Telemetry And Final Verification

**Files:**
- Create: `src/game/telemetry.js`
- Modify: `src/App.jsx`
- Modify: `scripts/verify-game-engine.mjs`
- Modify: `openspec/changes/build-game-simulation-engine/tasks.md`

- [ ] **Step 1: Implement telemetry helper**

Create `src/game/telemetry.js` with `getSessionId` and `track`. Use `sessionStorage` only for `sid`. Filter data to primitive values and omit keys matching sensitive names.

- [ ] **Step 2: Emit first-version events**

Add `track` calls for page view, game start, attribute submit, team selected, group stage result, knockout result, final result, champion, failed, restart, and share click.

- [ ] **Step 3: Final static checks**

Run:

```bash
npm run verify:game
npm run build
npm run verify:static
find dist/assets -name '*.map' -print
```

Expected: first three pass; final command prints nothing.

- [ ] **Step 4: Browser smoke**

Start preview and use the in-app browser to verify:

- Home opens.
- Mobile layout remains usable.
- Hidden zero-luck path can reach champion settlement with Japan defeated character.
- A normal failure path reaches failure settlement with China defeated variant.
- No visible console error.

- [ ] **Step 5: Commit**

```bash
git add src/game/telemetry.js src/App.jsx scripts/verify-game-engine.mjs openspec/changes/build-game-simulation-engine/tasks.md
git commit -m "feat: add telemetry and verify simulation flow"
```

## Self-Review

- OpenSpec `game-simulation` requirements map to Tasks 2-4.
- OpenSpec `static-deployment-telemetry` requirements map to Tasks 1 and 5.
- Zero-luck Japan final is explicitly covered in Task 3 verification and Task 5 smoke.
- Settlement character selection is covered in Task 4.
- No backend, database, login, or long-term persistence is introduced.
