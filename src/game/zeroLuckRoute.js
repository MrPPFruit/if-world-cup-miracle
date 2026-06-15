import { attributesEqual, ZERO_LUCK_CHAMPION_ATTRIBUTES } from "./model.js";

export const ZERO_LUCK_HIDDEN_CHAMPION_ROUTE = {
  id: "zero-luck-china-vs-japan",
  experienceChance: 0.03,
  replacedTeamCode: "nl",
  replacementGroup: "F",
  attributes: ZERO_LUCK_CHAMPION_ATTRIBUTES,
  groupResults: [
    { opponentCode: "jp", chinaGoals: 0, opponentGoals: 0, tone: "iron-wall" },
    { opponentCode: "se", chinaGoals: 1, opponentGoals: 0, tone: "set-piece" },
    { opponentCode: "tn", chinaGoals: 1, opponentGoals: 1, tone: "survive" },
  ],
  knockoutResults: [
    { round: "R32", opponentCode: "us", chinaGoals: 1, opponentGoals: 0, tone: "defense" },
    { round: "R16", opponentCode: "br", chinaGoals: 2, opponentGoals: 1, tone: "counter" },
    { round: "QF", opponentCode: "es", chinaGoals: 1, opponentGoals: 1, penalties: [4, 3], tone: "keeper" },
    { round: "SF", opponentCode: "ar", chinaGoals: 2, opponentGoals: 2, penalties: [5, 4], tone: "stamina" },
    { round: "FINAL", opponentCode: "jp", chinaGoals: 1, opponentGoals: 0, tone: "fixed-final" },
  ],
  finalOpponentCode: "jp",
  championCharacterCode: "jp",
};

export function isZeroLuckHiddenChampionConfig(attributes, replacedTeamCode) {
  return (
    Number(attributes?.luck) === 0 &&
    replacedTeamCode === ZERO_LUCK_HIDDEN_CHAMPION_ROUTE.replacedTeamCode &&
    attributesEqual(attributes, ZERO_LUCK_HIDDEN_CHAMPION_ROUTE.attributes)
  );
}
