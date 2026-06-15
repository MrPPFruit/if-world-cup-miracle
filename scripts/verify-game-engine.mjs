import assert from "node:assert/strict";
import { createBracketSlotMap, getFirstMeetingMatchId, getTeamSlot, isLegalFinalPair } from "../src/game/bracket.js";
import { ATTRIBUTE_KEYS, ZERO_LUCK_CHAMPION_ATTRIBUTES, championChance, expectedGoals, getChinaSkill, scoreMatch } from "../src/game/model.js";
import { createRng } from "../src/game/random.js";
import { FAILURE_STAGES } from "../src/game/runPlan.js";
import { simulateWorldCupRun } from "../src/game/simulation.js";
import { GROUPS, RANKING_SNAPSHOT, TEAMS, getTeamByCode } from "../src/game/teams.js";
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

console.log("Game engine model verified");
