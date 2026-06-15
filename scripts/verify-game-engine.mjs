import assert from "node:assert/strict";
import { ATTRIBUTE_KEYS, ZERO_LUCK_CHAMPION_ATTRIBUTES, championChance, expectedGoals, getChinaSkill, scoreMatch } from "../src/game/model.js";
import { createRng } from "../src/game/random.js";
import { GROUPS, RANKING_SNAPSHOT, TEAMS, getTeamByCode } from "../src/game/teams.js";
import { ZERO_LUCK_HIDDEN_CHAMPION_ROUTE, isZeroLuckHiddenChampionConfig } from "../src/game/zeroLuckRoute.js";

assert.equal(RANKING_SNAPSHOT.officialUpdate, "2026-06-11");
assert.equal(TEAMS.length, 48);
assert.equal(GROUPS.length, 12);
assert.equal(new Set(TEAMS.map((team) => team.code)).size, 48);
assert.deepEqual(Object.keys(ZERO_LUCK_CHAMPION_ATTRIBUTES), ATTRIBUTE_KEYS);
assert.equal(ZERO_LUCK_HIDDEN_CHAMPION_ROUTE.replacedTeamCode, "nl");
assert.equal(ZERO_LUCK_HIDDEN_CHAMPION_ROUTE.finalOpponentCode, "jp");
assert.equal(ZERO_LUCK_HIDDEN_CHAMPION_ROUTE.experienceChance, 0.03);
assert.equal(isZeroLuckHiddenChampionConfig(ZERO_LUCK_CHAMPION_ATTRIBUTES, "nl"), true);
assert.equal(isZeroLuckHiddenChampionConfig({ ...ZERO_LUCK_CHAMPION_ATTRIBUTES, defense: 8 }, "nl"), false);
assert.equal(isZeroLuckHiddenChampionConfig(ZERO_LUCK_CHAMPION_ATTRIBUTES, "jp"), false);

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

console.log("Game engine model verified");
