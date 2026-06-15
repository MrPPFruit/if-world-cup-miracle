import { getDominantAttribute } from "./model.js";
import { PLAYER_PROFILES_BY_TEAM } from "./teams.js";

const PART_KIND = {
  TEXT: "text",
  TIME: "time",
  TEAM: "team",
  PLAYER: "player",
  SYSTEM: "system",
  SCORE: "score",
};

export const COMPACT_COPY_LIMITS = {
  groupHeroTitle: 14,
  groupHeroNote: 28,
  groupMatchesNote: 26,
  advancementHint: 18,
  settlementHeroNote: 28,
  pathFinalNote: 34,
};

export const GOAL_PLAYER_ROLES = ["finish", "pace", "setPiece", "control"];

const COMPACT_SCORE_TEAM_NAMES = {
  阿尔及利亚: "阿尔及",
  "刚果（金）": "刚果金",
  哥斯达黎加: "哥斯达",
};

const STYLE_LINES = {
  attack: [
    ["锋线终于不再客气，", "禁区里像有人点了外卖加急。"],
    ["反击三脚到位，", "对手后卫还在加载路线图。"],
  ],
  defense: [
    ["铁桶阵摆开，", "门前像临时加装了防盗门。"],
    ["全队缩成一堵墙，", "对手射门先撞上现实。"],
  ],
  midfield: [
    ["中场突然醒了，", "传球路线清楚得像开了导航。"],
    ["连续倒脚把节奏压住，", "看台一度以为这是控球教学。"],
  ],
  stamina: [
    ["补时还在冲，", "体能条像偷偷续了会员。"],
    ["第九十分钟还能反抢，", "对手替补席开始沉默。"],
  ],
  tactics: [
    ["定位球战术启动，", "战术板本人也看得一愣。"],
    ["怪阵突然生效，", "对手教练开始翻说明书。"],
  ],
};

const LUCK_LINES = [
  ["皮球折线之后进网，", "门柱表示这球不归它管。"],
  ["VAR 画线画到沉默，", "最后选择相信平行宇宙。"],
  ["对手解围踢到自己人，", "足球完成了自我导航。"],
  ["裁判看表三次，", "时间决定站在中国队这边。"],
];

const OPPONENT_TIER_LINES = {
  superpower: [
    ["强队气场压过来，", "把勇气临时加班。"],
    ["对面星味很足，", "把冷门两个字写轻一点。"],
  ],
  host: [
    ["东道主声浪很满，", "把客场模式调成静音。"],
    ["主场氛围往上拱，", "把客场二字先折起来。"],
  ],
  asia: [
    ["亚洲德比味道上来了，", "把每次逼抢都踢成群聊已读。"],
    ["熟人局不好踢，", "先把东亚风向压在脚下。"],
  ],
  underdog: [
    ["对手看着低调，", "也不敢把剧本读太快。"],
    ["这场纸面不吓人，", "先把纸面折成护身符。"],
  ],
  default: [
    ["对面节奏不慢，", "先把阵脚钉住。"],
    ["比赛进入拉扯，", "把每次二点球都当开盲盒。"],
  ],
};

const PLAYER_EVENT_LINES = {
  save: [
    ["准备扑救姿势，", "门前空气突然变厚。"],
    ["横移封角度，", "射门路线被擦成省略号。"],
  ],
  block: [
    ["提前卡住线路，", "这脚进攻被写进未遂档案。"],
    ["把禁区门缝合上，", "对手只能在外面读说明书。"],
  ],
  control: [
    ["把节奏揉慢，", "中场像临时开了棋局。"],
    ["连续分球调度，", "草皮上出现了几何课。"],
  ],
  finish: [
    ["突然启动，", "禁区灯光像被人拧亮。"],
    ["一脚处理很锋利，", "记分牌差点提前醒来。"],
  ],
  pace: [
    ["边路提速，", "防线开始追问人生。"],
    ["把速度拉满，", "草皮像被划出一道风。"],
  ],
  setPiece: [
    ["站到定位球前，", "人墙的哲学问题变多了。"],
    ["准备起脚，", "空气里有一点不讲理的弧线。"],
  ],
};

const PLAYER_GOAL_EVENT_LINES = {
  finish: [
    ["一脚处理很锋利，", "皮球把比分牌敲醒。"],
    ["在禁区里找到针眼，", "这球钻得很有主见。"],
  ],
  pace: [
    ["把防线甩到身后，", "单刀像按了快进键。"],
    ["边路一路提速，", "最后一脚把风送进网窝。"],
  ],
  setPiece: [
    ["定位球开进危险区，", "皮球像带着批注落下。"],
    ["任意球弧线绕过人墙，", "门将只摸到叹号。"],
  ],
  control: [
    ["把节奏拨到空当，", "最后一下把球送进网里。"],
    ["中路调度突然加速，", "比分跟着向前挪了一步。"],
  ],
};

function getTeamProfiles(team) {
  return PLAYER_PROFILES_BY_TEAM[team?.code] || [
    { name: `${team?.name || "对手"}队长`, position: "midfielder", roles: ["control"] },
  ];
}

function pickPlayerByRole(rng, team, preferredRoles = []) {
  const profiles = getTeamProfiles(team);
  const matching = profiles.filter((player) => player.roles.some((role) => preferredRoles.includes(role)));
  return pick(rng, matching.length ? matching : profiles);
}

function pickRoleForPlayer(rng, player, preferredRoles = []) {
  const matching = (player?.roles || []).filter((role) => preferredRoles.includes(role));
  return pick(rng, matching.length ? matching : player?.roles || preferredRoles);
}

function getOpponentTier(team) {
  if (team?.tags?.includes("superpower") || team?.baseRating >= 88) return "superpower";
  if (team?.tags?.includes("host")) return "host";
  if (team?.tags?.includes("asia")) return "asia";
  if (team?.baseRating <= 66) return "underdog";
  return "default";
}

function getLuckTone(attributes) {
  const luck = Number(attributes?.luck) || 0;
  if (luck >= 8) return "absurd";
  if (luck >= 6) return "high";
  if (luck >= 3) return "mild";
  return "none";
}

function getScoreShape(match, isWin) {
  if (match.penalties) return "penalty";
  if (isWin && match.opponentGoals === 0) return "cleanSheet";
  if (isWin && match.opponentGoals > 0) return "survive";
  if (!isWin && match.chinaGoals + 1 === match.opponentGoals) return "narrowLoss";
  if (!isWin) return "exit";
  return "draw";
}

function getChinaStanding(group) {
  return group?.standings?.find((row) => row.team.code === "cn") || null;
}

function compact(text, limit) {
  if (!limit || text.length <= limit) return text;
  return `${text.slice(0, Math.max(1, limit - 1))}…`;
}

export function getPlainText(partsOrText) {
  if (typeof partsOrText === "string") return partsOrText;
  if (Array.isArray(partsOrText)) return partsOrText.map((item) => item.text || "").join("");
  return partsOrText?.parts ? getPlainText(partsOrText.parts) : "";
}

export function richLine(id, parts, meta = {}) {
  return { id, parts, ...meta };
}

export function part(text, kind = PART_KIND.TEXT) {
  return { text, kind };
}

export function makeScoreText(match) {
  const penalty = match.penalties ? ` 点球 ${match.penalties[0]}:${match.penalties[1]}` : "";
  return `${match.chinaGoals}:${match.opponentGoals}${penalty}`;
}

function makeCompactScoreTeamName(name) {
  return COMPACT_SCORE_TEAM_NAMES[name] || name;
}

function pick(rng, items) {
  return items[Math.floor(rng.next() * items.length)] || items[0];
}

function makeGoalOrder(match, rng) {
  let chinaLeft = match.chinaGoals;
  let opponentLeft = match.opponentGoals;
  const order = [];
  const chinaWins = match.chinaGoals > match.opponentGoals || (match.penalties && match.penalties[0] > match.penalties[1]);

  if (chinaWins && opponentLeft > 0 && chinaLeft > 0 && rng.next() < 0.72) {
    order.push("opponent");
    opponentLeft -= 1;
  } else if (!chinaWins && chinaLeft > 0 && opponentLeft > 0 && rng.next() < 0.55) {
    order.push("china");
    chinaLeft -= 1;
  }

  while (chinaLeft > 0 || opponentLeft > 0) {
    const preferChina = chinaWins || (match.penalties && chinaLeft >= opponentLeft);
    if (preferChina && chinaLeft > 0) {
      order.push("china");
      chinaLeft -= 1;
    } else if (!preferChina && opponentLeft > 0) {
      order.push("opponent");
      opponentLeft -= 1;
    } else if (chinaLeft > 0) {
      order.push("china");
      chinaLeft -= 1;
    } else {
      order.push("opponent");
      opponentLeft -= 1;
    }
  }

  return order;
}

function makeGoalLines({ match, opponent, rng, baseId }) {
  const goalTimes = ["13’", "24’", "36’", "45+1’", "53’", "64’", "76’", "88’", "90+3’"];
  const chinaGoalTexts = [
    ["反击终于跑通，", "把球推进网窝。"],
    ["定位球砸进人堆，", "皮球像被宇宙推了一把。"],
    ["禁区前低射穿过腿林，", "门将只摸到了风。"],
    ["混战里抢到第二落点，", "替补席先蹦起来再确认比分。"],
  ];
  const opponentGoalTexts = [
    ["压上后抓住空当，", "现实服警报短暂响起。"],
    ["远射折线入网，", "门柱这次选择旁观。"],
    ["边路传中造成混乱，", "比分把心率往上拽了一格。"],
    ["前场逼抢得手，", "解说席开始翻安慰词。"],
  ];
  let chinaScore = 0;
  let opponentScore = 0;

  return makeGoalOrder(match, rng).map((side, index) => {
    const isChina = side === "china";
    if (isChina) chinaScore += 1;
    else opponentScore += 1;
    const scorer = isChina
      ? pickPlayerByRole(rng, { code: "cn", name: "中国队" }, GOAL_PLAYER_ROLES)
      : pickPlayerByRole(rng, opponent, GOAL_PLAYER_ROLES);
    const role = pickRoleForPlayer(rng, scorer, GOAL_PLAYER_ROLES);
    const text = pick(rng, isChina ? chinaGoalTexts : PLAYER_GOAL_EVENT_LINES[role] || opponentGoalTexts);
    const scoreText = `${chinaScore}:${opponentScore}`;

    return richLine(
      `${baseId}-goal-${index}`,
      [
        part(goalTimes[index] || "90+5’", PART_KIND.TIME),
        part(scorer.name, PART_KIND.PLAYER),
        part(text[0]),
        part(text[1]),
        part(scoreText, PART_KIND.SCORE),
      ],
      {
        scoreState: [chinaScore, opponentScore],
        playerEvent: {
          name: scorer.name,
          teamCode: isChina ? "cn" : opponent.code,
          role,
        },
      },
    );
  });
}

export function getFailureReason(attributes, match = {}) {
  const dominant = getDominantAttribute(attributes);
  if (match.tone === "var" || dominant === "tactics") return "tacticsCollapse";
  if (dominant === "defense") return "lateCollapse";
  if (dominant === "stamina") return "finalWhistle";
  if (dominant === "attack") return "ownGoal";
  return "var";
}

export function generateMatchCommentary({ match, opponent, attributes, roundLabel, rng }) {
  const dominant = getDominantAttribute(attributes);
  const styleLines = STYLE_LINES[dominant] || STYLE_LINES.midfield;
  const luck = Number(attributes.luck) || 0;
  const chinaPlayer = pickPlayerByRole(rng, { code: "cn", name: "中国队" }, ["block", "save", "control"]);
  const opponentTier = getOpponentTier(opponent);
  const opponentTierLine = pick(rng, OPPONENT_TIER_LINES[opponentTier] || OPPONENT_TIER_LINES.default);
  const opponentStar = pickPlayerByRole(rng, opponent, ["finish", "control", "pace", "setPiece"]);
  const starRole = pick(rng, opponentStar.roles);
  const starText = pick(rng, PLAYER_EVENT_LINES[starRole] || PLAYER_EVENT_LINES.control);
  const styleA = styleLines[Math.floor(rng.next() * styleLines.length)] || styleLines[0];
  const styleB = luck >= 6 ? LUCK_LINES[Math.floor(rng.next() * LUCK_LINES.length)] : null;
  const isWin = match.chinaGoals > match.opponentGoals || (match.penalties && match.penalties[0] > match.penalties[1]);
  const isDraw = match.chinaGoals === match.opponentGoals && !match.penalties;
  const scoreShape = getScoreShape(match, isWin);
  const finalText = isWin
    ? scoreShape === "penalty"
      ? "哨响  点球点上也能种出奇迹"
      : "哨响  这一关硬是过去了"
    : isDraw
      ? "哨响  算分器还活着"
      : "哨响  这条宇宙线开始漏风";
  const baseId = match.id || roundLabel;
  const goalLines = makeGoalLines({ match, opponent, rng, baseId });

  const lines = [
    richLine(`${baseId}-start`, [
      part("08’", PART_KIND.TIME),
      part(roundLabel),
      part("开场，"),
      part("中国队", PART_KIND.TEAM),
      part("先试探，"),
      part(opponent.name, PART_KIND.TEAM),
      part("把阵型往前压。"),
    ]),
    richLine(`${baseId}-style-a`, [
      part("18’", PART_KIND.TIME),
      part("中国队", PART_KIND.TEAM),
      part(styleA[0]),
      part(styleA[1]),
    ]),
    richLine(`${baseId}-pressure`, [
      part("29’", PART_KIND.TIME),
      part(opponent.name, PART_KIND.TEAM),
      part(opponentTierLine[0]),
      part("中国队", PART_KIND.TEAM),
      part(opponentTierLine[1]),
    ]),
    ...goalLines.slice(0, 3),
    richLine(`${baseId}-player`, [
      part("58’", PART_KIND.TIME),
      part(chinaPlayer.name, PART_KIND.PLAYER),
      part("完成关键处理，"),
      part(opponent.name, PART_KIND.TEAM),
      part("节奏被迫降下来。"),
    ]),
    richLine(`${baseId}-opponent-star`, [
      part("66’", PART_KIND.TIME),
      part(opponentStar.name, PART_KIND.PLAYER),
      part(starText[0]),
      part(starText[1]),
      part("中国队", PART_KIND.TEAM),
      part("暂时把剧本压住。"),
    ], {
      playerEvent: {
        name: opponentStar.name,
        teamCode: opponent.code,
        role: starRole,
      },
    }),
    ...goalLines.slice(3),
  ];

  if (!goalLines.length) {
    lines.splice(
      3,
      0,
      richLine(`${baseId}-near-goal`, [
        part("37’", PART_KIND.TIME),
        part("中国队", PART_KIND.TEAM),
        part("射门擦柱而出，比分没动，大家的血压先动了。"),
      ]),
    );
  }

  if (styleB) {
    lines.push(
      richLine(`${baseId}-luck`, [
        part("72’", PART_KIND.TIME),
        part("幸运值", PART_KIND.SYSTEM),
        part("开始上班，"),
        part(styleB[0]),
        part(styleB[1]),
      ]),
    );
  }

  lines.push(
    richLine(`${baseId}-late-save`, [
      part("86’", PART_KIND.TIME),
      part("中国队", PART_KIND.TEAM),
      part(isWin ? "把最后几分钟踢成防灾演练，" : "还在往前压，"),
      part(opponent.name, PART_KIND.TEAM),
      part(isWin ? "连续传中都被挡出。" : "禁区里全是人影。"),
    ]),
  );

  if (match.penalties) {
    lines.push(
      richLine(
        `${baseId}-penalty`,
        [
          part("点球", PART_KIND.SYSTEM),
          part("大战结束，记分牌补上一行："),
          part(`点球 ${match.penalties[0]}:${match.penalties[1]}`, PART_KIND.SCORE),
        ],
        { scoreState: [match.chinaGoals, match.opponentGoals] },
      ),
    );
  }

  lines.push(
    richLine(
      `${baseId}-score`,
      [
        part("90+6’", PART_KIND.TIME),
        part("最后一波冲击结束，记分牌写成"),
        part(makeScoreText(match), PART_KIND.SCORE),
      ],
      { scoreState: [match.chinaGoals, match.opponentGoals] },
    ),
    richLine(`${baseId}-final`, [part("终场", PART_KIND.SYSTEM), part(finalText)], {
      scoreState: [match.chinaGoals, match.opponentGoals],
    }),
  );

  return lines;
}

export function generateTransitionCommentary({ selectedTeam, groupMatches, attributes }) {
  const opponents = groupMatches.map((match) => match.opponent);
  const dominant = getDominantAttribute(attributes);
  const dominantText = {
    attack: "锋线火力",
    defense: "铁桶防线",
    midfield: "中场脑子",
    stamina: "体能韧性",
    tactics: "战术整活",
  }[dominant] || "中场脑子";
  const luckTone = getLuckTone(attributes);
  const luckCopy = {
    none: "没有幸运外包  全靠腿和心跳",
    mild: "幸运偶尔探头  像迟到的场务",
    high: "幸运开始值班  门柱都在看工牌",
    absurd: "幸运穿西装入场  宇宙线开始端水",
  }[luckTone];

  return [
    richLine("transition-replace", [
      part(`${selectedTeam.name}队`, PART_KIND.TEAM),
      part("名单突然闪烁，"),
      part("中国队", PART_KIND.TEAM),
      part("带着"),
      part(dominantText, PART_KIND.SYSTEM),
      part("接管了这个小组。"),
    ]),
    richLine("transition-equipment", [
      part("03’", PART_KIND.TIME),
      part("更衣室", PART_KIND.SYSTEM),
      part("门牌重新贴好，队务说这锅先别问是谁背。"),
    ]),
    richLine("transition-luck", [
      part("07’", PART_KIND.TIME),
      part("幸运值", PART_KIND.SYSTEM),
      part(luckCopy),
      part("。"),
    ]),
    ...groupMatches.flatMap((match, index) => {
      const opponent = opponents[index];
      const star = pickPlayerByRole(
        { next: () => ((index + 1) * 0.271828) % 1 },
        opponent,
        index === 0 ? ["finish", "pace"] : index === 1 ? ["control", "setPiece"] : ["save", "block"],
      );
      return [
        richLine(`transition-group-${index}-kickoff`, [
          part(`${12 + index * 19}’`, PART_KIND.TIME),
          part("中国队", PART_KIND.TEAM),
          part("对上"),
          part(opponent.name, PART_KIND.TEAM),
          part("，解说席先把计算器摆正。"),
        ]),
        richLine(`transition-group-${index}-shape`, [
          part(`${22 + index * 17}’`, PART_KIND.TIME),
          part("中国队", PART_KIND.TEAM),
          part("把"),
          part(dominantText, PART_KIND.SYSTEM),
          part(index === 1 ? "踢成了临场说明书。" : "塞进比赛节奏里。"),
        ]),
        richLine(`transition-group-${index}-star`, [
          part(`${28 + index * 13}’`, PART_KIND.TIME),
          part(star.name, PART_KIND.PLAYER),
          part("被镜头点名，"),
          part("中国队", PART_KIND.TEAM),
          part(index === 2 ? "把最后一页剧本攥住。" : "把这段压力先存档。"),
        ]),
        richLine(`transition-group-${index}-swing`, [
          part(`${39 + index * 13}’`, PART_KIND.TIME),
          part(opponent.name, PART_KIND.TEAM),
          part("制造险情，"),
          part("VAR", PART_KIND.SYSTEM),
          part("短暂沉默，宇宙线继续加载。"),
        ]),
        richLine(`transition-group-${index}-score`, [
          part("终场", PART_KIND.SYSTEM),
          part("："),
          part(`中国队 ${makeScoreText(match)} ${makeCompactScoreTeamName(opponent.name)}`, PART_KIND.SCORE),
        ]),
      ];
    }),
    richLine("transition-table", [
      part("积分榜", PART_KIND.SYSTEM),
      part("刷新，"),
      part("中国队", PART_KIND.TEAM),
      part("还挂在线上，数学老师暂时没有下班。"),
    ]),
    richLine("transition-group-summary", [
      part("小组赛", PART_KIND.SYSTEM),
      part("结算完成，"),
      part("中国队", PART_KIND.TEAM),
      part("还没有被宇宙线删除。"),
    ]),
  ];
}

export function generateRunCopy({ result, selectedTeam, chinaGroup, chinaMatches, knockout, attributes, rng }) {
  const chinaStanding = getChinaStanding(chinaGroup);
  const advanced = result === "champion" || Boolean(knockout?.rounds?.length);
  const dominant = getDominantAttribute(attributes);
  const dominantShort = {
    attack: "锋线开灯",
    defense: "铁桶苟住",
    midfield: "中场有谱",
    stamina: "补时有电",
    tactics: "战术整活",
  }[dominant] || "中场有谱";
  const groupWin = chinaMatches?.filter((match) => match.chinaGoals > match.opponentGoals).length || 0;
  const groupDraw = chinaMatches?.filter((match) => match.chinaGoals === match.opponentGoals).length || 0;
  const titlePool = advanced
    ? ["中国队压线活了", `${dominantShort}救场`, "小组剧本没关"]
    : ["中国队梦醒小组", "宇宙线先断电", "算分器已下班"];
  const notePool = advanced
    ? ["数学还没放弃我们", "庄周梦蝶  先别醒", "诸葛亮借东风也就这样"]
    : ["这条线到此为止", "人生如逆旅  下局再踢", "风起青萍  球没进门"];
  const matchNotePool = advanced
    ? [`${groupWin}胜${groupDraw}平  活得很文学`, "输赢平都刚好卡边", "积分榜给了一个眼神"]
    : ["算分器关机  段子还在", "小组赛教会我们重开", "比分尽力了  宇宙没签字"];
  const knockoutNotePool = result === "champion"
    ? ["这球不一定科学  但比分讲礼貌", "剧本很野  记分牌很稳", "兵无常势  球有偏爱"]
    : ["这球已经尽力  风向没签字", "剧本写到这里  墨水先断", "比分不肯通融  下局再来"];
  const heroTitle = pick(rng, titlePool);
  const heroNote = pick(rng, notePool);
  const matchNote = pick(rng, matchNotePool);
  const finalOpponent = knockout?.rounds?.at(-1)?.opponent;
  const pathFinalNote = result === "champion"
    ? `${finalOpponent?.name || "对手"}看完比分  想申请重开宇宙`
    : `${finalOpponent?.name || selectedTeam.name}看完战报  也说这线挺累`;

  return {
    groupHeroTitle: compact(heroTitle, COMPACT_COPY_LIMITS.groupHeroTitle),
    groupHeroNote: compact(heroNote, COMPACT_COPY_LIMITS.groupHeroNote),
    groupMatchesNote: compact(matchNote, COMPACT_COPY_LIMITS.groupMatchesNote),
    groupStatus: advanced ? "晋级 32 强" : "小组赛出局",
    groupBadge: advanced ? "压线活了" : "小组出局",
    groupNextCta: advanced ? "进入 32 强：梦还没醒" : "查看本局结算",
    knockoutResultNote: pick(rng, knockoutNotePool),
    advancementHint: compact(advanced ? "席位已盖章" : "本局准备结算", COMPACT_COPY_LIMITS.advancementHint),
    settlementHeroTitle: result === "champion" ? "世界杯冠军！" : "梦醒了！",
    settlementHeroCopy: result === "champion" ? "中国队历史首次夺得世界杯冠军" : "请先别关机  宇宙线还在加载下一条",
    settlementHeroNote: compact(
      result === "champion"
        ? "本局建议收藏  现实服暂未同步"
        : `${chinaStanding?.points ?? 0}分宇宙线  下局再补课`,
      COMPACT_COPY_LIMITS.settlementHeroNote,
    ),
    pathFinalNote: compact(pathFinalNote, COMPACT_COPY_LIMITS.pathFinalNote),
  };
}
