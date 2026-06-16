import { createCommentaryLedger, generateMatchCommentary, generateRunCopy, generateTransitionCommentary, getFailureReason, makeScoreText } from "./commentary.js";
import {
  BRACKET_MATCHES,
  KNOCKOUT_ROUND_ORDER,
  createBracketSlotMap,
  getParentMatchId,
  getSlotGroup,
  getSlotRank,
  getSlotTeam,
  getTeamSlot,
  isLegalFinalPair,
} from "./bracket.js";
import { CHINA_CODE, getChinaMatchPower, scoreMatch } from "./model.js";
import { createRng, stableHash } from "./random.js";
import { createRunPlan, shouldChinaWinKnockoutRound, shouldForceGroupAdvancement } from "./runPlan.js";
import { CHINA_TEAM, GROUP_MATCH_PATTERN, GROUPS, TEAM_BY_CODE, getTeamByCode } from "./teams.js";
import { getZeroLuckHiddenChampionRoute } from "./zeroLuckRoute.js";

const ROUND_META = [
  { key: "R32", label: "32强", title: "32 强战", status: "晋级 16 强", next: "进入 16 强  梦继续做", stageTitle: "16 强席位" },
  { key: "R16", label: "16强", title: "16 强战", status: "晋级 8 强", next: "进入 8 强  这集还没完", stageTitle: "8 强席位" },
  { key: "QF", label: "8强", title: "1/4 决赛", status: "晋级半决赛", next: "进入半决赛  别眨眼", stageTitle: "半决赛席位" },
  { key: "SF", label: "半决赛", title: "半决赛", status: "晋级决赛", next: "进入决赛  宇宙屏住呼吸", stageTitle: "决赛席位" },
  { key: "FINAL", label: "决赛", title: "决赛", status: "世界杯冠军", next: "查看本局结算", stageTitle: "冠军现场" },
];

const ROUND_SIZES = [16, 8, 4, 2, 2];
const ROUND_META_BY_KEY = Object.fromEntries(ROUND_META.map((meta, index) => [meta.key, { ...meta, index }]));
const BRACKET_MATCH_IDS_BY_ROUND = Object.fromEntries(
  KNOCKOUT_ROUND_ORDER.map((round) => [
    round,
    Object.entries(BRACKET_MATCHES)
      .filter(([, match]) => match.round === round)
      .map(([matchId]) => matchId),
  ]),
);

function chinaForSlot(replacedTeam) {
  return {
    ...CHINA_TEAM,
    group: replacedTeam.group,
    slot: replacedTeam.slot,
    replacedTeamCode: replacedTeam.code,
    replacedTeamName: replacedTeam.name,
  };
}

function getPlayableGroups(replacedTeam) {
  return GROUPS.map((group) => {
    if (group.id !== replacedTeam.group) return group;
    return {
      ...group,
      teams: group.teams.map((team) => (team.code === replacedTeam.code ? chinaForSlot(replacedTeam) : team)),
    };
  });
}

function createStanding(team) {
  return { team, played: 0, wins: 0, draws: 0, losses: 0, gf: 0, ga: 0, gd: 0, points: 0 };
}

function recordStanding(standing, goalsFor, goalsAgainst) {
  standing.played += 1;
  standing.gf += goalsFor;
  standing.ga += goalsAgainst;
  standing.gd = standing.gf - standing.ga;
  if (goalsFor > goalsAgainst) {
    standing.wins += 1;
    standing.points += 3;
  } else if (goalsFor === goalsAgainst) {
    standing.draws += 1;
    standing.points += 1;
  } else {
    standing.losses += 1;
  }
}

function sortStandings(rows) {
  return [...rows].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.gd !== a.gd) return b.gd - a.gd;
    if (b.gf !== a.gf) return b.gf - a.gf;
    return b.team.baseRating - a.team.baseRating;
  });
}

function createGroupMatch({ home, away, attributes, stage, rng }) {
  const homePower = home.code === CHINA_CODE ? getChinaMatchPower(attributes, { stage, opponentRating: away.baseRating }) : home.baseRating;
  const awayPower = away.code === CHINA_CODE ? getChinaMatchPower(attributes, { stage, opponentRating: home.baseRating }) : away.baseRating;
  const [homeGoals, awayGoals] = scoreMatch(homePower, awayPower, rng);

  return {
    id: `${home.group}-${home.slot}-${away.slot}`,
    home,
    away,
    homeGoals,
    awayGoals,
  };
}

function getFixedOutcome(chinaGoals, opponentGoals, penalties = null) {
  if (penalties) return penalties[0] > penalties[1] ? "win" : "loss";
  if (chinaGoals > opponentGoals) return "win";
  if (chinaGoals < opponentGoals) return "loss";
  return "draw";
}

function createForcedScore({ chinaPower, opponentPower, rng, outcome, allowPenalties = false }) {
  if (allowPenalties && outcome !== "draw" && rng.next() < 0.28) {
    const drawGoals = rng.int(0, 2);
    const winnerPenalty = rng.int(3, 5);
    const loserPenalty = rng.int(Math.max(0, winnerPenalty - 3), winnerPenalty - 1);
    return {
      chinaGoals: drawGoals,
      opponentGoals: drawGoals,
      penalties: outcome === "win" ? [winnerPenalty, loserPenalty] : [loserPenalty, winnerPenalty],
    };
  }

  let [chinaGoals, opponentGoals] = scoreMatch(chinaPower, opponentPower, rng);

  if (outcome === "win" && chinaGoals <= opponentGoals) {
    opponentGoals = Math.min(4, opponentGoals);
    chinaGoals = opponentGoals + rng.int(1, Math.min(2, 5 - opponentGoals));
  }
  if (outcome === "loss" && chinaGoals >= opponentGoals) {
    chinaGoals = Math.min(4, chinaGoals);
    opponentGoals = chinaGoals + rng.int(1, Math.min(2, 5 - chinaGoals));
  }
  if (outcome === "draw") {
    const drawGoals = Math.min(3, Math.max(0, Math.round((chinaGoals + opponentGoals) / 2)));
    chinaGoals = drawGoals;
    opponentGoals = drawGoals;
  }

  return { chinaGoals, opponentGoals };
}

function getFixedZeroGroupMatch(home, away, attributes, rng, zeroHiddenRoute) {
  const chinaIsHome = home.code === CHINA_CODE;
  const opponent = chinaIsHome ? away : home;
  const fixed = zeroHiddenRoute?.groupResults?.find((match) => match.opponentCode === opponent.code);
  if (!fixed) return null;
  const chinaPower = getChinaMatchPower(attributes, { stage: "GROUP", opponentRating: opponent.baseRating });
  const score = createForcedScore({
    chinaPower,
    opponentPower: opponent.baseRating,
    rng,
    outcome: getFixedOutcome(fixed.chinaGoals, fixed.opponentGoals),
  });

  return {
    id: `zero-group-${opponent.code}`,
    home,
    away,
    homeGoals: chinaIsHome ? score.chinaGoals : score.opponentGoals,
    awayGoals: chinaIsHome ? score.opponentGoals : score.chinaGoals,
    tone: fixed.tone,
  };
}

function createPlannedChinaGroupMatch({ home, away, attributes, rng, index, runPlan }) {
  const chinaIsHome = home.code === CHINA_CODE || away.code === CHINA_CODE;
  if (!chinaIsHome) return createGroupMatch({ home, away, attributes, stage: "GROUP", rng });

  const chinaHome = home.code === CHINA_CODE;
  const opponent = chinaHome ? away : home;
  const plans =
    runPlan.failureStage === "GROUP"
      ? [
          { outcome: "loss", tone: "late-collapse" },
          { outcome: "draw", tone: "survive" },
          { outcome: "loss", tone: "group-exit" },
        ]
      : [
          { outcome: "draw", tone: "survive" },
          { outcome: "win", tone: "counter" },
          { outcome: "win", tone: "defense" },
        ];
  const plan = plans[index % plans.length];
  const chinaPower = getChinaMatchPower(attributes, { stage: "GROUP", opponentRating: opponent.baseRating });
  const score = createForcedScore({
    chinaPower,
    opponentPower: opponent.baseRating,
    rng,
    outcome: plan.outcome,
  });

  return {
    id: `planned-group-${opponent.code}`,
    home,
    away,
    homeGoals: chinaHome ? score.chinaGoals : score.opponentGoals,
    awayGoals: chinaHome ? score.opponentGoals : score.chinaGoals,
    tone: plan.tone,
  };
}

function simulateGroup(group, { attributes, rng, replacedTeam, runPlan, zeroHiddenRoute }) {
  const standings = new Map(group.teams.map((team) => [team.code, createStanding(team)]));
  const matches = [];
  let chinaMatchIndex = 0;

  for (const [homeSlot, awaySlot] of GROUP_MATCH_PATTERN) {
    const home = group.teams.find((team) => team.slot === homeSlot);
    const away = group.teams.find((team) => team.slot === awaySlot);
    const hasChina = home.code === CHINA_CODE || away.code === CHINA_CODE;
    let match = null;

    if (group.id === replacedTeam.group && hasChina && zeroHiddenRoute) {
      match = getFixedZeroGroupMatch(home, away, attributes, rng, zeroHiddenRoute);
    }
    if (!match && group.id === replacedTeam.group && hasChina) {
      match = createPlannedChinaGroupMatch({ home, away, attributes, rng, index: chinaMatchIndex, runPlan });
    }
    if (!match) {
      match = createGroupMatch({ home, away, attributes, stage: "GROUP", rng });
    }

    if (hasChina) chinaMatchIndex += 1;
    matches.push(match);
    recordStanding(standings.get(home.code), match.homeGoals, match.awayGoals);
    recordStanding(standings.get(away.code), match.awayGoals, match.homeGoals);
  }

  return {
    id: group.id,
    teams: group.teams,
    matches,
    standings: sortStandings(Array.from(standings.values())),
  };
}

function getAdvancers(groupResults) {
  const firstTwo = groupResults.flatMap((group) => group.standings.slice(0, 2));
  const thirds = groupResults.map((group) => group.standings[2]).sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.gd !== a.gd) return b.gd - a.gd;
    if (b.gf !== a.gf) return b.gf - a.gf;
    return b.team.baseRating - a.team.baseRating;
  });
  return [...firstTwo, ...thirds.slice(0, 8)].map((row) => row.team);
}

function forceStandingSlots(groupResults, assignments) {
  const assignmentsByGroup = new Map();
  for (const assignment of assignments.filter(Boolean)) {
    const groupId = getSlotGroup(assignment.slot);
    if (!assignmentsByGroup.has(groupId)) assignmentsByGroup.set(groupId, []);
    assignmentsByGroup.get(groupId).push({ ...assignment, rank: getSlotRank(assignment.slot) });
  }

  return groupResults.map((group) => {
    const groupAssignments = assignmentsByGroup.get(group.id);
    if (!groupAssignments?.length) return group;

    const ordered = Array(group.standings.length).fill(null);
    const assignedCodes = new Set();
    for (const assignment of groupAssignments) {
      const row = group.standings.find((standing) => standing.team.code === assignment.teamCode);
      if (!row) continue;
      ordered[assignment.rank - 1] = row;
      assignedCodes.add(assignment.teamCode);
    }

    const rest = group.standings.filter((row) => !assignedCodes.has(row.team.code));
    let restIndex = 0;
    const standings = ordered.map((row) => row || rest[restIndex++]).filter(Boolean);
    return { ...group, standings };
  });
}

function prepareGroupResultsForKnockout({ groupResults, replacedTeam, runPlan, zeroHiddenRoute }) {
  if (zeroHiddenRoute) {
    return forceStandingSlots(groupResults, [
      { teamCode: CHINA_CODE, slot: zeroHiddenRoute.chinaSlot },
      { teamCode: zeroHiddenRoute.finalOpponentCode, slot: zeroHiddenRoute.finalOpponentSlot },
    ]);
  }

  if (!shouldForceGroupAdvancement(runPlan)) return groupResults;

  const chinaGroup = groupResults.find((group) => group.id === replacedTeam.group);
  const chinaRank = chinaGroup?.standings.findIndex((row) => row.team.code === CHINA_CODE) + 1;
  const chinaSlot = chinaRank && chinaRank <= 2 ? `${chinaRank}${replacedTeam.group}` : `2${replacedTeam.group}`;
  return forceStandingSlots(groupResults, [{ teamCode: CHINA_CODE, slot: chinaSlot }]);
}

function rankTeamsForKnockout(teams) {
  return [...teams].sort((a, b) => {
    if (a.code === CHINA_CODE) return -1;
    if (b.code === CHINA_CODE) return 1;
    return b.baseRating - a.baseRating;
  });
}

function createKnockoutMatch({ roundMeta, opponent, attributes, rng, forceWin, fixed }) {
  if (fixed) {
    const chinaPower = getChinaMatchPower(attributes, { stage: roundMeta.key, opponentRating: opponent.baseRating });
    const score = createForcedScore({
      chinaPower,
      opponentPower: opponent.baseRating,
      rng,
      outcome: getFixedOutcome(fixed.chinaGoals, fixed.opponentGoals, fixed.penalties),
      allowPenalties: true,
    });
    const match = {
      id: `zero-${roundMeta.key}`,
      round: roundMeta.key,
      label: roundMeta.label,
      opponent,
      chinaGoals: score.chinaGoals,
      opponentGoals: score.opponentGoals,
      penalties: score.penalties,
      tone: fixed.tone,
    };
    return match;
  }

  const chinaPower = getChinaMatchPower(attributes, { stage: roundMeta.key, opponentRating: opponent.baseRating });
  let [chinaGoals, opponentGoals] = scoreMatch(chinaPower, opponent.baseRating, rng);

  if (forceWin && chinaGoals <= opponentGoals) {
    chinaGoals = opponentGoals + 1;
  }
  if (!forceWin && chinaGoals >= opponentGoals) {
    opponentGoals = chinaGoals + 1;
  }

  return {
    id: `knockout-${roundMeta.key}`,
    round: roundMeta.key,
    label: roundMeta.label,
    opponent,
    chinaGoals,
    opponentGoals,
    tone: forceWin ? "win" : "failure",
  };
}

function createAdvancementStage({ roundIndex, remaining, nextOpponent, finalOpponent, result }) {
  const meta = ROUND_META[roundIndex];
  const size = ROUND_SIZES[roundIndex];
  const stageTeams = rankTeamsForKnockout([CHINA_TEAM, ...remaining]).slice(0, size);
  const nextCode = nextOpponent?.code;
  const isFinalComplete = roundIndex === ROUND_META.length - 1 && result === "champion";

  if (isFinalComplete) {
    return {
      minProgress: roundIndex + 1,
      title: meta.stageTitle,
      hint: "本局准备结算",
      podium: {
        champion: CHINA_TEAM,
        runnerUp: finalOpponent,
        third: remaining.find((team) => team.code !== finalOpponent.code) || getTeamByCode("ar"),
      },
      teams: [CHINA_TEAM, finalOpponent],
    };
  }

  return {
    minProgress: roundIndex + 1,
    title: meta.stageTitle,
    hint: nextOpponent ? `下一轮 中国队碰${nextOpponent.name}` : result === "failure" ? "本局准备结算" : "等待结算",
    nextCode,
    teams: stageTeams.some((team) => team.code === CHINA_CODE) ? stageTeams : [CHINA_TEAM, ...stageTeams.slice(1)],
  };
}

function getNeutralWinner(leftTeam, rightTeam, rng) {
  if (!leftTeam) return rightTeam;
  if (!rightTeam) return leftTeam;
  const ratingGap = leftTeam.baseRating - rightTeam.baseRating;
  const leftWinChance = Math.max(0.18, Math.min(0.82, 0.5 + ratingGap / 90));
  return rng.next() < leftWinChance ? leftTeam : rightTeam;
}

function getBracketMatchTeams(matchId, slotMap, winners) {
  const bracketMatch = BRACKET_MATCHES[matchId];
  if (bracketMatch.slots) {
    return bracketMatch.slots.map((slot) => getSlotTeam(slotMap, slot));
  }
  return bracketMatch.children.map((childMatchId) => winners.get(childMatchId));
}

function chooseBracketWinner({ leftTeam, rightTeam, roundKey, runPlan, zeroHiddenRoute, rng }) {
  const chinaTeam = [leftTeam, rightTeam].find((team) => team?.code === CHINA_CODE);
  if (chinaTeam) {
    const chinaWins = shouldChinaWinKnockoutRound(runPlan, roundKey);
    return chinaWins ? chinaTeam : leftTeam?.code === CHINA_CODE ? rightTeam : leftTeam;
  }

  if (zeroHiddenRoute) {
    const finalOpponent = [leftTeam, rightTeam].find((team) => team?.code === zeroHiddenRoute.finalOpponentCode);
    if (finalOpponent) return finalOpponent;
  }

  return getNeutralWinner(leftTeam, rightTeam, rng);
}

function getNextChinaOpponent(matchId, winners) {
  const parentMatchId = getParentMatchId(matchId);
  if (!parentMatchId) return null;
  const siblingMatchId = BRACKET_MATCHES[parentMatchId].children.find((childMatchId) => childMatchId !== matchId);
  return winners.get(siblingMatchId) || null;
}

function simulateKnockout({ attributes, rng, groupResults, advancers, runPlan, zeroHiddenRoute, commentaryLedger = null, commentarySeed = "commentary" }) {
  if (!advancers.some((team) => team.code === CHINA_CODE)) {
    return { rounds: [], advancementStages: [], finalMatch: null, result: "failure", failureReason: "groupExit" };
  }

  if (zeroHiddenRoute && !isLegalFinalPair(zeroHiddenRoute.chinaSlot, zeroHiddenRoute.finalOpponentSlot)) {
    return { rounds: [], advancementStages: [], finalMatch: null, result: "failure", failureReason: "invalidBracketRoute" };
  }

  const slotMap = createBracketSlotMap(groupResults);
  const chinaSlot = getTeamSlot(slotMap, CHINA_CODE);
  if (!chinaSlot) {
    return { rounds: [], advancementStages: [], finalMatch: null, result: "failure", failureReason: "groupExit" };
  }

  const rounds = [];
  const stages = [];
  const winners = new Map();
  const semiFinalLosers = [];
  let result = "champion";
  let failureReason = null;

  for (const roundKey of KNOCKOUT_ROUND_ORDER) {
    const meta = ROUND_META_BY_KEY[roundKey];
    const roundMatchIds = BRACKET_MATCH_IDS_BY_ROUND[roundKey];
    let chinaMatchRecord = null;

    for (const matchId of roundMatchIds) {
      const [leftTeam, rightTeam] = getBracketMatchTeams(matchId, slotMap, winners);
      const winner = chooseBracketWinner({
        leftTeam,
        rightTeam,
        roundKey,
        runPlan,
        zeroHiddenRoute,
        rng,
      });
      const loser = winner?.code === leftTeam?.code ? rightTeam : leftTeam;
      winners.set(matchId, winner);

      if (roundKey === "SF" && loser) semiFinalLosers.push(loser);
      if (leftTeam?.code !== CHINA_CODE && rightTeam?.code !== CHINA_CODE) continue;

      const opponent = leftTeam?.code === CHINA_CODE ? rightTeam : leftTeam;
      const willWinRound = winner?.code === CHINA_CODE;
      const fixed = zeroHiddenRoute?.knockoutResults?.find((item) => item.round === roundKey) || null;
      const match = createKnockoutMatch({ roundMeta: meta, opponent, attributes, rng, forceWin: willWinRound, fixed });
      chinaMatchRecord = {
        matchId,
        opponent,
        willWinRound,
        round: {
          ...meta,
          bracketMatchId: matchId,
          chinaSlot,
          status: willWinRound ? meta.status : `止步 ${meta.label}`,
          next: willWinRound ? meta.next : "查看本局结算",
          opponent,
          score: [match.chinaGoals, match.opponentGoals],
          penalties: match.penalties,
          match,
          commentary: generateMatchCommentary({
            match,
            opponent,
            attributes,
            roundLabel: meta.label,
            rng: createRng(`${commentarySeed}:${roundKey}:${opponent.code}:${match.chinaGoals}:${match.opponentGoals}:${JSON.stringify(attributes)}`),
            ledger: commentaryLedger,
          }),
        },
      };
    }

    if (!chinaMatchRecord) continue;

    rounds.push(chinaMatchRecord.round);
    const aliveTeams = roundMatchIds.map((matchId) => winners.get(matchId)).filter(Boolean);
    const remaining = aliveTeams.filter((team) => team.code !== CHINA_CODE);
    const nextOpponent = chinaMatchRecord.willWinRound ? getNextChinaOpponent(chinaMatchRecord.matchId, winners) : null;
    stages.push(
      createAdvancementStage({
        roundIndex: meta.index,
        remaining,
        nextOpponent,
        finalOpponent: chinaMatchRecord.opponent,
        result: chinaMatchRecord.willWinRound ? "champion" : "failure",
      }),
    );

    if (!chinaMatchRecord.willWinRound) {
      result = "failure";
      failureReason = getFailureReason(attributes, chinaMatchRecord.round.match);
      break;
    }
  }

  if (result === "champion" && rounds.length < ROUND_META.length) {
    result = "failure";
    failureReason = "bracketExit";
  }

  if (result === "champion" && stages.at(-1)?.podium && semiFinalLosers.length) {
    stages[stages.length - 1] = {
      ...stages.at(-1),
      podium: {
        ...stages.at(-1).podium,
        third: semiFinalLosers.sort((left, right) => right.baseRating - left.baseRating)[0],
      },
    };
  }

  return {
    rounds,
    advancementStages: stages,
    finalMatch: rounds[rounds.length - 1]?.match || null,
    result,
    failureReason,
  };
}

function normalizeSelectedTeam(selectedTeam) {
  return TEAM_BY_CODE[selectedTeam?.code] || getTeamByCode("jp");
}

function createPathRows({ selectedTeam, groupResult, knockout }) {
  const rows = [
    { type: "replace", label: "替换", verb: "贴上", targetCode: selectedTeam.code, targetName: selectedTeam.name },
  ];
  const chinaRow = groupResult?.standings.find((row) => row.team.code === CHINA_CODE);
  rows.push({
    type: "group",
    label: "小组赛",
    text: `${selectedTeam.group} 组${chinaRow && chinaRow.points >= 4 ? "压线晋级" : "梦醒出局"}`,
  });

  for (const round of knockout.rounds) {
    const lost = round.match.chinaGoals < round.match.opponentGoals;
    rows.push({
      type: "match",
      label: round.label,
      score: makeScoreText(round.match),
      opponentCode: round.opponent.code,
      opponentName: round.opponent.name,
      final: round === knockout.rounds[knockout.rounds.length - 1],
      lost,
    });
  }

  return rows;
}

export function simulateWorldCupRun({ attributes, selectedTeam, seed = Date.now() } = {}) {
  const replacedTeam = normalizeSelectedTeam(selectedTeam);
  const rng = createRng(`${seed}:${stableHash(JSON.stringify(attributes || {}))}:${replacedTeam.code}`);
  const commentarySeed = `commentary:${seed}:${replacedTeam.code}:${stableHash(JSON.stringify(attributes || {}))}`;
  const zeroHiddenRoute = getZeroLuckHiddenChampionRoute(attributes, replacedTeam.code);
  const isZeroHidden = Boolean(zeroHiddenRoute);
  const runPlan = createRunPlan({ attributes, replacedTeam, rng, zeroHiddenRoute });
  const baseChampionChance = runPlan.championProbability;
  const playableGroups = getPlayableGroups(replacedTeam);
  const rawGroupResults = playableGroups.map((group) =>
    simulateGroup(group, { attributes, rng, replacedTeam, runPlan, zeroHiddenRoute }),
  );
  const groupResults = prepareGroupResultsForKnockout({ groupResults: rawGroupResults, replacedTeam, runPlan, zeroHiddenRoute });
  const chinaGroup = groupResults.find((group) => group.id === replacedTeam.group);
  const groupAdvancers = getAdvancers(groupResults);
  const chinaAdvanced = groupAdvancers.some((team) => team.code === CHINA_CODE);
  const chinaMatches = chinaGroup.matches
    .filter((match) => match.home.code === CHINA_CODE || match.away.code === CHINA_CODE)
    .map((match) => {
      const chinaHome = match.home.code === CHINA_CODE;
      const opponent = chinaHome ? match.away : match.home;
      return {
        ...match,
        opponent,
        chinaGoals: chinaHome ? match.homeGoals : match.awayGoals,
        opponentGoals: chinaHome ? match.awayGoals : match.homeGoals,
      };
    });
  const transitionLines = generateTransitionCommentary({
    selectedTeam: replacedTeam,
    groupMatches: chinaMatches,
    attributes,
    rng: createRng(`${commentarySeed}:transition`),
  });
  const commentaryLedger = createCommentaryLedger(transitionLines);
  const knockout = chinaAdvanced && runPlan.failureStage !== "GROUP"
    ? simulateKnockout({ attributes, rng, groupResults, advancers: groupAdvancers, runPlan, zeroHiddenRoute, commentaryLedger, commentarySeed })
    : { rounds: [], advancementStages: [], finalMatch: null, result: "failure", failureReason: "groupExit" };
  const result = runPlan.outcome === "champion" && knockout.result === "champion" ? "champion" : "failure";

  const copy = generateRunCopy({
    result,
    selectedTeam: replacedTeam,
    chinaGroup,
    chinaMatches,
    knockout,
    attributes,
    rng: createRng(`run-copy:${seed}:${replacedTeam.code}:${result}:${JSON.stringify(attributes || {})}`),
    initialLines: [
      ...transitionLines,
      ...knockout.rounds.flatMap((round) => round.commentary || []),
    ],
  });

  return {
    id: `run-${stableHash(`${seed}:${replacedTeam.code}:${JSON.stringify(attributes)}`)}`,
    seed,
    attributes,
    selectedTeam: replacedTeam,
    replacedTeam,
    rankingSnapshotDate: "2026-06-11",
    championChance: baseChampionChance,
    zeroLuckExperienceChance: isZeroHidden ? 0.0309 : 0,
    isZeroHidden,
    zeroLuckRouteId: zeroHiddenRoute?.id || null,
    zeroLuckProfileId: zeroHiddenRoute?.matchedProfile?.id || null,
    runPlan,
    result,
    groupResults,
    chinaGroup,
    chinaMatches,
    groupAdvancers,
    transitionLines,
    knockoutRounds: knockout.rounds,
    advancementStages: knockout.advancementStages,
    pathRows: createPathRows({ selectedTeam: replacedTeam, groupResult: chinaGroup, knockout }),
    copy,
    settlement: {
      result,
      defeatedOpponentCode: result === "champion" ? knockout.finalMatch?.opponent?.code || knockout.rounds.at(-1)?.opponent?.code : null,
      defeatedOpponentName: result === "champion" ? knockout.rounds.at(-1)?.opponent?.name : null,
      failureReason: result === "failure" ? knockout.failureReason : null,
      failureSeed: stableHash(`${seed}:${replacedTeam.code}:${knockout.failureReason || "champion"}`),
    },
  };
}
