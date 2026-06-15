---
archived-with: 2026-06-16-expand-dynamic-commentary-system
status: final
---
# Dynamic Commentary System Implementation Plan

base-ref: 91aa60102544ab7f1f924ef014c62facfe2a9763

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Expand World Cup IF commentary so simulation facts, player positions, attributes, luck, score shapes, and compact UI budgets produce richer deterministic copy.

**Architecture:** Keep tournament truth inside `simulateWorldCupRun()` and add deterministic copy helpers in `src/game/commentary.js`. Add static player profile data in `src/game/teams.js` or an adjacent focused module, then expose generated short-copy fields on `SimulationResult` so React screens render facts rather than infer them.

**Tech Stack:** React 19, Vite, plain ESM modules, seeded local RNG, OpenSpec/Comet, Node verification scripts.

---

### Task 1: Static Player Profiles And Context Helpers

**Files:**
- Modify: `src/game/teams.js`
- Modify: `src/game/commentary.js`
- Test: `scripts/verify-game-engine.mjs`

- [ ] **Step 1: Add player profiles**

Add a `PLAYER_PROFILES_BY_TEAM` export keyed by team code. Each profile must include `name`, `position`, and `roles`. Include China and a representative subset for all 48 teams, prioritizing recognizable active national-team context. Use conservative names and avoid retired legends.

Expected shape:

```js
export const PLAYER_PROFILES_BY_TEAM = {
  ar: [
    { name: "梅西", position: "creator", roles: ["control", "setPiece", "finish"] },
    { name: "劳塔罗", position: "forward", roles: ["finish"] },
  ],
  cn: [
    { name: "武磊", position: "forward", roles: ["finish", "pace"] },
    { name: "王大雷", position: "goalkeeper", roles: ["save"] },
  ],
};
```

- [ ] **Step 2: Add context helpers**

In `src/game/commentary.js`, add helpers for:

```js
function getOpponentTier(team) {}
function getLuckTone(attributes) {}
function getScoreShape(match, isWin) {}
function getSurfaceBudget(surface) {}
function textLength(partsOrText) {}
```

These helpers must only derive facts. They must not change scores, winners, standings, or advancement.

- [ ] **Step 3: Verify profile shape**

Extend `scripts/verify-game-engine.mjs` to assert every team has at least one profile, every profile has a known position, and every role is from the allowed role set.

Run: `npm run verify:game`

Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/game/teams.js src/game/commentary.js scripts/verify-game-engine.mjs
git commit -m "feat: add commentary player profiles"
```

### Task 2: Expand Transition And Knockout Commentary

**Files:**
- Modify: `src/game/commentary.js`
- Test: `scripts/verify-game-engine.mjs`

- [ ] **Step 1: Expand template pools**

Add grouped template pools for attribute flavor, luck absurdity, score shape, opponent tier, and player-position events. Templates must return `richLine()` objects or rich parts, not plain strings for rendered feed/report copy.

- [ ] **Step 2: Use player-position templates**

Update `generateMatchCommentary()` so opponent player references come from the opponent profile list and match event type:

```js
goalkeeper -> save / penalty pressure
defender -> block / clearance
midfielder or creator -> tempo / set piece / through ball
forward -> shot / finish / offside pressure
```

- [ ] **Step 3: Expand transition lines**

Update `generateTransitionCommentary()` to include more varied group-stage lines using selected team, group opponents, match scores, dominant attribute, and luck tone.

- [ ] **Step 4: Keep scoreState correct**

Ensure every goal or final-score line that changes visible score has a correct `scoreState` when used by knockout reveal logic.

- [ ] **Step 5: Verify deterministic commentary**

Add same-seed comparison for `transitionLines` and every `knockoutRounds[].commentary`.

Run: `npm run verify:game`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/game/commentary.js scripts/verify-game-engine.mjs
git commit -m "feat: expand dynamic match commentary"
```

### Task 3: Generated Short Copy For Screens

**Files:**
- Modify: `src/game/commentary.js`
- Modify: `src/game/simulation.js`
- Modify: `src/App.jsx`
- Test: `scripts/verify-game-engine.mjs`

- [ ] **Step 1: Add short-copy generator**

Export a short-copy helper from `commentary.js`, for example:

```js
export function generateRunCopy({ result, selectedTeam, chinaGroup, chinaMatches, knockout, attributes, rng }) {
  return {
    groupHeroTitle: "",
    groupHeroNote: "",
    groupMatchesNote: "",
    nextCta: "",
    advancementHints: [],
    settlementHeroTitle: "",
    settlementHeroNote: "",
    pathFinalNote: "",
  };
}
```

All returned fields must be compact enough for their UI surface.

- [ ] **Step 2: Attach copy to SimulationResult**

In `simulateWorldCupRun()`, generate `copy` after group and knockout results are known:

```js
copy: generateRunCopy({ ...facts })
```

- [ ] **Step 3: Render generated copy**

In `App.jsx`, prefer `gameRun.copy` for group hero, group match note, advancement hint text, settlement hero text, and final path small copy. Keep fallback strings generic if `gameRun` is absent.

- [ ] **Step 4: Verify compact budgets**

Add assertions for generated copy lengths. Suggested initial budgets:

```js
groupHeroTitle <= 14 Chinese characters
groupHeroNote <= 28 Chinese characters
groupMatchesNote <= 26 Chinese characters
advancementHint <= 18 Chinese characters
settlementHeroNote <= 28 Chinese characters
pathFinalNote <= 34 Chinese characters
```

Run: `npm run verify:game`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/game/commentary.js src/game/simulation.js src/App.jsx scripts/verify-game-engine.mjs
git commit -m "feat: generate compact run copy"
```

### Task 4: Legacy Copy Cleanup And Documentation

**Files:**
- Modify: `src/App.jsx`
- Modify: `design-qa.md`
- Modify: `openspec/changes/expand-dynamic-commentary-system/tasks.md`

- [ ] **Step 1: Search fixed copy**

Run:

```bash
rg -n "巴西|阿根廷|哥伦比亚|荷兰|梦还没醒|这球踢得不一定科学|申请重开宇宙线" src/App.jsx src/game
```

Evaluate each hit. Keep true UI chrome and generated fallback safety. Replace conflicting real-run text with `gameRun.copy` or generic fallback.

- [ ] **Step 2: Update notes**

Append a short section to `design-qa.md` describing the dynamic commentary boundary, player-profile snapshot rule, and compact copy budget.

- [ ] **Step 3: Mark implementation tasks**

Check completed OpenSpec tasks as each implementation slice lands.

- [ ] **Step 4: Commit**

```bash
git add src/App.jsx design-qa.md openspec/changes/expand-dynamic-commentary-system/tasks.md
git commit -m "docs: record commentary system boundary"
```

### Task 5: Verification And UI Preview

**Files:**
- Modify if needed: `scripts/verify-game-engine.mjs`
- Modify if needed: `src/styles.css`

- [ ] **Step 1: Run model verification**

Run:

```bash
npm run verify:game
```

Expected: `Game engine model verified`.

- [ ] **Step 2: Run production build**

Run:

```bash
npm run build
```

Expected: Vite build succeeds with no sourcemap artifacts.

- [ ] **Step 3: Preview in in-app browser**

Run local dev server with `npm run dev`, open the app in the Codex in-app browser, and inspect:

- group result success
- group result failure
- at least one knockout report
- final champion settlement
- failure settlement

Check for overflow, overlapped text, long button labels, and broken report lines.

- [ ] **Step 4: Final validation**

Run:

```bash
openspec validate expand-dynamic-commentary-system --strict
```

Expected: change is valid.

- [ ] **Step 5: Commit any final fixes**

```bash
git add .
git commit -m "test: verify dynamic commentary system"
```
