import { championChance, clamp } from "./model.js";
import { chance } from "./random.js";

export const FAILURE_STAGES = ["GROUP", "R32", "R16", "QF", "SF", "FINAL"];

const FAILURE_STAGE_BASE_WEIGHTS = {
  GROUP: 26,
  R32: 30,
  R16: 18,
  QF: 11,
  SF: 8,
  FINAL: 7,
};

const FAILURE_STAGE_DEPTH = {
  GROUP: -1,
  R32: 0,
  R16: 1,
  QF: 2,
  SF: 3,
  FINAL: 4,
};

function getNonLuckAverage(attributes) {
  return (
    (Number(attributes.attack) || 0) +
    (Number(attributes.defense) || 0) +
    (Number(attributes.midfield) || 0) +
    (Number(attributes.stamina) || 0) +
    (Number(attributes.tactics) || 0)
  ) / 5;
}

function weightedPick(items, rng) {
  const total = items.reduce((sum, item) => sum + item.weight, 0);
  let cursor = rng.next() * total;
  for (const item of items) {
    cursor -= item.weight;
    if (cursor <= 0) return item.value;
  }
  return items.at(-1)?.value;
}

export function chooseFailureStage({ attributes, rng }) {
  const luck = clamp(Number(attributes.luck) || 0, 0, 10);
  const nonLuckAverage = getNonLuckAverage(attributes);
  const reachBias = clamp((luck * 0.075 + (nonLuckAverage - 4.5) * 0.12), 0, 1);
  const weightedStages = FAILURE_STAGES.map((stage) => {
    const depth = FAILURE_STAGE_DEPTH[stage];
    const earlyFactor = stage === "GROUP" ? clamp(1.28 - reachBias * 1.08, 0.18, 1.28) : 1;
    const lateFactor = stage === "GROUP" ? 1 : clamp(0.72 + reachBias * (0.48 + depth * 0.18), 0.72, 1.9);
    return {
      value: stage,
      weight: FAILURE_STAGE_BASE_WEIGHTS[stage] * Math.max(0.16, earlyFactor * lateFactor),
    };
  });

  return weightedPick(weightedStages, rng) || "GROUP";
}

export function createRunPlan({ attributes, replacedTeam, rng, zeroHiddenRoute }) {
  const championProbability = championChance(attributes, replacedTeam);
  const isChampion = Boolean(zeroHiddenRoute) || chance(championProbability, rng);
  const failureStage = isChampion ? null : chooseFailureStage({ attributes, rng });

  return {
    outcome: isChampion ? "champion" : "failure",
    failureStage,
    championProbability,
    zeroHiddenRouteId: zeroHiddenRoute?.id || null,
    chinaSlot: zeroHiddenRoute?.chinaSlot || null,
    finalOpponentCode: zeroHiddenRoute?.finalOpponentCode || null,
    finalOpponentSlot: zeroHiddenRoute?.finalOpponentSlot || null,
  };
}

export function shouldForceGroupAdvancement(runPlan) {
  return runPlan.outcome === "champion" || runPlan.failureStage !== "GROUP";
}

export function shouldChinaWinKnockoutRound(runPlan, roundKey) {
  if (runPlan.outcome === "champion") return true;
  return FAILURE_STAGE_DEPTH[roundKey] < FAILURE_STAGE_DEPTH[runPlan.failureStage];
}
