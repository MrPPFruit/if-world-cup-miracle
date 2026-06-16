import assert from "node:assert/strict";
import { COMPACT_COPY_LIMITS, GOAL_PLAYER_ROLES, PLAYER_LORE_LINES_BY_NAME, generateMatchCommentary } from "../src/game/commentary.js";
import { createBracketSlotMap, getFirstMeetingMatchId, getTeamSlot, isLegalFinalPair } from "../src/game/bracket.js";
import { ATTRIBUTE_KEYS, ZERO_LUCK_CHAMPION_ATTRIBUTES, championChance, expectedGoals, getChinaSkill, scoreMatch } from "../src/game/model.js";
import { createRng } from "../src/game/random.js";
import { FAILURE_STAGES } from "../src/game/runPlan.js";
import { simulateWorldCupRun } from "../src/game/simulation.js";
import { GROUPS, PLAYER_POSITIONS, PLAYER_PROFILES_BY_TEAM, PLAYER_ROLES, RANKING_SNAPSHOT, TEAMS, getTeamByCode } from "../src/game/teams.js";
import {
  ZERO_LUCK_ATTRIBUTE_PROFILES,
  ZERO_LUCK_HIDDEN_CHAMPION_ROUTE,
  ZERO_LUCK_HIDDEN_CHAMPION_ROUTES,
  getZeroLuckHiddenChampionRoute,
  isOriginalJapanFinalConfig,
  isZeroLuckHiddenChampionConfig,
} from "../src/game/zeroLuckRoute.js";

assert.equal(RANKING_SNAPSHOT.officialUpdate, "2026-06-11");
assert.equal(TEAMS.length, 48);
assert.equal(GROUPS.length, 12);
assert.equal(new Set(TEAMS.map((team) => team.code)).size, 48);
assert.equal(Object.keys(COMPACT_COPY_LIMITS).length, 7);
assert.deepEqual(Object.keys(ZERO_LUCK_CHAMPION_ATTRIBUTES), ATTRIBUTE_KEYS);
assert.equal(ZERO_LUCK_HIDDEN_CHAMPION_ROUTE.replacedTeamCode, "nl");
assert.equal(ZERO_LUCK_HIDDEN_CHAMPION_ROUTE.finalOpponentCode, "jp");
assert.equal(ZERO_LUCK_HIDDEN_CHAMPION_ROUTES.length, 9);
assert.equal(isZeroLuckHiddenChampionConfig(ZERO_LUCK_CHAMPION_ATTRIBUTES, "nl"), true);
assert.equal(isOriginalJapanFinalConfig(ZERO_LUCK_CHAMPION_ATTRIBUTES, "nl"), true);
assert.equal(getZeroLuckHiddenChampionRoute(ZERO_LUCK_CHAMPION_ATTRIBUTES, "nl").finalOpponentCode, "jp");
assert.equal(isZeroLuckHiddenChampionConfig(ZERO_LUCK_CHAMPION_ATTRIBUTES, "ht"), false);
assert.equal(getFirstMeetingMatchId("2A", "2B"), "M73");
assert.equal(getFirstMeetingMatchId("1C", "1J"), "M102");
assert.equal(isLegalFinalPair("1C", "1J"), false);
assert.equal(isLegalFinalPair("2C", "1J"), true);
assert.equal(isLegalFinalPair("1F", "2F"), true);

for (const route of ZERO_LUCK_HIDDEN_CHAMPION_ROUTES) {
  assert.equal(isLegalFinalPair(route.chinaSlot, route.finalOpponentSlot), true, route.id);
}

for (const group of GROUPS) {
  assert.equal(group.teams.length, 4, `${group.id} group should contain four teams`);
}

const allowedPartKinds = new Set(["text", "time", "team", "player", "system", "score"]);
const allowedPositions = new Set(PLAYER_POSITIONS);
const allowedRoles = new Set(PLAYER_ROLES);
const allowedGoalRoles = new Set(GOAL_PLAYER_ROLES);
const positionRoleMatrix = {
  goalkeeper: new Set(["save"]),
  defender: new Set(["block", "pace", "setPiece"]),
  midfielder: new Set(["control", "block", "setPiece", "finish"]),
  creator: new Set(["control", "setPiece", "finish", "pace"]),
  forward: new Set(["finish", "pace", "setPiece", "control"]),
};
const allTeamCodes = new Set([...TEAMS.map((team) => team.code), "cn"]);

for (const code of allTeamCodes) {
  const profiles = PLAYER_PROFILES_BY_TEAM[code];
  assert.ok(profiles?.length >= 1, `${code} should have player profiles`);
  for (const player of profiles) {
    assert.equal(typeof player.name, "string", `${code} player should have name`);
    assert.ok(player.name.length >= 2, `${code} player name should be readable`);
    assert.ok(allowedPositions.has(player.position), `${code}:${player.name} invalid position ${player.position}`);
    assert.ok(player.roles.length >= 1, `${code}:${player.name} should have roles`);
    for (const role of player.roles) {
      assert.ok(allowedRoles.has(role), `${code}:${player.name} invalid role ${role}`);
      assert.ok(positionRoleMatrix[player.position]?.has(role), `${code}:${player.name} incompatible ${player.position}/${role}`);
    }
  }
}

const allProfilesByName = new Map();
for (const profiles of Object.values(PLAYER_PROFILES_BY_TEAM)) {
  for (const player of profiles) {
    allProfilesByName.set(player.name, player);
  }
}

assert.ok(Object.keys(PLAYER_LORE_LINES_BY_NAME).length >= 12, "player lore should cover a meaningful star set");
assert.equal(allProfilesByName.has("格列兹曼"), false, "France player profiles should not include retired international Griezmann");
assert.ok(allProfilesByName.has("登贝莱"), "France player profiles should include Dembele for current lore");

for (const [playerName, rolePools] of Object.entries(PLAYER_LORE_LINES_BY_NAME)) {
  const profile = allProfilesByName.get(playerName);
  assert.ok(profile, `lore player missing profile: ${playerName}`);
  for (const [role, lines] of Object.entries(rolePools)) {
    assert.ok(profile.roles.includes(role), `${playerName} lore role not in player profile: ${role}`);
    assert.ok(Array.isArray(lines) && lines.length >= 1, `${playerName}:${role} should include lore lines`);
    for (const lineParts of lines) {
      assert.ok(Array.isArray(lineParts) && lineParts.length >= 1, `${playerName}:${role} lore line should be parts`);
      assert.ok(lineParts.join("").length >= 8, `${playerName}:${role} lore line too short`);
    }
  }
}

function assertRichLineParts(lines, label) {
  for (const line of lines) {
    assert.ok(line.id, `${label} line should have id`);
    assert.ok(Array.isArray(line.parts), `${label}:${line.id} parts should be array`);
    for (const part of line.parts) {
      assert.ok(allowedPartKinds.has(part.kind), `${label}:${line.id} invalid part kind ${part.kind}`);
      assert.equal(typeof part.text, "string", `${label}:${line.id} part text should be string`);
    }
  }
}

function assertMatchCommentary(run) {
  assertRichLineParts(run.transitionLines, `${run.id}:transition`);
  for (const round of run.knockoutRounds) {
    assertRichLineParts(round.commentary, `${run.id}:${round.key}`);
    const legalPlayerNames = new Set([
      ...PLAYER_PROFILES_BY_TEAM.cn.map((player) => player.name),
      ...(PLAYER_PROFILES_BY_TEAM[round.opponent.code] || []).map((player) => player.name),
    ]);
    for (const line of round.commentary) {
      for (const richPart of line.parts.filter((part) => part.kind === "player")) {
        assert.ok(legalPlayerNames.has(richPart.text), `${round.key} uses player outside match teams: ${richPart.text}`);
      }
      if (line.playerEvent) {
        const profile = (PLAYER_PROFILES_BY_TEAM[line.playerEvent.teamCode] || []).find((player) => player.name === line.playerEvent.name);
        assert.ok(profile, `${round.key}:${line.id} missing player event profile for ${line.playerEvent.name}`);
        assert.ok(profile.roles.includes(line.playerEvent.role), `${round.key}:${line.id} incompatible role ${line.playerEvent.role} for ${line.playerEvent.name}`);
        assert.ok(positionRoleMatrix[profile.position]?.has(line.playerEvent.role), `${round.key}:${line.id} incompatible event ${profile.position}/${line.playerEvent.role}`);
        if (line.id.includes("-goal-")) {
          assert.ok(allowedGoalRoles.has(line.playerEvent.role), `${round.key}:${line.id} goal line uses non-goal role ${line.playerEvent.role}`);
        }
      }
      if (line.id.endsWith("-final") || line.id.endsWith("-score")) {
        assert.deepEqual(line.scoreState, round.score, `${round.key}:${line.id} scoreState should match final score`);
      }
    }
  }
}

function assertCopyBudgets(run) {
  const copy = run.copy;
  assert.ok(copy, `${run.id} should include generated copy`);
  for (const [key, limit] of Object.entries(COMPACT_COPY_LIMITS)) {
    if (key === "groupMatchDetail") continue;
    assert.ok(copy[key].length <= limit, `${key} too long: ${copy[key]}`);
  }
  assert.equal(copy.groupMatchDetails?.length, 3, `${run.id} should include three group match details`);
  assert.equal(new Set(copy.groupMatchDetails).size, 3, `${run.id} group match details should be distinct`);
  for (const detail of copy.groupMatchDetails) {
    assert.ok(detail.length <= COMPACT_COPY_LIMITS.groupMatchDetail, `group match detail too long: ${detail}`);
  }
}

function normalizeVisibleText(text) {
  return String(text || "").replace(/\s+/g, " ").trim();
}

function collectGeneratedFragmentsFromLines(lines) {
  const fragments = [];
  for (const line of lines || []) {
    for (const item of line.parts || []) {
      if (!["text", "system"].includes(item.kind)) continue;
      const text = normalizeVisibleText(item.text);
      if (text.length >= 6) fragments.push(text);
    }
  }
  return fragments;
}

function assertNoDuplicateGeneratedCopy(run) {
  const fragments = [
    ...collectGeneratedFragmentsFromLines(run.transitionLines),
    ...run.knockoutRounds.flatMap((round) => collectGeneratedFragmentsFromLines(round.commentary)),
    run.copy.groupHeroTitle,
    run.copy.groupHeroNote,
    run.copy.groupMatchesNote,
    ...(run.copy.groupMatchDetails || []),
    run.copy.knockoutResultNote,
    run.copy.advancementHint,
    run.copy.settlementHeroNote,
    run.copy.pathFinalNote,
  ].map(normalizeVisibleText).filter((text) => text.length >= 6);
  const seen = new Set();
  for (const fragment of fragments) {
    assert.doesNotMatch(fragment, /\b(?:knockout|transition|run)-[A-Za-z0-9_-]+\b/, `${run.id} leaked internal id: ${fragment}`);
    assert.equal(seen.has(fragment), false, `${run.id} duplicate generated copy: ${fragment}`);
    seen.add(fragment);
  }
}

const highScoreFallbackLines = generateMatchCommentary({
  match: { id: "knockout-SF", chinaGoals: 12, opponentGoals: 0 },
  opponent: getTeamByCode("gb-eng"),
  attributes: { attack: 10, defense: 4, midfield: 6, stamina: 6, tactics: 4, luck: 8 },
  roundLabel: "半决赛",
  rng: createRng("verify-high-score-goal-fallback"),
});
const highScoreFragments = collectGeneratedFragmentsFromLines(highScoreFallbackLines);
assert.ok(highScoreFragments.length > 12, "high-score fallback sample should generate many narrative fragments");
for (const fragment of highScoreFragments) {
  assert.doesNotMatch(fragment, /\b(?:knockout|transition|run)-[A-Za-z0-9_-]+\b/, `high-score fallback leaked internal id: ${fragment}`);
}
assert.equal(
  highScoreFragments.filter((fragment) => fragment.includes("改写比分，记分牌只好继续加班")).length,
  0,
  "old repetitive goal fallback should not appear",
);

assert.ok(getTeamByCode("ar").baseRating > getTeamByCode("jp").baseRating);
assert.ok(getTeamByCode("jp").baseRating > getTeamByCode("ht").baseRating);
assert.ok(getChinaSkill(ZERO_LUCK_CHAMPION_ATTRIBUTES) > 75);
assert.equal(championChance(ZERO_LUCK_CHAMPION_ATTRIBUTES, getTeamByCode("nl")), 0);
assert.ok(championChance({ attack: 4, defense: 4, midfield: 4, stamina: 4, tactics: 4, luck: 10 }, getTeamByCode("nl")) < 0.8);
assert.ok(championChance({ attack: 5, defense: 5, midfield: 5, stamina: 5, tactics: 0, luck: 10 }, getTeamByCode("ht")) > 0.6);
assert.ok(expectedGoals(92, 62) > expectedGoals(80, 76));

let favoriteWins = 0;
let underdogWins = 0;
for (let index = 0; index < 300; index += 1) {
  const rng = createRng(`rating-sanity-${index}`);
  const [favorite, underdog] = scoreMatch(92, 62, rng);
  if (favorite > underdog) favoriteWins += 1;
  if (underdog > favorite) underdogWins += 1;
}

assert.ok(favoriteWins > underdogWins * 2, `favoriteWins=${favoriteWins}, underdogWins=${underdogWins}`);

let zeroLuckBuilds = 0;
let hiddenProfileBuilds = 0;
for (let attack = 0; attack <= 10; attack += 1) {
  for (let defense = 0; defense <= 10; defense += 1) {
    for (let midfield = 0; midfield <= 10; midfield += 1) {
      for (let stamina = 0; stamina <= 10; stamina += 1) {
        for (let tactics = 0; tactics <= 10; tactics += 1) {
          if (attack + defense + midfield + stamina + tactics !== 30) continue;
          zeroLuckBuilds += 1;
          const attributes = { attack, defense, midfield, stamina, tactics, luck: 0 };
          if (ZERO_LUCK_ATTRIBUTE_PROFILES.some((profile) => profile.matches(attributes))) {
            hiddenProfileBuilds += 1;
          }
        }
      }
    }
  }
}
const hiddenGlobalRate = (hiddenProfileBuilds * ZERO_LUCK_HIDDEN_CHAMPION_ROUTES.length) / (zeroLuckBuilds * TEAMS.length);
assert.equal(zeroLuckBuilds, 7051);
assert.equal(hiddenProfileBuilds, 1160);
assert.ok(hiddenGlobalRate > 0.03 && hiddenGlobalRate < 0.031, hiddenGlobalRate);

const zeroHiddenRun = simulateWorldCupRun({
  attributes: ZERO_LUCK_CHAMPION_ATTRIBUTES,
  selectedTeam: getTeamByCode("nl"),
  seed: "verify-zero-hidden",
});
assert.equal(zeroHiddenRun.result, "champion");
assert.equal(zeroHiddenRun.isZeroHidden, true);
assert.equal(zeroHiddenRun.settlement.defeatedOpponentCode, "jp");
assert.equal(zeroHiddenRun.knockoutRounds.at(-1).opponent.code, "jp");
const zeroHiddenSlots = createBracketSlotMap(zeroHiddenRun.groupResults);
assert.equal(getTeamSlot(zeroHiddenSlots, "cn"), "1F");
assert.equal(getTeamSlot(zeroHiddenSlots, "jp"), "2F");
assert.equal(getFirstMeetingMatchId(getTeamSlot(zeroHiddenSlots, "cn"), getTeamSlot(zeroHiddenSlots, "jp")), "M104");
assert.ok(
  zeroHiddenRun.knockoutRounds.at(-1).match.penalties?.[0] > zeroHiddenRun.knockoutRounds.at(-1).match.penalties?.[1] ||
    zeroHiddenRun.knockoutRounds.at(-1).match.chinaGoals > zeroHiddenRun.knockoutRounds.at(-1).match.opponentGoals,
);
assertMatchCommentary(zeroHiddenRun);
assertCopyBudgets(zeroHiddenRun);
assertNoDuplicateGeneratedCopy(zeroHiddenRun);

const zeroHiddenRunRepeat = simulateWorldCupRun({
  attributes: ZERO_LUCK_CHAMPION_ATTRIBUTES,
  selectedTeam: getTeamByCode("nl"),
  seed: "verify-zero-hidden",
});
assert.deepEqual(zeroHiddenRunRepeat.transitionLines, zeroHiddenRun.transitionLines);
assert.deepEqual(zeroHiddenRunRepeat.knockoutRounds.map((round) => round.commentary), zeroHiddenRun.knockoutRounds.map((round) => round.commentary));
assert.deepEqual(zeroHiddenRunRepeat.pathRows, zeroHiddenRun.pathRows);
assert.deepEqual(zeroHiddenRunRepeat.copy, zeroHiddenRun.copy);

for (const route of ZERO_LUCK_HIDDEN_CHAMPION_ROUTES) {
  const run = simulateWorldCupRun({
    attributes: ZERO_LUCK_CHAMPION_ATTRIBUTES,
    selectedTeam: getTeamByCode(route.replacedTeamCode),
    seed: `verify-zero-route-${route.id}`,
  });
  const slotMap = createBracketSlotMap(run.groupResults);
  assert.equal(run.result, "champion", route.id);
  assert.equal(run.settlement.defeatedOpponentCode, route.finalOpponentCode, route.id);
  assert.equal(getTeamSlot(slotMap, "cn"), route.chinaSlot, route.id);
  assert.equal(getTeamSlot(slotMap, route.finalOpponentCode), route.finalOpponentSlot, route.id);
  assert.equal(run.knockoutRounds.at(-1).bracketMatchId, "M104", route.id);
}

const zeroHiddenScoreSamples = new Set(
  Array.from({ length: 8 }, (_, index) => {
    const run = simulateWorldCupRun({
      attributes: ZERO_LUCK_CHAMPION_ATTRIBUTES,
      selectedTeam: getTeamByCode("nl"),
      seed: `verify-zero-score-variance-${index}`,
    });
    return run.pathRows.map((row) => (row.type === "match" ? `${row.label}:${row.score}` : "")).join("|");
  }),
);
assert.ok(zeroHiddenScoreSamples.size >= 3, `score sample size=${zeroHiddenScoreSamples.size}`);

const zeroWrongRun = simulateWorldCupRun({
  attributes: ZERO_LUCK_CHAMPION_ATTRIBUTES,
  selectedTeam: getTeamByCode("ht"),
  seed: "verify-zero-wrong-team",
});
assert.equal(zeroWrongRun.result, "failure");
assert.equal(zeroWrongRun.isZeroHidden, false);
assert.equal(zeroWrongRun.settlement.defeatedOpponentCode, null);
assert.ok(zeroWrongRun.settlement.failureReason);
assertMatchCommentary(zeroWrongRun);
assertCopyBudgets(zeroWrongRun);
assertNoDuplicateGeneratedCopy(zeroWrongRun);

const failureStageSamples = new Map();
for (let index = 0; index < 700; index += 1) {
  const run = simulateWorldCupRun({
    attributes: { attack: 5, defense: 5, midfield: 5, stamina: 5, tactics: 0, luck: 1 },
    selectedTeam: getTeamByCode("ht"),
    seed: `verify-failure-stage-${index}`,
  });
  if (run.runPlan.outcome === "failure" && !failureStageSamples.has(run.runPlan.failureStage)) {
    failureStageSamples.set(run.runPlan.failureStage, run);
  }
  if (failureStageSamples.size === FAILURE_STAGES.length) break;
}

assert.deepEqual([...failureStageSamples.keys()].sort(), [...FAILURE_STAGES].sort());
for (const [stage, run] of failureStageSamples) {
  assert.equal(run.result, "failure", stage);
  assert.equal(run.runPlan.failureStage, stage);
  if (stage === "GROUP") {
    assert.equal(run.knockoutRounds.length, 0, stage);
  } else {
    assert.equal(run.knockoutRounds.at(-1).key, stage, stage);
    assert.equal(run.knockoutRounds.at(-1).match.chinaGoals < run.knockoutRounds.at(-1).match.opponentGoals, true, stage);
  }
}

const luckyRun = simulateWorldCupRun({
  attributes: { attack: 5, defense: 5, midfield: 5, stamina: 5, tactics: 0, luck: 10 },
  selectedTeam: getTeamByCode("ht"),
  seed: "verify-lucky-run",
});
assert.equal(luckyRun.groupResults.length, 12);
assert.equal(luckyRun.chinaMatches.length, 3);
assert.ok(["champion", "failure"].includes(luckyRun.result));
assert.ok(luckyRun.transitionLines.length >= 7);
assertMatchCommentary(luckyRun);
assertCopyBudgets(luckyRun);
assertNoDuplicateGeneratedCopy(luckyRun);

for (let index = 0; index < 36; index += 1) {
  const team = TEAMS[index % TEAMS.length];
  const run = simulateWorldCupRun({
    attributes: {
      attack: index % 11,
      defense: (index * 2) % 11,
      midfield: (index * 3) % 11,
      stamina: (index * 5) % 11,
      tactics: (index * 7) % 11,
      luck: (index * 4) % 11,
    },
    selectedTeam: team,
    seed: `verify-copy-uniqueness-${index}`,
  });
  assertCopyBudgets(run);
  assertNoDuplicateGeneratedCopy(run);
}

const luckyRunRepeat = simulateWorldCupRun({
  attributes: { attack: 5, defense: 5, midfield: 5, stamina: 5, tactics: 0, luck: 10 },
  selectedTeam: getTeamByCode("ht"),
  seed: "verify-lucky-run",
});
assert.deepEqual(luckyRunRepeat.transitionLines, luckyRun.transitionLines);
assert.deepEqual(luckyRunRepeat.knockoutRounds.map((round) => round.commentary), luckyRun.knockoutRounds.map((round) => round.commentary));
assert.deepEqual(luckyRunRepeat.pathRows, luckyRun.pathRows);
assert.deepEqual(luckyRunRepeat.copy, luckyRun.copy);

console.log("Game engine model verified");
