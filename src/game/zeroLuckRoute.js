import { attributesEqual, ZERO_LUCK_CHAMPION_ATTRIBUTES } from "./model.js";

const build = (attributes) => ({
  attack: Number(attributes?.attack) || 0,
  defense: Number(attributes?.defense) || 0,
  midfield: Number(attributes?.midfield) || 0,
  stamina: Number(attributes?.stamina) || 0,
  tactics: Number(attributes?.tactics) || 0,
});

const matchesJapanFinalMainLine = (attributes) => {
  if (Number(attributes?.luck) !== 0) return false;
  const b = build(attributes);
  return b.attack >= 5 && b.defense >= 5 && b.midfield >= 3 && b.stamina >= 3 && b.tactics >= 3;
};

export const ZERO_LUCK_ATTRIBUTE_PROFILES = [
  {
    id: "balanced-knife-edge",
    name: "均衡钢丝流",
    matches: (attributes) => {
      const b = build(attributes);
      const values = [b.attack, b.defense, b.midfield, b.stamina, b.tactics];
      return Math.max(...values) <= 8 && Math.min(...values) >= 4 && b.attack >= 5 && b.defense >= 5;
    },
  },
  {
    id: "iron-wall",
    name: "铁桶苟命流",
    matches: (attributes) => {
      const b = build(attributes);
      return b.defense >= 8 && b.tactics >= 4 && b.stamina >= 5 && b.attack >= 3 && b.midfield >= 3;
    },
  },
  {
    id: "counter-punch",
    name: "偷鸡反击流",
    matches: (attributes) => {
      const b = build(attributes);
      return b.attack >= 8 && b.defense >= 5 && b.stamina >= 5 && b.tactics >= 3 && b.midfield >= 3;
    },
  },
  {
    id: "midfield-lock",
    name: "中场锁门流",
    matches: (attributes) => {
      const b = build(attributes);
      return b.midfield >= 8 && b.tactics >= 5 && b.defense >= 4 && b.attack >= 3 && b.stamina >= 4;
    },
  },
  {
    id: "late-stamina",
    name: "补时硬跑流",
    matches: (attributes) => {
      const b = build(attributes);
      return b.stamina >= 8 && b.defense >= 5 && b.attack >= 3 && b.midfield >= 3 && b.tactics >= 4;
    },
  },
  {
    id: "tactics-chaos",
    name: "战术整活流",
    matches: (attributes) => {
      const b = build(attributes);
      return b.tactics >= 8 && b.defense >= 4 && b.midfield >= 4 && b.attack >= 3 && b.stamina >= 3;
    },
  },
];

const match = (round, opponentCode, chinaGoals, opponentGoals, tone, penalties = null) => ({
  round,
  opponentCode,
  chinaGoals,
  opponentGoals,
  tone,
  ...(penalties ? { penalties } : {}),
});

const route = ({
  id,
  replacedTeamCode,
  chinaSlot,
  finalOpponentCode,
  finalOpponentSlot,
  knockoutResults,
  groupResults = [],
  groupFixtureResults = [],
}) => ({
  id,
  replacedTeamCode,
  chinaSlot,
  finalOpponentCode,
  finalOpponentSlot,
  championCharacterCode: finalOpponentCode,
  groupResults,
  groupFixtureResults,
  knockoutResults,
});

export const ZERO_LUCK_HIDDEN_CHAMPION_ROUTES = [
  route({
    id: "zero-luck-china-vs-japan",
    replacedTeamCode: "nl",
    chinaSlot: "1F",
    finalOpponentCode: "jp",
    finalOpponentSlot: "2F",
    groupResults: [
      { opponentCode: "jp", chinaGoals: 0, opponentGoals: 0, tone: "iron-wall" },
      { opponentCode: "se", chinaGoals: 1, opponentGoals: 0, tone: "set-piece" },
      { opponentCode: "tn", chinaGoals: 1, opponentGoals: 1, tone: "survive" },
    ],
    groupFixtureResults: [
      { homeCode: "se", awayCode: "tn", homeGoals: 0, awayGoals: 0 },
      { homeCode: "tn", awayCode: "jp", homeGoals: 0, awayGoals: 0 },
      { homeCode: "jp", awayCode: "se", homeGoals: 1, awayGoals: 0 },
    ],
    knockoutResults: [
      match("R32", "us", 1, 0, "defense"),
      match("R16", "br", 2, 1, "counter"),
      match("QF", "es", 1, 1, "keeper", [4, 3]),
      match("SF", "ar", 2, 2, "stamina", [5, 4]),
      match("FINAL", "jp", 1, 0, "fixed-final"),
    ],
  }),
  route({
    id: "zero-luck-brazil-final-argentina",
    replacedTeamCode: "br",
    chinaSlot: "1C",
    finalOpponentCode: "ar",
    finalOpponentSlot: "2J",
    knockoutResults: [
      match("R32", "mx", 1, 0, "survive"),
      match("R16", "de", 1, 1, "keeper", [4, 2]),
      match("QF", "es", 2, 1, "counter"),
      match("SF", "fr", 1, 0, "iron-wall"),
      match("FINAL", "ar", 2, 2, "fixed-final", [5, 4]),
    ],
  }),
  route({
    id: "zero-luck-france-final-england",
    replacedTeamCode: "fr",
    chinaSlot: "1I",
    finalOpponentCode: "gb-eng",
    finalOpponentSlot: "1L",
    knockoutResults: [
      match("R32", "kr", 1, 0, "stamina"),
      match("R16", "uy", 2, 1, "counter"),
      match("QF", "pt", 1, 1, "keeper", [3, 2]),
      match("SF", "ar", 1, 0, "iron-wall"),
      match("FINAL", "gb-eng", 2, 1, "fixed-final"),
    ],
  }),
  route({
    id: "zero-luck-argentina-final-brazil",
    replacedTeamCode: "ar",
    chinaSlot: "1J",
    finalOpponentCode: "br",
    finalOpponentSlot: "2C",
    knockoutResults: [
      match("R32", "us", 1, 0, "defense"),
      match("R16", "nl", 1, 1, "keeper", [4, 3]),
      match("QF", "de", 2, 1, "counter"),
      match("SF", "es", 1, 0, "tactics"),
      match("FINAL", "br", 3, 2, "fixed-final"),
    ],
  }),
  route({
    id: "zero-luck-spain-final-germany",
    replacedTeamCode: "es",
    chinaSlot: "1H",
    finalOpponentCode: "de",
    finalOpponentSlot: "2E",
    knockoutResults: [
      match("R32", "ma", 1, 0, "midfield"),
      match("R16", "co", 2, 1, "counter"),
      match("QF", "pt", 1, 0, "iron-wall"),
      match("SF", "fr", 1, 1, "keeper", [5, 3]),
      match("FINAL", "de", 1, 0, "fixed-final"),
    ],
  }),
  route({
    id: "zero-luck-germany-final-france",
    replacedTeamCode: "de",
    chinaSlot: "1E",
    finalOpponentCode: "fr",
    finalOpponentSlot: "2I",
    knockoutResults: [
      match("R32", "jp", 1, 0, "survive"),
      match("R16", "be", 2, 1, "counter"),
      match("QF", "gb-eng", 1, 1, "keeper", [4, 3]),
      match("SF", "br", 1, 0, "iron-wall"),
      match("FINAL", "fr", 2, 1, "fixed-final"),
    ],
  }),
  route({
    id: "zero-luck-portugal-final-spain",
    replacedTeamCode: "pt",
    chinaSlot: "1K",
    finalOpponentCode: "es",
    finalOpponentSlot: "1H",
    knockoutResults: [
      match("R32", "ch", 1, 0, "defense"),
      match("R16", "hr", 1, 1, "keeper", [4, 2]),
      match("QF", "ar", 2, 1, "counter"),
      match("SF", "gb-eng", 1, 0, "tactics"),
      match("FINAL", "es", 1, 1, "fixed-final", [5, 4]),
    ],
  }),
  route({
    id: "zero-luck-england-final-argentina",
    replacedTeamCode: "gb-eng",
    chinaSlot: "1L",
    finalOpponentCode: "ar",
    finalOpponentSlot: "2J",
    knockoutResults: [
      match("R32", "eg", 1, 0, "survive"),
      match("R16", "nl", 2, 1, "counter"),
      match("QF", "fr", 1, 0, "iron-wall"),
      match("SF", "br", 1, 1, "keeper", [4, 3]),
      match("FINAL", "ar", 2, 1, "fixed-final"),
    ],
  }),
  route({
    id: "zero-luck-japan-final-korea",
    replacedTeamCode: "jp",
    chinaSlot: "1F",
    finalOpponentCode: "kr",
    finalOpponentSlot: "1A",
    knockoutResults: [
      match("R32", "au", 1, 0, "stamina"),
      match("R16", "us", 1, 1, "keeper", [3, 1]),
      match("QF", "br", 2, 1, "counter"),
      match("SF", "fr", 1, 0, "iron-wall"),
      match("FINAL", "kr", 1, 0, "fixed-final"),
    ],
  }),
];

export const ZERO_LUCK_HIDDEN_CHAMPION_ROUTE = ZERO_LUCK_HIDDEN_CHAMPION_ROUTES[0];

export function getZeroLuckMatchedProfile(attributes) {
  if (Number(attributes?.luck) !== 0) return null;
  return ZERO_LUCK_ATTRIBUTE_PROFILES.find((profile) => profile.matches(attributes)) || null;
}

export function getZeroLuckHiddenChampionRoute(attributes, replacedTeamCode) {
  const isJapanFinalMainLine = replacedTeamCode === ZERO_LUCK_HIDDEN_CHAMPION_ROUTE.replacedTeamCode && matchesJapanFinalMainLine(attributes);
  const profile = getZeroLuckMatchedProfile(attributes) || (isJapanFinalMainLine ? ZERO_LUCK_ATTRIBUTE_PROFILES[0] : null);
  if (!profile) return null;
  const routeMatch = ZERO_LUCK_HIDDEN_CHAMPION_ROUTES.find((item) => item.replacedTeamCode === replacedTeamCode);
  if (!routeMatch) return null;
  return { ...routeMatch, matchedProfile: profile };
}

export function isZeroLuckHiddenChampionConfig(attributes, replacedTeamCode) {
  return Boolean(getZeroLuckHiddenChampionRoute(attributes, replacedTeamCode));
}

export function isOriginalJapanFinalConfig(attributes, replacedTeamCode) {
  return (
    Number(attributes?.luck) === 0 &&
    replacedTeamCode === ZERO_LUCK_HIDDEN_CHAMPION_ROUTE.replacedTeamCode &&
    attributesEqual(attributes, ZERO_LUCK_CHAMPION_ATTRIBUTES)
  );
}
