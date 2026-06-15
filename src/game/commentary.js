import { getDominantAttribute } from "./model.js";

const PART_KIND = {
  TEXT: "text",
  TIME: "time",
  TEAM: "team",
  PLAYER: "player",
  SYSTEM: "system",
  SCORE: "score",
};

const PLAYER_POOL = ["武磊", "张玉宁", "王大雷", "蒋光太", "谢鹏飞", "韦世豪"];

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
    const text = pick(rng, isChina ? chinaGoalTexts : opponentGoalTexts);
    const scorer = isChina ? pick(rng, PLAYER_POOL) : opponent.name;
    const scoreText = `${chinaScore}:${opponentScore}`;

    return richLine(
      `${baseId}-goal-${index}`,
      [
        part(goalTimes[index] || "90+5’", PART_KIND.TIME),
        part(isChina ? scorer : opponent.name, isChina ? PART_KIND.PLAYER : PART_KIND.TEAM),
        part(text[0]),
        part(text[1]),
        part(scoreText, PART_KIND.SCORE),
      ],
      { scoreState: [chinaScore, opponentScore] },
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
  const player = PLAYER_POOL[Math.floor(rng.next() * PLAYER_POOL.length)] || PLAYER_POOL[0];
  const styleA = styleLines[Math.floor(rng.next() * styleLines.length)] || styleLines[0];
  const styleB = luck >= 6 ? LUCK_LINES[Math.floor(rng.next() * LUCK_LINES.length)] : null;
  const isWin = match.chinaGoals > match.opponentGoals || (match.penalties && match.penalties[0] > match.penalties[1]);
  const isDraw = match.chinaGoals === match.opponentGoals && !match.penalties;
  const finalText = isWin ? "哨响  这一关硬是过去了" : isDraw ? "哨响  算分器还活着" : "哨响  这条宇宙线开始漏风";
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
      part("开始加速，"),
      part("中国队", PART_KIND.TEAM),
      part("禁区前沿像临时开了早会。"),
    ]),
    ...goalLines.slice(0, 3),
    richLine(`${baseId}-player`, [
      part("58’", PART_KIND.TIME),
      part(player, PART_KIND.PLAYER),
      part("完成关键处理，"),
      part(opponent.name, PART_KIND.TEAM),
      part("节奏被迫降下来。"),
    ]),
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
    ...groupMatches.flatMap((match, index) => {
      const opponent = opponents[index];
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
