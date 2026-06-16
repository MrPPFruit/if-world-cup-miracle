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
  groupMatchDetail: 30,
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
    ["前场压迫忽然提档，", "草皮像被踩出加速带。"],
    ["边路把速度拉开，", "禁区门口开始堵车。"],
    ["射门选择变得果断，", "看台先把声音攒起来。"],
    ["二次进攻接上电，", "对手防线忙着找开关。"],
  ],
  defense: [
    ["铁桶阵摆开，", "门前像临时加装了防盗门。"],
    ["全队缩成一堵墙，", "对手射门先撞上现实。"],
    ["后卫线压住身位，", "禁区像挂了请勿入内。"],
    ["门前补位很及时，", "危险球被塞回抽屉。"],
    ["防守距离卡得很死，", "对手传球开始绕远路。"],
    ["解围一脚接一脚，", "草皮上全是安全出口。"],
  ],
  midfield: [
    ["中场突然醒了，", "传球路线清楚得像开了导航。"],
    ["连续倒脚把节奏压住，", "看台一度以为这是控球教学。"],
    ["中路把球留住，", "比赛节拍被揉成慢镜头。"],
    ["转移球开始准时，", "对手阵型被拉出折痕。"],
    ["二点球抢得很硬，", "中圈像临时归了中国队。"],
    ["传控没有乱飞，", "解说席终于敢把话说完。"],
  ],
  stamina: [
    ["补时还在冲，", "体能条像偷偷续了会员。"],
    ["第九十分钟还能反抢，", "对手替补席开始沉默。"],
    ["下半场脚步没散，", "跑动热区像刚续上电。"],
    ["冲刺还能接上，", "对面边后卫开始怀疑人生。"],
    ["最后阶段还敢压，", "肺活量像临时开了外挂。"],
    ["回追速度没掉线，", "防线被重新缝了一遍。"],
  ],
  tactics: [
    ["定位球战术启动，", "战术板本人也看得一愣。"],
    ["怪阵突然生效，", "对手教练开始翻说明书。"],
    ["换位跑出盲区，", "防守标记当场迷路。"],
    ["边中结合改了剧本，", "对手复盘材料加厚三页。"],
    ["站位忽然前提，", "比赛像被偷偷换了题。"],
    ["角球套路拐了个弯，", "人墙先把哲学问题想多了。"],
  ],
};

const LUCK_LINES = [
  ["皮球折线之后进网，", "门柱表示这球不归它管。"],
  ["VAR 画线画到沉默，", "最后选择相信平行宇宙。"],
  ["对手解围踢到自己人，", "足球完成了自我导航。"],
  ["裁判看表三次，", "时间决定站在中国队这边。"],
  ["横梁震了一下，", "像是在替中国队点头。"],
  ["皮球弹到奇怪角度，", "防线集体开始怀疑物理。"],
  ["门柱把必进球退回去，", "现场只剩一串省略号。"],
  ["越位线细到发光，", "最后把悬念留给中国队。"],
  ["补时牌举起来，", "时间突然变得很有弹性。"],
  ["草皮轻轻改了一下方向，", "足球像收到秘密短信。"],
];

const OPPONENT_TIER_LINES = {
  superpower: [
    ["强队气场压过来，", "把勇气临时加班。"],
    ["对面星味很足，", "把冷门两个字写轻一点。"],
    ["纸面实力很重，", "把脚下每一寸都踢成争议。"],
    ["热门球队压上来，", "先把害怕两个字藏进球袜。"],
    ["对手控场感很强，", "把防线拧成临时保险栓。"],
    ["强队节奏往前滚，", "把比赛拖进一条窄路。"],
  ],
  host: [
    ["东道主声浪很满，", "把客场模式调成静音。"],
    ["主场氛围往上拱，", "把客场二字先折起来。"],
    ["看台音量开满，", "把每次触球都踢得很小心。"],
    ["主场浪潮一阵接一阵，", "把耳朵交给草皮处理。"],
    ["东道主节奏很急，", "把防线临时钉在原地。"],
    ["现场声浪往下压，", "把传球路线写得更短。"],
  ],
  asia: [
    ["亚洲德比味道上来了，", "把每次逼抢都踢成群聊已读。"],
    ["熟人局不好踢，", "先把东亚风向压在脚下。"],
    ["熟面孔碰上熟套路，", "把球权踢成拉扯题。"],
    ["亚洲对话开场，", "把每脚球都踢得像复盘材料。"],
    ["区域熟人局升温，", "把中场争成棋盘。"],
    ["这场距离不远，", "把细节踢得很吵。"],
  ],
  underdog: [
    ["对手看着低调，", "也不敢把剧本读太快。"],
    ["这场纸面不吓人，", "先把纸面折成护身符。"],
    ["对面名气不大，", "把警惕塞进第一脚传球。"],
    ["纸面风很轻，", "仍然把门口守成考试现场。"],
    ["低调球队不好猜，", "把每次反抢都当提醒。"],
    ["这局看似温柔，", "先把算盘收进袜子里。"],
  ],
  default: [
    ["对面节奏不慢，", "先把阵脚钉住。"],
    ["比赛进入拉扯，", "把每次二点球都当开盲盒。"],
    ["场面开始拧巴，", "把中路守成单行道。"],
    ["对手传跑很勤，", "把回追写进肌肉记忆。"],
    ["比赛温度升起来，", "把每次解围都踢成标点。"],
    ["节奏来回摆动，", "把球权先系上安全绳。"],
  ],
};

const PLAYER_EVENT_LINES = {
  save: [
    ["准备扑救姿势，", "门前空气突然变厚。"],
    ["横移封角度，", "射门路线被擦成省略号。"],
    ["把重心压低，", "球门像临时多了一道锁。"],
    ["提前读到方向，", "这脚射门被写进退稿箱。"],
  ],
  block: [
    ["提前卡住线路，", "这脚进攻被写进未遂档案。"],
    ["把禁区门缝合上，", "对手只能在外面读说明书。"],
    ["横身挡在路上，", "危险传中被当场折返。"],
    ["补位补得很准，", "进攻路线撞上红灯。"],
  ],
  control: [
    ["把节奏揉慢，", "中场像临时开了棋局。"],
    ["连续分球调度，", "草皮上出现了几何课。"],
    ["用一脚转移换气，", "阵型终于喘过来。"],
    ["把球权拿稳，", "时间开始站到脚边。"],
  ],
  finish: [
    ["突然启动，", "禁区灯光像被人拧亮。"],
    ["一脚处理很锋利，", "记分牌差点提前醒来。"],
    ["抢到身前位置，", "防线慢了半拍。"],
    ["门前嗅觉上线，", "皮球像找到了地址。"],
  ],
  pace: [
    ["边路提速，", "防线开始追问人生。"],
    ["把速度拉满，", "草皮像被划出一道风。"],
    ["外线一步甩开，", "边线突然变成高速路。"],
    ["冲刺带出空当，", "看台声音被拽长。"],
  ],
  setPiece: [
    ["站到定位球前，", "人墙的哲学问题变多了。"],
    ["准备起脚，", "空气里有一点不讲理的弧线。"],
    ["把球摆正，", "禁区里开始互相点名。"],
    ["助跑距离刚好，", "门前风向被悄悄改写。"],
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

export const PLAYER_LORE_LINES_BY_NAME = {
  凯恩: {
    finish: [
      ["冠军荒旧账刚翻篇，", "这脚射门像在给奖杯补签收单。"],
      ["以前奖杯总爱迟到，", "现在门前倒是不肯再等。"],
      ["拜仁那口银盘刚到手，", "射门欲望还带着开封声。"],
    ],
    control: [
      ["回撤拿球很熟练，", "像把无冠剧本先压进抽屉。"],
      ["支点做得很稳，", "奖杯焦虑暂时交给队友保管。"],
    ],
  },
  登贝莱: {
    finish: [
      ["金球奖余温还在，", "这一下处理像巴黎夜里没散的灯。"],
      ["从巴黎欧冠线里杀出来，", "禁区门口自带颁奖典礼回声。"],
      ["金球先生突然提速，", "门将的备忘录当场过期。"],
    ],
    pace: [
      ["左右脚都像没提前通知，", "防线只能现场猜谜。"],
      ["一变向就把镜头甩开，", "巴黎那条冠军线又亮了一下。"],
    ],
    control: [
      ["把球黏在脚边，", "金球奖话题又从看台飘下来。"],
      ["节奏忽快忽慢，", "防守人像在读加密文件。"],
    ],
  },
  姆巴佩: {
    finish: [
      ["金球榜还在记账，", "这脚射门先替自己写申诉材料。"],
      ["伯纳乌快马抬头，", "禁区里没人敢眨眼。"],
      ["登贝莱的金球影子还在，", "他把答案往球门里加速。"],
    ],
    pace: [
      ["启动像把画面调成两倍速，", "防线只剩回放资格。"],
      ["一脚油门踩到底，", "边路交通规则临时失效。"],
    ],
  },
  梅西: {
    control: [
      ["最后一舞的光很轻，", "球却还听他小声安排。"],
      ["把节奏拨慢半拍，", "旧时代的钟又响了一下。"],
      ["不急着冲刺，", "足球自己先把路让出来。"],
    ],
    setPiece: [
      ["站到任意球前，", "空气自动切成左脚频道。"],
      ["助跑短得像省略号，", "人墙已经开始想往事。"],
    ],
    finish: [
      ["禁区前轻轻一拨，", "时间像被他借走两秒。"],
      ["这一下不响，", "但球门已经知道答案。"],
    ],
  },
  C罗: {
    finish: [
      ["第六届世界杯的影子拉长，", "门前本能还是准时上班。"],
      ["年龄写在资料页，", "抢点写在肌肉记忆里。"],
      ["纪录本还没合上，", "他又把笔递到球门前。"],
    ],
    pace: [
      ["冲刺不再讲年轻故事，", "但禁区嗅觉仍然很吵。"],
      ["启动幅度不大，", "镜头却还是自动跟过去。"],
    ],
  },
  亚马尔: {
    pace: [
      ["少年感还没退场，", "边路已经开始写成年人的题。"],
      ["欧洲杯纪录还热着，", "这一趟又把年龄写成脚注。"],
      ["一步晃开防守，", "身份证年龄看起来不太负责。"],
    ],
    control: [
      ["触球轻得很小，", "看台却已经开始算未来。"],
      ["把球停住那一下，", "青春风暴先收了半秒。"],
    ],
  },
  维尼修斯: {
    pace: [
      ["金球旧案还没散场，", "边路先把情绪踩成加速带。"],
      ["外线一启动，", "去年巴黎那张空椅子又被提起。"],
      ["把防线甩开，", "像给争议另开一条跑道。"],
    ],
    finish: [
      ["禁区里抬脚很狠，", "这球像在给评委席留作业。"],
      ["射门带着一点不服气，", "球网只好先听完。"],
    ],
  },
  萨拉赫: {
    finish: [
      ["英超奖杯和金靴账本都很熟，", "这脚又像在更新履历。"],
      ["左脚一摆，", "安菲尔德的旧风声差点吹到这里。"],
      ["赛季奖项还在发光，", "门前选择依旧很埃及。"],
    ],
    pace: [
      ["边路提速很安静，", "下一秒防线已经少看一页。"],
      ["把外线走成单行道，", "防守人只能补交路费。"],
    ],
  },
  哈兰德: {
    finish: [
      ["进球机器开始校准，", "禁区像进入工业模式。"],
      ["门前动作不花，", "但效率表直接爆灯。"],
      ["一抬脚像系统执行命令，", "球网负责打印结果。"],
    ],
  },
  贝林厄姆: {
    control: [
      ["双臂还没展开，", "看台已经把 Hey Jude 哼到副歌。"],
      ["中场一拿球，", "英格兰人的希望又被调高半格。"],
    ],
    finish: [
      ["后插上来得刚好，", "庆祝动作差点提前预约。"],
      ["禁区前一步到位，", "比分像在等他摆姿势。"],
    ],
  },
  莫德里奇: {
    control: [
      ["岁月从他旁边跑过，", "球还是按老路线听话。"],
      ["外脚背轻轻一弹，", "中场像被翻回经典章节。"],
      ["最后一舞不急，", "节奏先替他慢慢鞠躬。"],
    ],
    setPiece: [
      ["站到球前，", "老派弧线开始整理衣领。"],
    ],
  },
  内马尔: {
    control: [
      ["桑巴滤镜一打开，", "防守人先确认脚踝还在不在剧本里。"],
      ["脚下花活不多说，", "巴西看台已经先眨眼。"],
    ],
    finish: [
      ["伤病阴影还没散完，", "这一下倒像把灯重新拧亮。"],
      ["禁区前轻轻一晃，", "巴西十号的旧故事又冒出头。"],
    ],
    setPiece: [
      ["站到定位球前，", "桑巴弧线开始翻旧相册。"],
    ],
  },
  德布劳内: {
    control: [
      ["传球线路像提前看过地图，", "防守人还在找入口。"],
      ["一脚直塞很冷静，", "中场像被开了上帝视角。"],
    ],
    setPiece: [
      ["定位球落点很准，", "像快递单上写着禁区中央。"],
    ],
  },
  孙兴慜: {
    finish: [
      ["笑容还没出现，", "右脚先把危险寄出去。"],
      ["亚洲锋线代表一抬头，", "门将开始想远角。"],
    ],
    pace: [
      ["反击一启动，", "后卫只能在身后看背影说明书。"],
      ["边路冲起来，", "亚洲德比的温度直接上墙。"],
    ],
  },
  卢卡库: {
    finish: [
      ["门前存在感很大，", "禁区像临时被加宽。"],
      ["支点先把人扛住，", "射门再把问题扔给门将。"],
    ],
    control: [
      ["背身拿球很硬，", "防线像撞上移动路障。"],
    ],
  },
  罗德里: {
    control: [
      ["金球中场把节奏压住，", "比赛像被装进保险箱。"],
      ["站在中路不慌，", "对手的反击先被盖章退回。"],
    ],
    block: [
      ["提前站住线路，", "危险球被金球级别地没收。"],
    ],
  },
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

function getPlayerLoreCandidates(player, role) {
  return PLAYER_LORE_LINES_BY_NAME[player?.name]?.[role]?.map((item) => item.join("")) || [];
}

function normalizeLineCandidates(lines) {
  return (lines || []).map((item) => (Array.isArray(item) ? item.join("") : item));
}

function pickPlayerEventText(rng, player, role, fallbackLines, ledger) {
  const loreCandidates = getPlayerLoreCandidates(player, role);
  const fallbackCandidates = normalizeLineCandidates(fallbackLines || PLAYER_EVENT_LINES.control);
  return pickUnique(rng, [...loreCandidates, ...fallbackCandidates], ledger);
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

function normalizeVisibleText(text) {
  return String(text || "").replace(/\s+/g, " ").trim();
}

function createCopyLedger(initialTexts = []) {
  const used = new Set(initialTexts.map(normalizeVisibleText).filter(Boolean));
  return {
    has(text) {
      return used.has(normalizeVisibleText(text));
    },
    use(text) {
      const normalized = normalizeVisibleText(text);
      if (normalized) used.add(normalized);
      return text;
    },
  };
}

function pickUnique(rng, items, ledger, fallbackFactory = null) {
  const candidates = [...items];
  while (candidates.length) {
    const index = Math.floor(rng.next() * candidates.length);
    const [candidate] = candidates.splice(index, 1);
    if (!ledger?.has(candidate)) return ledger?.use(candidate) ?? candidate;
  }
  const fallback = fallbackFactory ? fallbackFactory() : items[0];
  const fallbackCandidates = Array.isArray(fallback) ? fallback : [fallback];
  for (const candidate of fallbackCandidates) {
    if (!ledger?.has(candidate)) return ledger?.use(candidate) ?? candidate;
  }
  return ledger?.use(fallbackCandidates[0]) ?? fallbackCandidates[0];
}

function createRichTextLedger(lines = []) {
  const initialTexts = [];
  for (const line of lines) {
    for (const item of line.parts || []) {
      if (item.kind === PART_KIND.TEXT || item.kind === PART_KIND.SYSTEM) {
        const text = normalizeVisibleText(item.text);
        if (text.length >= 6) initialTexts.push(text);
      }
    }
  }
  return createCopyLedger(initialTexts);
}

export function createCommentaryLedger(lines = []) {
  return createRichTextLedger(lines);
}

function uniquePart(ledger, rng, candidates, kind = PART_KIND.TEXT, fallbackFactory = null) {
  return part(pickUnique(rng, candidates, ledger, fallbackFactory), kind);
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

function makeGoalLines({ match, opponent, rng, baseId, ledger }) {
  const goalTimes = ["13’", "24’", "36’", "45+1’", "53’", "64’", "76’", "88’", "90+3’", "90+5’", "90+7’", "90+9’", "90+11’", "90+13’"];
  const chinaGoalTexts = [
    ["反击终于跑通，", "把球推进网窝。"],
    ["定位球砸进人堆，", "皮球像被宇宙推了一把。"],
    ["禁区前低射穿过腿林，", "门将只摸到了风。"],
    ["混战里抢到第二落点，", "替补席先蹦起来再确认比分。"],
    ["边路传中绕过人群，", "门前终于有人把答案写上。"],
    ["中路直塞突然生效，", "皮球钻进一条没人相信的路。"],
    ["远射擦着草皮过去，", "球网被低声叫醒。"],
    ["角球落点刚好，", "比分像被谁轻轻推了一下。"],
    ["补射赶在混乱前完成，", "门线这次没来得及装睡。"],
    ["反抢之后立刻起脚，", "对手后场还没读完题。"],
    ["前插踩到最吵的位置，", "比分被硬生生拽起来。"],
    ["禁区里抢出半个身位，", "皮球从人缝里找到出口。"],
    ["横传扫到门前，", "这一脚把混乱翻译成进球。"],
    ["门前第二反应很快，", "球网没来得及拒收。"],
    ["倒三角传回禁区，", "射门把答案写得很大声。"],
    ["后点包抄终于赶到，", "记分牌又被叫醒一次。"],
    ["中路撞墙配合打穿，", "对手防线当场少看一页。"],
    ["小角度硬是挤进去，", "球门像被开了一条暗门。"],
    ["乱战里先伸出一脚，", "比分在草皮上突然翻身。"],
    ["禁区弧顶抡出一脚，", "皮球贴着风钻进角落。"],
    ["门将扑出第一下，", "第二点马上把悬念补进去。"],
    ["边路低平球穿过去，", "门前这次没有浪费奇迹。"],
    ["前场连续压迫奏效，", "对手出球被直接改成助攻。"],
    ["反越位跑成了，", "单刀把心跳推到看台顶上。"],
    ["定位球二次进攻续上，", "禁区里的算盘又响了一声。"],
  ];
  const opponentGoalTexts = [
    ["压上后抓住空当，", "现实服警报短暂响起。"],
    ["远射折线入网，", "门柱这次选择旁观。"],
    ["边路传中造成混乱，", "比分把心率往上拽了一格。"],
    ["前场逼抢得手，", "解说席开始翻安慰词。"],
    ["禁区前找到空隙，", "皮球把场面重新拧紧。"],
    ["后点突然杀出，", "中国队防线慢了半拍。"],
    ["定位球落到危险区，", "比分被对面补上一笔。"],
    ["反击一路推到门前，", "现实感又敲了一下门。"],
    ["门前补射跟得很快，", "领先优势被迫重新计算。"],
    ["中路直塞穿过防线，", "门将只能和球网对视。"],
  ];
  const fallbackGoalTexts = [
    ({ sideName }) => `${sideName}又把门前混乱整理成进球，比分牌继续加班。`,
    ({ sideName }) => `${sideName}这次没有讲铺垫，直接把球塞进网窝。`,
    ({ sideName }) => `${sideName}在最拥挤的地方找到出口，看台声音又高一层。`,
    ({ sideName }) => `${sideName}把一次半机会踢成整分，门线只好认账。`,
    ({ sideName }) => `${sideName}抢到最后一下，皮球带着省略号滚进门里。`,
    ({ sideName }) => `${sideName}把禁区里的乱流踩住，下一秒比分改写。`,
    ({ sideName }) => `${sideName}这脚处理很硬，球网被迫接收新证据。`,
    ({ sideName }) => `${sideName}在门前补上关键一笔，比赛温度继续上升。`,
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
    const goalPool = isChina ? chinaGoalTexts : PLAYER_GOAL_EVENT_LINES[role] || opponentGoalTexts;
    const text = pickUnique(
      rng,
      isChina
        ? goalPool.map((item) => item.join(""))
        : [...getPlayerLoreCandidates(scorer, role), ...goalPool.map((item) => item.join(""))],
      ledger,
      () => fallbackGoalTexts.map((template) => template({ sideName: isChina ? "中国队" : opponent.name })),
    );
    const scoreText = `${chinaScore}:${opponentScore}`;

    return richLine(
      `${baseId}-goal-${index}`,
      [
        part(goalTimes[index] || "90+5’", PART_KIND.TIME),
        part(scorer.name, PART_KIND.PLAYER),
        part(text),
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

export function generateMatchCommentary({ match, opponent, attributes, roundLabel, rng, ledger = null }) {
  const copyLedger = ledger || createCopyLedger();
  const dominant = getDominantAttribute(attributes);
  const styleLines = STYLE_LINES[dominant] || STYLE_LINES.midfield;
  const luck = Number(attributes.luck) || 0;
  const chinaPlayer = pickPlayerByRole(rng, { code: "cn", name: "中国队" }, ["block", "save", "control"]);
  const opponentTier = getOpponentTier(opponent);
  const opponentTierPool = OPPONENT_TIER_LINES[opponentTier] || OPPONENT_TIER_LINES.default;
  const opponentStar = pickPlayerByRole(rng, opponent, ["finish", "control", "pace", "setPiece"]);
  const starRole = pickRoleForPlayer(rng, opponentStar, ["finish", "control", "pace", "setPiece"]);
  const starText = pickPlayerEventText(rng, opponentStar, starRole, PLAYER_EVENT_LINES[starRole] || PLAYER_EVENT_LINES.control, copyLedger);
  const styleA = pickUnique(rng, styleLines.map((item) => item.join("")), copyLedger);
  const styleB = luck >= 6 ? pickUnique(rng, LUCK_LINES.map((item) => item.join("")), copyLedger) : null;
  const isWin = match.chinaGoals > match.opponentGoals || (match.penalties && match.penalties[0] > match.penalties[1]);
  const isDraw = match.chinaGoals === match.opponentGoals && !match.penalties;
  const scoreShape = getScoreShape(match, isWin);
  const finalText = pickUnique(
    rng,
    isWin
      ? scoreShape === "penalty"
        ? ["哨响  点球点上也能种出奇迹", "哨响  十二码也认了这条线", "哨响  点球点开出一朵怪花"]
        : ["哨响  这一关硬是过去了", "哨响  门缝里挤出下一轮", "哨响  梦又多续了一集", "哨响  记分牌批准通行", "哨响  胜利从边线挤进来", "哨响  下一页剧本被硬翻开"]
      : isDraw
        ? ["哨响  算分器还活着", "哨响  积分题还没交卷", "哨响  两边各拿一半悬念"]
        : ["哨响  这条宇宙线开始漏风", "哨响  剧本写到这里先停笔", "哨响  现实把门轻轻带上"],
    copyLedger,
  );
  const baseId = match.id || roundLabel;
  const goalLines = makeGoalLines({ match, opponent, rng, baseId, ledger: copyLedger });
  const startCopies = [
    "开场，中国队先试探，",
    "开局几分钟，中国队把节奏放低，",
    "哨声刚落，中国队先摸清风向，",
    "比赛起步，中国队没有急着摊牌，",
    "前十分钟，中国队先把阵脚钉住，",
    "开场阶段，中国队把呼吸放平，",
  ];
  const startOpponentCopies = [
    "把阵型往前压。",
    "先把中线往前推。",
    "试着把节奏压到中国队半场。",
    "一上来就把边路铺开。",
    "用控球把场面慢慢挤过来。",
    "先把压迫摆在门口。",
  ];
  const playerActionCopies = [
    "完成关键处理，",
    "把危险球拆掉，",
    "在要紧位置补上一脚，",
    "把节奏从火里捞出来，",
    "用一次处理稳住场面，",
    "把麻烦从禁区边上拎走，",
  ];
  const playerOutcomeCopies = [
    "节奏被迫降下来。",
    "攻势被暂时折回去。",
    "这一段压力先被扣住。",
    "禁区门口终于安静一点。",
    "比赛温度被按低半格。",
    "这一口险气被暂时吞回去。",
  ];
  const lateWinCopies = [
    "把最后几分钟踢成防灾演练，",
    "把补时守成一张密封袋，",
    "把禁区站成临时避难所，",
    "把每次传中都拆成零件，",
    "把禁区守成一页密密麻麻的批注，",
    "把最后的风声挡在门外，",
  ];
  const lateLoseCopies = [
    "还在往前压，",
    "继续把球往禁区送，",
    "没有把进攻键松开，",
    "把最后一点力气推上去，",
    "把希望往前场又搬了一步，",
    "继续向禁区里递问题，",
  ];
  const opponentLateWinCopies = [
    "连续传中都被挡出。",
    "最后几脚没找到门缝。",
    "围到门前也没拿到答案。",
    "把压迫写成了省略号。",
    "最后一次落点被顶出危险区。",
    "门前答案始终没有出现。",
  ];
  const opponentLateLoseCopies = [
    "禁区里全是人影。",
    "后场风声越吹越紧。",
    "门前混乱还没散。",
    "防线被迫继续答题。",
    "每个落点都像临时考试。",
    "禁区边缘还在冒烟。",
  ];

  const lines = [
    richLine(`${baseId}-start`, [
      part("08’", PART_KIND.TIME),
      part(roundLabel),
      uniquePart(copyLedger, rng, startCopies),
      part("中国队", PART_KIND.TEAM),
      part(opponent.name, PART_KIND.TEAM),
      uniquePart(copyLedger, rng, startOpponentCopies),
    ]),
    richLine(`${baseId}-style-a`, [
      part("18’", PART_KIND.TIME),
      part("中国队", PART_KIND.TEAM),
      part(styleA),
    ]),
    richLine(`${baseId}-pressure`, [
      part("29’", PART_KIND.TIME),
      part(opponent.name, PART_KIND.TEAM),
      part(pickUnique(rng, opponentTierPool.map((item) => item.join("中国队")), copyLedger)),
    ]),
    ...goalLines.slice(0, 3),
    richLine(`${baseId}-player`, [
      part("58’", PART_KIND.TIME),
      part(chinaPlayer.name, PART_KIND.PLAYER),
      uniquePart(copyLedger, rng, playerActionCopies),
      part(opponent.name, PART_KIND.TEAM),
      uniquePart(copyLedger, rng, playerOutcomeCopies),
    ]),
    richLine(`${baseId}-opponent-star`, [
      part("66’", PART_KIND.TIME),
      part(opponentStar.name, PART_KIND.PLAYER),
      part(starText),
      part("中国队", PART_KIND.TEAM),
      uniquePart(copyLedger, rng, [
        "暂时把剧本压住。",
        "把这波危险先按住。",
        "没有让场面滑出去。",
        "把门前风向拽回来。",
        "把危险先压到草皮下面。",
        "让这波声浪没能起飞。",
      ]),
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
        uniquePart(copyLedger, rng, [
          "射门擦柱而出，比分没动，大家的血压先动了。",
          "一脚低射偏出，记分牌装作什么都没发生。",
          "门前混战没进，替补席的半声欢呼被收回。",
          "远射高出横梁，天空短暂接管比赛。",
          "小角度打门被挡，球迷把叹气咽回去。",
          "反击最后一传偏深，机会从鞋尖滑走。",
        ]),
      ]),
    );
  }

  if (styleB) {
    lines.push(
      richLine(`${baseId}-luck`, [
        part("72’", PART_KIND.TIME),
        part("幸运值", PART_KIND.SYSTEM),
        part("开始上班，"),
        part(styleB),
      ]),
    );
  }

  lines.push(
    richLine(`${baseId}-late-save`, [
      part("86’", PART_KIND.TIME),
      part("中国队", PART_KIND.TEAM),
      part(pickUnique(rng, isWin ? lateWinCopies : lateLoseCopies, copyLedger)),
      part(opponent.name, PART_KIND.TEAM),
      part(pickUnique(rng, isWin ? opponentLateWinCopies : opponentLateLoseCopies, copyLedger)),
    ]),
  );

  if (match.penalties) {
    lines.push(
      richLine(
        `${baseId}-penalty`,
        [
          part("点球", PART_KIND.SYSTEM),
          part(pickUnique(rng, [
            "大战结束，记分牌补上一行：",
            "十二码之后，屏幕又加了一笔：",
            "点球点收工，比分旁边写着：",
            "最后的心理战落幕，数字补成：",
            "门将和射手都喘完气，结果追加：",
          ], copyLedger)),
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
        part(pickUnique(rng, [
          "最后一波冲击结束，记分牌写成",
          "补时的风终于停下，比分停在",
          "全场最后一次喘气之后，数字定格为",
          "终场前的混乱散开，屏幕留下",
          "草皮把最后一脚吞下，比分留作",
          "裁判把哨声举起，结果写成",
        ], copyLedger)),
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
  const rng = {
    nextIndex: 0,
    next() {
      this.nextIndex += 1;
      return ((this.nextIndex * 0.61803398875) % 1);
    },
  };
  const ledger = createCopyLedger();
  const kickoffCopies = [
    "，解说席先把计算器摆正。",
    "，看台开始复习排列组合。",
    "，替补席把心跳调成省电模式。",
    "，积分榜在旁边假装冷静。",
    "，赛程表像刚收到临时通知。",
    "，球迷先把呼吸存在草稿箱。",
  ];
  const shapeCopies = [
    "塞进比赛节奏里。",
    "踢成了临场说明书。",
    "拧成一把不太讲理的钥匙。",
    "铺成一张小型战术地图。",
    "写进这场的临时注脚。",
    "搬到中圈附近开现场会。",
  ];
  const starPressureCopies = [
    "把这段压力先存档。",
    "把镜头里的风声压低。",
    "把危险暂时塞回边线。",
    "把对方节奏按进暂停键。",
    "把最后一页剧本攥住。",
    "把这口气先咽进队徽里。",
  ];
  const starIntroCopies = [
    "被镜头点名，",
    "刚一拿球，",
    "把节奏抬起来，",
    "在边线附近亮相，",
    "让看台突然起声，",
    "把防线看得一紧，",
  ];
  const swingIntroCopies = [
    "制造险情，",
    "把禁区搅热，",
    "压出一次混乱，",
    "送出一脚威胁，",
    "让门前风向一变，",
    "把中国队心率拎高，",
  ];
  const swingCopies = [
    "短暂沉默，宇宙线继续加载。",
    "低头画线，草皮先别说话。",
    "看了又看，比分牌假装路过。",
    "举手示意，心率图开始写草书。",
    "把哨子含住，现场进入省略号。",
    "翻完规则，命运暂时没有签收。",
  ];

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
      const preferredRoles = index === 0 ? ["finish", "pace"] : index === 1 ? ["control", "setPiece"] : ["save", "block"];
      const star = pickPlayerByRole(
        { next: () => ((index + 1) * 0.271828) % 1 },
        opponent,
        preferredRoles,
      );
      const starRole = pickRoleForPlayer(rng, star, preferredRoles);
      return [
        richLine(`transition-group-${index}-kickoff`, [
          part(`${12 + index * 19}’`, PART_KIND.TIME),
          part("中国队", PART_KIND.TEAM),
          part("对上"),
          part(opponent.name, PART_KIND.TEAM),
          uniquePart(ledger, rng, kickoffCopies),
        ]),
        richLine(`transition-group-${index}-shape`, [
          part(`${22 + index * 17}’`, PART_KIND.TIME),
          part("中国队", PART_KIND.TEAM),
          part("把"),
          part(dominantText, PART_KIND.SYSTEM),
          uniquePart(ledger, rng, shapeCopies),
        ]),
        richLine(`transition-group-${index}-star`, [
          part(`${28 + index * 13}’`, PART_KIND.TIME),
          part(star.name, PART_KIND.PLAYER),
          part(pickPlayerEventText(rng, star, starRole, starIntroCopies, ledger)),
          part("中国队", PART_KIND.TEAM),
          uniquePart(ledger, rng, starPressureCopies),
        ], {
          playerEvent: {
            name: star.name,
            teamCode: opponent.code,
            role: starRole,
          },
        }),
        richLine(`transition-group-${index}-swing`, [
          part(`${39 + index * 13}’`, PART_KIND.TIME),
          part(opponent.name, PART_KIND.TEAM),
          uniquePart(ledger, rng, swingIntroCopies),
          part("VAR", PART_KIND.SYSTEM),
          uniquePart(ledger, rng, swingCopies),
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

function getGroupMatchShape(match) {
  if (match.chinaGoals > match.opponentGoals) {
    if (match.opponentGoals === 0) return "cleanWin";
    if (match.chinaGoals - match.opponentGoals >= 2) return "wideWin";
    return "narrowWin";
  }
  if (match.chinaGoals === match.opponentGoals) {
    if (match.chinaGoals >= 2) return "highDraw";
    return "draw";
  }
  if (match.opponentGoals - match.chinaGoals === 1) return "narrowLoss";
  return "loss";
}

function makeGroupMatchDetails({ chinaMatches = [], attributes, rng, ledger }) {
  const dominant = getDominantAttribute(attributes);
  const dominantDetail = {
    attack: "前场",
    defense: "后场",
    midfield: "中场",
    stamina: "补时",
    tactics: "战术板",
  }[dominant] || "中场";
  const luckTone = getLuckTone(attributes);
  const luckDetail = {
    none: "全靠硬踢",
    mild: "幸运偶尔探头",
    high: "门柱开始端水",
    absurd: "宇宙线亲自递纸条",
  }[luckTone];
  const templates = {
    cleanWin: [
      ({ opponent }) => `零封${opponent.name}  ${dominantDetail}把门栓焊住`,
      ({ opponent }) => `${opponent.name}没敲开门  中国队偷到一口仙气`,
      ({ opponent }) => `对${opponent.name}守到发光  记分牌很懂事`,
    ],
    wideWin: [
      ({ opponent }) => `赢${opponent.name}赢出回声  ${luckDetail}`,
      ({ opponent }) => `${opponent.name}防线短路  中国队顺手捡分`,
      ({ opponent }) => `这场踢得不讲常识  ${opponent.name}还在加载`,
    ],
    narrowWin: [
      ({ opponent }) => `险胜${opponent.name}  最后一脚像签了保密协议`,
      ({ opponent }) => `对${opponent.name}一球过关  心率比比分更忙`,
      ({ opponent }) => `${opponent.name}压到门口  中国队把门牌攥住`,
    ],
    highDraw: [
      ({ opponent }) => `和${opponent.name}互相漏风  但积分还能呼吸`,
      ({ opponent }) => `${opponent.name}打得很热闹  中国队把分拿走一半`,
      ({ opponent }) => `对${opponent.name}进球互递  算分器笑得很勉强`,
    ],
    draw: [
      ({ opponent }) => `平${opponent.name}  场面像两边都在等批复`,
      ({ opponent }) => `和${opponent.name}各退一步  积分榜没翻脸`,
      ({ opponent }) => `${opponent.name}也没赢  中国队把悬念留住`,
    ],
    narrowLoss: [
      ({ opponent }) => `小负${opponent.name}  输球但没把门摔上`,
      ({ opponent }) => `${opponent.name}只赢一口气  中国队还留尾巴`,
      ({ opponent }) => `差${opponent.name}一球  算分器继续装睡`,
    ],
    loss: [
      ({ opponent }) => `被${opponent.name}按住一场  只能靠后两轮补命`,
      ({ opponent }) => `${opponent.name}先把现实拉回来  梦还没删档`,
      ({ opponent }) => `输给${opponent.name}  但小组剧本还没合上`,
    ],
  };

  return chinaMatches.map((match, index) => {
    const shape = getGroupMatchShape(match);
    const pool = templates[shape] || templates.draw;
    const candidates = pool.map((template) => compact(template({ match, opponent: match.opponent, index }), COMPACT_COPY_LIMITS.groupMatchDetail));
    return pickUnique(rng, candidates, ledger, () => compact(`第${index + 1}场${match.opponent.name}  ${makeScoreText(match)}把悬念留住`, COMPACT_COPY_LIMITS.groupMatchDetail));
  });
}

export function generateRunCopy({ result, selectedTeam, chinaGroup, chinaMatches, knockout, attributes, rng, initialLines = [] }) {
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
  const ledger = createRichTextLedger(initialLines);
  const heroTitle = pickUnique(rng, titlePool, ledger);
  const heroNote = pickUnique(rng, notePool, ledger);
  const groupMatchDetails = makeGroupMatchDetails({ chinaMatches, attributes, rng, ledger });
  const matchNote = pickUnique(rng, matchNotePool, ledger);
  const finalOpponent = knockout?.rounds?.at(-1)?.opponent;
  const pathFinalNote = result === "champion"
    ? `${finalOpponent?.name || "对手"}看完比分  想申请重开宇宙`
    : `${finalOpponent?.name || selectedTeam.name}看完战报  也说这线挺累`;
  const knockoutResultNote = pickUnique(rng, knockoutNotePool, ledger);
  const advancementHint = pickUnique(rng, advanced ? ["席位已盖章", "下一关已开门", "梦还在加载"] : ["本局准备结算", "梦先存档", "下局再开球"], ledger);
  const settlementHeroNote = result === "champion"
    ? pickUnique(rng, ["本局建议收藏  现实服暂未同步", "请截图留证  宇宙线很少加班", "这条线先供起来  别问科学"], ledger)
    : pickUnique(rng, [`${chinaStanding?.points ?? 0}分宇宙线  下局再补课`, "这局先合卷  下次换支笔", "现实吹哨  但重开键还亮着"], ledger);

  return {
    groupHeroTitle: compact(heroTitle, COMPACT_COPY_LIMITS.groupHeroTitle),
    groupHeroNote: compact(heroNote, COMPACT_COPY_LIMITS.groupHeroNote),
    groupMatchesNote: compact(matchNote, COMPACT_COPY_LIMITS.groupMatchesNote),
    groupMatchDetails,
    groupStatus: advanced ? "晋级 32 强" : "小组赛出局",
    groupBadge: advanced ? "压线活了" : "小组出局",
    groupNextCta: advanced ? "进入 32 强：梦还没醒" : "查看本局结算",
    knockoutResultNote,
    advancementHint: compact(advancementHint, COMPACT_COPY_LIMITS.advancementHint),
    settlementHeroTitle: result === "champion" ? "世界杯冠军！" : "梦醒了！",
    settlementHeroCopy: result === "champion" ? "中国队历史首次夺得世界杯冠军" : "请先别关机  宇宙线还在加载下一条",
    settlementHeroNote: compact(settlementHeroNote, COMPACT_COPY_LIMITS.settlementHeroNote),
    pathFinalNote: compact(pathFinalNote, COMPACT_COPY_LIMITS.pathFinalNote),
  };
}
