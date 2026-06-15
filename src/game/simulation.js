import { generateMatchCommentary, generateTransitionCommentary, getFailureReason, makeScoreText } from "./commentary.js";
import { CHINA_CODE, championChance, getChinaMatchPower, scoreMatch } from "./model.js";
import { chance, createRng, pick, stableHash } from "./random.js";
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

function getFixedZeroGroupMatch(home, away, zeroHiddenRoute) {
  const chinaIsHome = home.code === CHINA_CODE;
  const opponent = chinaIsHome ? away : home;
  const fixed = zeroHiddenRoute?.groupResults?.find((match) => match.opponentCode === opponent.code);
  if (!fixed) return null;

  return {
    id: `zero-group-${opponent.code}`,
    home,
    away,
    homeGoals: chinaIsHome ? fixed.chinaGoals : fixed.opponentGoals,
    awayGoals: chinaIsHome ? fixed.opponentGoals : fixed.chinaGoals,
    tone: fixed.tone,
  };
}

function createChampionGroupMatch({ home, away, attributes, rng, index }) {
  const chinaIsHome = home.code === CHINA_CODE || away.code === CHINA_CODE;
  if (!chinaIsHome) return createGroupMatch({ home, away, attributes, stage: "GROUP", rng });

  const chinaHome = home.code === CHINA_CODE;
  const opponent = chinaHome ? away : home;
  const plans = [
    { chinaGoals: 1, opponentGoals: 1, tone: "survive" },
    { chinaGoals: 2, opponentGoals: 1, tone: "counter" },
    { chinaGoals: 1, opponentGoals: 0, tone: "defense" },
  ];
  const plan = plans[index % plans.length];

  return {
    id: `champion-group-${opponent.code}`,
    home,
    away,
    homeGoals: chinaHome ? plan.chinaGoals : plan.opponentGoals,
    awayGoals: chinaHome ? plan.opponentGoals : plan.chinaGoals,
    tone: plan.tone,
  };
}

function simulateGroup(group, { attributes, rng, replacedTeam, willChampion, zeroHiddenRoute }) {
  const standings = new Map(group.teams.map((team) => [team.code, createStanding(team)]));
  const matches = [];
  let chinaMatchIndex = 0;

  for (const [homeSlot, awaySlot] of GROUP_MATCH_PATTERN) {
    const home = group.teams.find((team) => team.slot === homeSlot);
    const away = group.teams.find((team) => team.slot === awaySlot);
    const hasChina = home.code === CHINA_CODE || away.code === CHINA_CODE;
    let match = null;

    if (group.id === replacedTeam.group && hasChina && zeroHiddenRoute) {
      match = getFixedZeroGroupMatch(home, away, zeroHiddenRoute);
    }
    if (!match && group.id === replacedTeam.group && hasChina && willChampion) {
      match = createChampionGroupMatch({ home, away, attributes, rng, index: chinaMatchIndex });
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

function forceChinaIntoAdvancers(advancers, groupResult) {
  if (advancers.some((team) => team.code === CHINA_CODE)) return advancers;
  const chinaRow = groupResult.standings.find((row) => row.team.code === CHINA_CODE);
  return [...advancers.slice(0, -1), chinaRow.team];
}

function rankTeamsForKnockout(teams) {
  return [...teams].sort((a, b) => {
    if (a.code === CHINA_CODE) return -1;
    if (b.code === CHINA_CODE) return 1;
    return b.baseRating - a.baseRating;
  });
}

function getFallbackChampionRoute(advancers, replacedTeam, rng) {
  const candidates = rankTeamsForKnockout(advancers).filter((team) => team.code !== CHINA_CODE);
  const bands = [
    candidates.filter((team) => team.baseRating >= 74 && team.baseRating < 84),
    candidates.filter((team) => team.baseRating >= 82 && team.baseRating < 88),
    candidates.filter((team) => team.baseRating >= 88),
    candidates.filter((team) => team.baseRating >= 90),
    candidates.filter((team) => team.baseRating >= 88 && team.code !== replacedTeam.code),
  ];
  const seen = new Set();
  return bands.map((band, index) => {
    const pool = band.filter((team) => !seen.has(team.code));
    const picked = pick(pool.length ? pool : candidates.filter((team) => !seen.has(team.code)), rng) || candidates[index];
    seen.add(picked.code);
    return picked;
  });
}

function createKnockoutMatch({ roundMeta, opponent, attributes, rng, forceWin, fixed }) {
  if (fixed) {
    const match = {
      id: `zero-${roundMeta.key}`,
      round: roundMeta.key,
      label: roundMeta.label,
      opponent,
      chinaGoals: fixed.chinaGoals,
      opponentGoals: fixed.opponentGoals,
      penalties: fixed.penalties,
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

function simulateKnockout({ attributes, rng, advancers, replacedTeam, willChampion, zeroHiddenRoute }) {
  if (!advancers.some((team) => team.code === CHINA_CODE)) {
    return { rounds: [], advancementStages: [], finalMatch: null, result: "failure", failureReason: "groupExit" };
  }

  const fixedRoute = zeroHiddenRoute?.knockoutResults || null;
  const championRoute = fixedRoute
    ? fixedRoute.map((match) => getTeamByCode(match.opponentCode))
    : getFallbackChampionRoute(advancers, replacedTeam, rng);
  const failureRoundIndex = willChampion ? -1 : Math.floor(rng.next() * 3);
  const rounds = [];
  const stages = [];
  let remaining = rankTeamsForKnockout(advancers).filter((team) => team.code !== CHINA_CODE);
  let result = "champion";
  let failureReason = null;

  for (let index = 0; index < ROUND_META.length; index += 1) {
    const meta = ROUND_META[index];
    const willWinRound = willChampion || index < failureRoundIndex;
    const opponent = championRoute[index] || pick(remaining, rng) || getTeamByCode("br");
    const fixed = fixedRoute?.find((match) => match.round === meta.key);
    const match = createKnockoutMatch({ roundMeta: meta, opponent, attributes, rng, forceWin: willWinRound, fixed });
    const round = {
      ...meta,
      status: willWinRound ? meta.status : `止步 ${meta.label}`,
      next: willWinRound ? meta.next : "查看本局结算",
      opponent,
      score: [match.chinaGoals, match.opponentGoals],
      penalties: match.penalties,
      match,
      commentary: generateMatchCommentary({ match, opponent, attributes, roundLabel: meta.label, rng }),
    };
    rounds.push(round);

    remaining = remaining.filter((team) => team.code !== opponent.code);
    const nextOpponent = championRoute[index + 1] || remaining[0];
    stages.push(createAdvancementStage({ roundIndex: index, remaining, nextOpponent, finalOpponent: opponent, result: "champion" }));

    if (!willWinRound) {
      result = "failure";
      failureReason = getFailureReason(attributes, match);
      stages[stages.length - 1] = createAdvancementStage({ roundIndex: index, remaining, nextOpponent: null, finalOpponent: opponent, result });
      break;
    }
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
  const zeroHiddenRoute = getZeroLuckHiddenChampionRoute(attributes, replacedTeam.code);
  const isZeroHidden = Boolean(zeroHiddenRoute);
  const baseChampionChance = championChance(attributes, replacedTeam);
  const willChampion = isZeroHidden || chance(baseChampionChance, rng);
  const playableGroups = getPlayableGroups(replacedTeam);
  const groupResults = playableGroups.map((group) =>
    simulateGroup(group, { attributes, rng, replacedTeam, willChampion, zeroHiddenRoute }),
  );
  const chinaGroup = groupResults.find((group) => group.id === replacedTeam.group);
  const groupAdvancers = willChampion ? forceChinaIntoAdvancers(getAdvancers(groupResults), chinaGroup) : getAdvancers(groupResults);
  const chinaAdvanced = groupAdvancers.some((team) => team.code === CHINA_CODE);
  const knockout = chinaAdvanced
    ? simulateKnockout({ attributes, rng, advancers: groupAdvancers, replacedTeam, willChampion, zeroHiddenRoute })
    : { rounds: [], advancementStages: [], finalMatch: null, result: "failure", failureReason: "groupExit" };
  const result = willChampion && knockout.result === "champion" ? "champion" : "failure";
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
    result,
    groupResults,
    chinaGroup,
    chinaMatches,
    groupAdvancers,
    transitionLines: generateTransitionCommentary({ selectedTeam: replacedTeam, groupMatches: chinaMatches, attributes }),
    knockoutRounds: knockout.rounds,
    advancementStages: knockout.advancementStages,
    pathRows: createPathRows({ selectedTeam: replacedTeam, groupResult: chinaGroup, knockout }),
    settlement: {
      result,
      defeatedOpponentCode: result === "champion" ? knockout.finalMatch?.opponent?.code || knockout.rounds.at(-1)?.opponent?.code : null,
      defeatedOpponentName: result === "champion" ? knockout.rounds.at(-1)?.opponent?.name : null,
      failureReason: result === "failure" ? knockout.failureReason : null,
      failureSeed: stableHash(`${seed}:${replacedTeam.code}:${knockout.failureReason || "champion"}`),
    },
  };
}
