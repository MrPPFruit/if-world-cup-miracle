import { poisson } from "./random.js";
import { getReplacementDifficulty } from "./teams.js";

export const CHINA_CODE = "cn";
export const ATTRIBUTE_KEYS = ["attack", "defense", "midfield", "stamina", "tactics", "luck"];
export const ZERO_LUCK_CHAMPION_ATTRIBUTES = {
  attack: 7,
  defense: 7,
  midfield: 6,
  stamina: 5,
  tactics: 5,
  luck: 0,
};

const LUCK_CHAMPION_CHANCE = [0, 0.02, 0.04, 0.07, 0.11, 0.17, 0.25, 0.36, 0.49, 0.62, 0.72];

export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function attributesEqual(left, right) {
  return ATTRIBUTE_KEYS.every((key) => Number(left?.[key]) === Number(right?.[key]));
}

export function getDominantAttribute(attributes) {
  return ATTRIBUTE_KEYS.filter((key) => key !== "luck").sort((a, b) => attributes[b] - attributes[a])[0] || "midfield";
}

export function getChinaSkill(attributes) {
  const skill =
    38 +
    attributes.attack * 1.9 +
    attributes.defense * 1.9 +
    attributes.midfield * 1.5 +
    attributes.stamina * 1.2 +
    attributes.tactics * 1.5;

  return clamp(skill, 35, 96);
}

export function getChinaMatchPower(attributes, context = {}) {
  let power = getChinaSkill(attributes);

  if (context.stage && context.stage !== "GROUP") {
    power += attributes.stamina * 0.25;
    power += attributes.tactics * 0.2;
  }

  if (context.opponentRating >= 84 && attributes.tactics >= 8) {
    power += 2;
  }

  return clamp(power, 35, 102);
}

export function championChance(attributes, replacedTeam) {
  const luck = clamp(Number(attributes.luck) || 0, 0, 10);
  if (luck === 0) return 0;

  const nonLuckAverage =
    (attributes.attack + attributes.defense + attributes.midfield + attributes.stamina + attributes.tactics) / 5;
  const skillModifier = clamp((nonLuckAverage - 5) * 0.026, -0.08, 0.08);
  const difficultyModifier = clamp(-getReplacementDifficulty(replacedTeam) * 0.01, -0.08, 0.05);

  return clamp(LUCK_CHAMPION_CHANCE[luck] + skillModifier + difficultyModifier, 0.01, luck === 10 ? 0.8 : 0.72);
}

export function expectedGoals(powerA, powerB) {
  return clamp(1.12 + (powerA - powerB) / 30, 0.25, 3.2);
}

export function scoreMatch(homePower, awayPower, rng) {
  const home = clamp(poisson(expectedGoals(homePower, awayPower), rng), 0, 7);
  const away = clamp(poisson(expectedGoals(awayPower, homePower), rng), 0, 7);
  return [home, away];
}
