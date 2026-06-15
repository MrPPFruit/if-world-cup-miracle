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

export function richLine(id, parts) {
  return { id, parts };
}

export function part(text, kind = PART_KIND.TEXT) {
  return { text, kind };
}

export function makeScoreText(match) {
  const penalty = match.penalties ? ` 点球 ${match.penalties[0]}:${match.penalties[1]}` : "";
  return `${match.chinaGoals}:${match.opponentGoals}${penalty}`;
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

  const lines = [
    richLine(`${match.id || roundLabel}-start`, [
      part("08’", PART_KIND.TIME),
      part(roundLabel),
      part("开场，"),
      part("中国队", PART_KIND.TEAM),
      part("先试探，"),
      part(opponent.name, PART_KIND.TEAM),
      part("把阵型往前压。"),
    ]),
    richLine(`${match.id || roundLabel}-style-a`, [
      part("26’", PART_KIND.TIME),
      part("中国队", PART_KIND.TEAM),
      part(styleA[0]),
      part(styleA[1]),
    ]),
    richLine(`${match.id || roundLabel}-player`, [
      part("44’", PART_KIND.TIME),
      part(player, PART_KIND.PLAYER),
      part("完成关键处理，"),
      part(opponent.name, PART_KIND.TEAM),
      part("节奏被迫降下来。"),
    ]),
  ];

  if (styleB) {
    lines.push(
      richLine(`${match.id || roundLabel}-luck`, [
        part("67’", PART_KIND.TIME),
        part("幸运值", PART_KIND.SYSTEM),
        part("开始上班，"),
        part(styleB[0]),
        part(styleB[1]),
      ]),
    );
  }

  lines.push(
    richLine(`${match.id || roundLabel}-score`, [
      part("88’", PART_KIND.TIME),
      part("比分定格前最后一波冲击，记分牌写成"),
      part(makeScoreText(match), PART_KIND.SCORE),
      part("。"),
    ]),
    richLine(`${match.id || roundLabel}-final`, [part("终场", PART_KIND.SYSTEM), part(finalText)]),
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
    ...groupMatches.flatMap((match, index) => [
      richLine(`transition-group-${index}-kickoff`, [
        part(`${12 + index * 19}’`, PART_KIND.TIME),
        part("中国队", PART_KIND.TEAM),
        part("对上"),
        part(opponents[index].name, PART_KIND.TEAM),
        part("，解说席先把计算器摆正。"),
      ]),
      richLine(`transition-group-${index}-score`, [
        part("终场", PART_KIND.SYSTEM),
        part("比分写入表格："),
        part(`中国队 ${makeScoreText(match)} ${opponents[index].name}`, PART_KIND.SCORE),
        part("。"),
      ]),
    ]),
    richLine("transition-group-summary", [
      part("小组赛", PART_KIND.SYSTEM),
      part("结算完成，"),
      part("中国队", PART_KIND.TEAM),
      part("还没有被宇宙线删除。"),
    ]),
  ];
}
