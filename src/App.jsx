import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import QRCode from "qrcode";
import { toPng } from "html-to-image";
import {
  ArrowRight,
  ChevronLeft,
  Copy,
  Download,
  HelpCircle,
  Minus,
  Music,
  Plus,
  RotateCcw,
  Trophy,
} from "lucide-react";
import { getSettlementCharacterAsset } from "./characterAssets";
import { simulateWorldCupRun } from "./game/simulation";
import { GROUPS as GAME_GROUPS } from "./game/teams";
import { track } from "./telemetry";

gsap.registerPlugin(useGSAP);

const ATTRIBUTE_TOTAL = 30;
const ATTRIBUTE_MIN = 0;
const ATTRIBUTE_MAX = 10;
const TRANSITION_TOTAL_MS = 30000;
const TRANSITION_SETTLE_MS = 3000;
const TRANSITION_LINE_INTERVAL_MS = 1700;
const TRANSITION_FAST_LINE_INTERVAL_MS = 500;
const KNOCKOUT_REPORT_LINE_INTERVAL_MS = 700;

const ATTRIBUTES = [
  { key: "attack", label: "锋线火力", color: "#ff3b30", asset: "/assets/attribute/attack.png" },
  { key: "defense", label: "铁桶防线", color: "#2f80ed", asset: "/assets/attribute/defense.png" },
  { key: "midfield", label: "中场脑子", color: "#43bf55", asset: "/assets/attribute/midfield.png" },
  { key: "stamina", label: "体能韧性", color: "#ff9f1c", asset: "/assets/attribute/stamina.png" },
  { key: "tactics", label: "战术整活", color: "#7c3aed", asset: "/assets/attribute/tactics.png" },
  { key: "luck", label: "幸运值", color: "#16b8a6", asset: "/assets/attribute/luck.png" },
];

const PRESETS = [
  { name: "真·六边形", values: [5, 5, 5, 5, 5, 5] },
  { name: "铁桶苟住流", values: [2, 10, 5, 7, 4, 2] },
  { name: "玄学大师流", values: [3, 3, 4, 3, 7, 10] },
];

const team = (code, flag, name) => ({ code, flag, name });

const GROUPS = GAME_GROUPS;
const PREVIEW_SELECTED_TEAM = { code: "jp", flag: "🇯🇵", name: "日本", group: "F" };

const TEAM_DISPLAY_NAMES = {
  阿尔及利亚: "阿尔及",
  "刚果（金）": "刚果金",
  哥斯达黎加: "哥斯达",
};

function getCompactScoreTeamName(name) {
  return TEAM_DISPLAY_NAMES[name] || name;
}

const GROUP_ADVANCE_PREVIEW = {
  A: "墨西哥 / 韩国",
  B: "瑞士 / 加拿大",
  C: "巴西 / 摩洛哥",
  D: "美国 / 澳大利亚",
  E: "德国 / 科特迪瓦",
  F: "荷兰 / 日本",
  G: "比利时 / 埃及",
  H: "西班牙 / 沙特",
  I: "法国 / 塞内加尔",
  J: "阿根廷 / 奥地利",
  K: "葡萄牙 / 哥伦比亚",
  L: "英格兰 / 克罗地亚",
};

const transitionPart = (text, kind = "text") => ({ text, kind });
const transitionLine = (id, parts) => ({ id, parts });
const t = (text) => transitionPart(text);
const time = (text) => transitionPart(text, "time");
const teamName = (text) => transitionPart(text, "team");
const playerName = (text) => transitionPart(text, "player");
const systemTag = (text) => transitionPart(text, "system");
const score = (text) => transitionPart(text, "score");

function renderRichParts(line) {
  const nodes = [];

  for (let partIndex = 0; partIndex < line.parts.length; partIndex += 1) {
    const part = line.parts[partIndex];
    const nextPart = line.parts[partIndex + 1];

    if (part.kind === "text" && nextPart?.kind === "score" && part.text.length > 0) {
      const keepLength = Math.min(8, part.text.length);
      const head = part.text.slice(0, -keepLength);
      const tail = part.text.slice(-keepLength);

      if (head) {
        nodes.push(<span key={`${line.id}-${partIndex}-head`}>{head}</span>);
      }

      nodes.push(
        <span className="score-keep-group" key={`${line.id}-${partIndex}-score-group`}>
          <span>{tail}</span>
          <span className="feed-part-score">{nextPart.text}</span>
        </span>,
      );
      partIndex += 1;
      continue;
    }

    nodes.push(
      <span className={cx(part.kind !== "text" && `feed-part-${part.kind}`)} key={`${line.id}-${partIndex}`}>
        {part.text}
      </span>,
    );
  }

  return nodes;
}

function getTransitionLines(selectedTeam) {
  const group = GROUPS.find((item) => item.id === selectedTeam.group) || GROUPS[5];
  const groupNames = group.teams.map((team) => (team.name === selectedTeam.name ? "中国队" : team.name));
  const opponents = group.teams.filter((team) => team.name !== selectedTeam.name).map((team) => team.name);

  return [
    transitionLine("mishap-shoes", [
      teamName(`${selectedTeam.name}队`),
      t("把全队球鞋寄到了隔壁训练营，工作人员决定先把锅留给物流。"),
    ]),
    transitionLine("door-sign", [
      t("更衣室门牌被重新贴上："),
      teamName("中国队"),
      t("。门口保安看了一眼名单，选择相信平行宇宙。"),
    ]),
    transitionLine("group-refresh", [
      teamName(`${group.id} 组`),
      t("名单刷新："),
      ...groupNames.flatMap((name, index) => [
        teamName(name),
        t(index === groupNames.length - 1 ? "。" : "、"),
      ]),
    ]),
    transitionLine("match1-start", [
      time("08’"),
      teamName("中国队"),
      t("先把紧张踢出边线，"),
      teamName(opponents[0]),
      t("替补席开始研究这到底是哪门子战术。"),
    ]),
    transitionLine("match1-goal-a", [
      time("23’"),
      teamName(opponents[0]),
      t("门将看了一眼天气预报，球从腋下漏进网窝。"),
      score("0:1"),
      t("。"),
    ]),
    transitionLine("match1-goal-cn", [
      time("41’"),
      playerName("武磊"),
      t("前插破门，"),
      systemTag("VAR"),
      t("画线画到怀疑人生。"),
      score("中国队 1:1"),
      t("。"),
    ]),
    transitionLine("match1-final", [
      time("90+4’"),
      systemTag("终场"),
      t("："),
      score(`中国队 1:2 ${getCompactScoreTeamName(opponents[0])}`),
    ]),
    transitionLine("match2-start", [
      time("17’"),
      t("第二场开局，"),
      teamName(opponents[1]),
      t("边卫按"),
      playerName("姆巴佩"),
      t("速度预判，结果防到了空气。"),
    ]),
    transitionLine("match2-goal-cn", [
      time("57’"),
      playerName("张玉宁"),
      t("头球蹭进，解说席集体寻找是谁把重力调低了。"),
      score("中国队 1:0"),
      t("。"),
    ]),
    transitionLine("match2-equalizer", [
      time("78’"),
      teamName(opponents[1]),
      t("远射折线入网，门柱表示这球不归它管。"),
      score("1:1"),
      t("。"),
    ]),
    transitionLine("match2-final", [
      time("90+6’"),
      systemTag("终场"),
      t("："),
      score(`中国队 1:1 ${getCompactScoreTeamName(opponents[1])}`),
    ]),
    transitionLine("match3-start", [
      time("12’"),
      t("第三场，"),
      teamName(opponents[2]),
      t("研究中文菜单点了一份越位套餐，先声夺人。"),
      score("0:1"),
      t("。"),
    ]),
    transitionLine("match3-equalizer", [
      time("66’"),
      teamName("中国队"),
      t("角球制造混乱，球在禁区开了三次会才进门。"),
      score("1:1"),
      t("。"),
    ]),
    transitionLine("match3-winner", [
      time("89’"),
      teamName("中国队"),
      t("远射击中门柱内侧弹进，门柱今天只收会员。"),
      score("中国队 2:1"),
      t("。"),
    ]),
    transitionLine("match3-final", [
      time("90+5’"),
      systemTag("终场"),
      t("："),
      score(`中国队 2:1 ${getCompactScoreTeamName(opponents[2])}`),
    ]),
    transitionLine("group-summary", [
      teamName("中国队"),
      t("小组赛结算："),
      score("1 胜 1 平 1 负，积 4 分"),
      t("。数学还没放弃，宇宙也没来得及关门。"),
    ]),
    transitionLine("group-ready", [
      t("小组赛总览已生成，"),
      teamName("中国队"),
      t("压线晋级，评论区请先把计算器放下。"),
    ]),
  ];
}

const KNOCKOUT_ROUNDS = [
  {
    title: "32 强战",
    status: "晋级 16 强",
    next: "进入 16 强  梦继续做",
    opponent: { code: "co", name: "哥伦比亚" },
    score: [2, 1],
    commentary: [
      transitionLine("ko32-12", [time("12’"), teamName("哥伦比亚"), t("先声夺人，解说席开始翻找安慰词。")]),
      transitionLine("ko32-24", [time("24’"), teamName("中国队"), t("边路传中，球先找到了广告牌。")]),
      transitionLine("ko32-31", [time("31’"), teamName("中国队"), t("中场突然开窍，传球像终于连上 Wi-Fi。")]),
      transitionLine("ko32-44", [time("44’"), playerName("门将"), t("飞身扑救，顺手把心率也扑回来了。")]),
      transitionLine("ko32-54", [time("54’"), systemTag("定位球"), t("开出，全场都没看懂，球进了。")]),
      transitionLine("ko32-63", [time("63’"), teamName("哥伦比亚"), t("连续压上，禁区开始变成早高峰。")]),
      transitionLine("ko32-72", [time("72’"), teamName("哥伦比亚"), t("单刀打偏，门柱偷偷松了一口气。")]),
      transitionLine("ko32-79", [time("79’"), teamName("哥伦比亚"), t("换上前锋，替补席像刚接到催单。")]),
      transitionLine("ko32-83", [time("83’"), systemTag("VAR"), t("沉默三秒，"), systemTag("裁判"), t("表示屏幕也需要冷静。")]),
      transitionLine("ko32-88", [time("88’"), teamName("中国队"), t("反击破门，比分来到"), score("2:1")]),
      transitionLine("ko32-90", [time("90+2’"), t("最后一脚长传飞出边线，大家都假装这是战术。")]),
      transitionLine("ko32-final", [systemTag("终场"), t("哨响  梦还在  大家先别醒")]),
    ],
  },
  {
    title: "16 强战",
    status: "晋级 8 强",
    next: "进入 8 强  这集还没完",
    opponent: { code: "nl", name: "荷兰" },
    score: [1, 0],
    commentary: [
      transitionLine("ko16-9", [time("9’"), teamName("荷兰"), t("控球像橙色潮水，"), teamName("中国队"), t("先把门锁上。")]),
      transitionLine("ko16-17", [time("17’"), playerName("边后卫"), t("解围踢出弧线，像给比赛加了滤镜。")]),
      transitionLine("ko16-26", [time("26’"), playerName("门将"), t("完成神扑，顺手把热搜也扑了出去。")]),
      transitionLine("ko16-39", [time("39’"), teamName("荷兰"), t("远射偏出，解说席终于敢喝水。")]),
      transitionLine("ko16-51", [time("51’"), teamName("中国队"), t("反击只有三脚，第三脚居然真进了。"), score("1:0")]),
      transitionLine("ko16-58", [time("58’"), teamName("荷兰"), t("加快节奏，"), teamName("中国队"), t("开始全员做选择题。")]),
      transitionLine("ko16-66", [time("66’"), teamName("荷兰"), t("开始围攻，禁区像早高峰地铁口。")]),
      transitionLine("ko16-74", [time("74’"), teamName("荷兰"), t("远射擦柱而出，门柱今天立功两次。")]),
      transitionLine("ko16-81", [time("81’"), teamName("中国队"), t("全员退守，草皮都被站成了五后卫。")]),
      transitionLine("ko16-90", [time("90+3’"), systemTag("补时角球"), t("被顶出去，宇宙深吸一口气。")]),
      transitionLine("ko16-95", [time("90+5’"), systemTag("裁判"), t("看表，"), teamName("中国队"), t("全队一起帮他看表。")]),
      transitionLine("ko16-final", [systemTag("终场"), t("哨响  这场苟得很专业")]),
    ],
  },
  {
    title: "1/4 决赛",
    status: "晋级半决赛",
    next: "进入半决赛  别眨眼",
    opponent: { code: "fr", name: "法国" },
    score: [2, 1],
    commentary: [
      transitionLine("koqf-18", [time("18’"), teamName("法国"), t("速度拉满，"), teamName("中国队"), t("后卫申请开导航。")]),
      transitionLine("koqf-25", [time("25’"), teamName("中国队"), t("第一次射门，球迷先确认是不是回放。")]),
      transitionLine("koqf-37", [time("37’"), playerName("中场"), t("突然直塞，"), teamName("法国"), t("防线短暂掉线。")]),
      transitionLine("koqf-49", [time("49’"), teamName("法国"), t("反击打穿边路，"), playerName("门将"), t("出来得像打卡上班。")]),
      transitionLine("koqf-58", [time("58’"), teamName("法国"), t("扳平比分，解说席开始复读冷静。"), score("1:1")]),
      transitionLine("koqf-70", [time("70’"), teamName("中国队"), t("换人，替补席表情像知道剧本。")]),
      transitionLine("koqf-79", [time("79’"), systemTag("幸运值"), t("下场踢后腰，门柱挡出必进球。")]),
      transitionLine("koqf-82", [time("82’"), teamName("法国"), t("连续传中，禁区像被按了刷新键。")]),
      transitionLine("koqf-84", [time("84’"), teamName("中国队"), playerName("门将"), t("没说话，但手套已经开始发光。")]),
      transitionLine("koqf-86", [time("86’"), teamName("中国队"), t("禁区混战破门，比分变成"), score("2:1")]),
      transitionLine("koqf-91", [time("90+1’"), teamName("法国"), t("最后一攻偏出，宇宙把门悄悄关上。")]),
      transitionLine("koqf-final", [systemTag("终场"), t("哨响  平行宇宙开始认真了")]),
    ],
  },
  {
    title: "半决赛",
    status: "晋级决赛",
    next: "进入决赛  宇宙屏住呼吸",
    opponent: { code: "ar", name: "阿根廷" },
    score: [2, 1],
    commentary: [
      transitionLine("kosf-7", [time("7’"), teamName("阿根廷"), t("先控节奏，"), teamName("中国队"), t("先控心率。")]),
      transitionLine("kosf-15", [time("15’"), teamName("中国队"), t("抢断成功，替补席先鼓掌再确认。")]),
      transitionLine("kosf-22", [time("22’"), teamName("中国队"), systemTag("定位球"), t("整活，战术板本人也没看懂。")]),
      transitionLine("kosf-33", [time("33’"), teamName("阿根廷"), t("禁区外远射，球门表示今天不接待。")]),
      transitionLine("kosf-45", [time("45+1’"), teamName("中国队"), t("半场前扳平，评论区突然变得很有礼貌。"), score("1:1")]),
      transitionLine("kosf-57", [time("57’"), teamName("阿根廷"), t("连续短传，"), teamName("中国队"), t("防线开始背乘法表。")]),
      transitionLine("kosf-63", [time("63’"), teamName("阿根廷"), t("连续射门，"), playerName("门将"), t("像开了弹窗拦截。")]),
      transitionLine("kosf-71", [time("71’"), playerName("中场"), t("铲断成功，解说席把音量往上推了一格。")]),
      transitionLine("kosf-78", [time("78’"), teamName("阿根廷"), t("换人提速，"), teamName("中国队"), t("选择继续相信玄学。")]),
      transitionLine("kosf-84", [time("84’"), teamName("中国队"), t("反击低射破门，比分写成"), score("2:1")]),
      transitionLine("kosf-94", [time("90+4’"), t("最后一次解围飞到看台，球迷接住了命运。")]),
      transitionLine("kosf-final", [systemTag("终场"), t("哨响  决赛门票被硬塞进兜里")]),
    ],
  },
  {
    title: "决赛",
    status: "世界杯冠军",
    next: "查看本局结算",
    opponent: { code: "br", name: "巴西" },
    score: [3, 2],
    commentary: [
      transitionLine("kof-11", [time("11’"), teamName("巴西"), t("先进一球，现实服玩家集体沉默。")]),
      transitionLine("kof-19", [time("19’"), teamName("中国队"), t("第一次反击，跑位像突然收到地图。")]),
      transitionLine("kof-28", [time("28’"), teamName("中国队"), t("追回一球，解说席开始怀疑职业生涯。"), score("1:1")]),
      transitionLine("kof-41", [time("41’"), teamName("巴西"), systemTag("任意球"), t("擦梁，横梁决定继续上班。")]),
      transitionLine("kof-52", [time("52’"), teamName("巴西"), t("再度领先，宇宙把难度调到了最高。"), score("1:2")]),
      transitionLine("kof-64", [time("64’"), teamName("中国队"), t("连续逼抢，"), teamName("巴西"), t("后场开始找说明书。")]),
      transitionLine("kof-70", [time("70’"), teamName("中国队"), t("扳平，平行宇宙服务器开始冒烟。"), score("2:2")]),
      transitionLine("kof-82", [time("82’"), teamName("巴西"), t("围攻禁区，草皮都在替"), teamName("中国队"), t("喘气。")]),
      transitionLine("kof-88", [time("88’"), teamName("中国队"), t("反抢成功，替补席已经提前站起来。")]),
      transitionLine("kof-94", [time("90+4’"), teamName("中国队"), t("绝杀，"), teamName("巴西"), t("申请重开宇宙线。"), score("3:2")]),
      transitionLine("kof-97", [time("90+7’"), systemTag("裁判"), t("确认进球有效，现实服暂时无法同步。")]),
      transitionLine("kof-final", [systemTag("终场"), t("哨响  请所有人起立")]),
    ],
  },
];

const ADVANCEMENT_STAGES = [
  {
    minProgress: 1,
    title: "16 强席位",
    hint: "下一轮 中国队碰荷兰",
    note: "16 个名字看得清  梦还可以继续做",
    nextCode: "nl",
    teams: [
      team("cn", "🇨🇳", "中国队"),
      team("nl", "🇳🇱", "荷兰"),
      team("fr", "🇫🇷", "法国"),
      team("br", "🇧🇷", "巴西"),
      team("ar", "🇦🇷", "阿根廷"),
      team("de", "🇩🇪", "德国"),
      team("pt", "🇵🇹", "葡萄牙"),
      team("be", "🇧🇪", "比利时"),
      team("es", "🇪🇸", "西班牙"),
      team("gb-eng", "🏴", "英格兰"),
      team("mx", "🇲🇽", "墨西哥"),
      team("ch", "🇨🇭", "瑞士"),
      team("ma", "🇲🇦", "摩洛哥"),
      team("us", "🇺🇸", "美国"),
      team("jp", "🇯🇵", "日本"),
      team("eg", "🇪🇬", "埃及"),
    ],
  },
  {
    minProgress: 2,
    title: "8 强席位",
    hint: "下一轮 中国队碰法国",
    note: "名单突然变短  但故事还没讲完",
    nextCode: "fr",
    teams: [
      team("cn", "🇨🇳", "中国队"),
      team("fr", "🇫🇷", "法国"),
      team("br", "🇧🇷", "巴西"),
      team("ar", "🇦🇷", "阿根廷"),
      team("de", "🇩🇪", "德国"),
      team("pt", "🇵🇹", "葡萄牙"),
      team("es", "🇪🇸", "西班牙"),
      team("gb-eng", "🏴", "英格兰"),
    ],
  },
  {
    minProgress: 3,
    title: "半决赛席位",
    hint: "下一轮 中国队碰阿根廷",
    note: "宇宙线越来越窄  但还没有断",
    nextCode: "ar",
    teams: [
      team("cn", "🇨🇳", "中国队"),
      team("ar", "🇦🇷", "阿根廷"),
      team("br", "🇧🇷", "巴西"),
      team("de", "🇩🇪", "德国"),
    ],
  },
  {
    minProgress: 4,
    title: "决赛席位",
    hint: "下一轮 中国队碰巴西",
    note: "只剩两队  平行宇宙开始屏住呼吸",
    nextCode: "br",
    teams: [
      team("cn", "🇨🇳", "中国队"),
      team("br", "🇧🇷", "巴西"),
    ],
  },
  {
    minProgress: 5,
    title: "冠军现场",
    hint: "本局准备结算",
    note: "奖杯已经寄出  更衣室正在研究怎么托运",
    podium: {
      champion: team("cn", "🇨🇳", "中国队"),
      runnerUp: team("br", "🇧🇷", "巴西"),
      third: team("ar", "🇦🇷", "阿根廷"),
    },
    teams: [
      team("cn", "🇨🇳", "中国队"),
      team("br", "🇧🇷", "巴西"),
    ],
  },
];

function getAdvancementStage(progress) {
  return ADVANCEMENT_STAGES.reduce((current, stage) => (progress >= stage.minProgress ? stage : current), ADVANCEMENT_STAGES[0]);
}

function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function attributesFromArray(values) {
  return ATTRIBUTES.reduce((acc, item, index) => {
    acc[item.key] = values[index];
    return acc;
  }, {});
}

function randomAttributes() {
  const values = Array(ATTRIBUTES.length).fill(0);
  let points = ATTRIBUTE_TOTAL;
  while (points > 0) {
    const index = Math.floor(Math.random() * values.length);
    if (values[index] < ATTRIBUTE_MAX) {
      values[index] += 1;
      points -= 1;
    }
  }
  return attributesFromArray(values);
}

function isPresetActive(values, preset) {
  return preset.values.every((value, index) => values[ATTRIBUTES[index].key] === value);
}

function getVisibleMatchScore(round, visibleLines) {
  const scoredLine = [...visibleLines].reverse().find((line) => Array.isArray(line.scoreState));
  if (scoredLine) return scoredLine.scoreState;
  const scoredPart = [...visibleLines]
    .reverse()
    .flatMap((line) => [...line.parts].reverse())
    .find((item) => item.kind === "score" && /\d+\s*:\s*\d+/.test(item.text));
  if (scoredPart) {
    const [, home, away] = scoredPart.text.match(/(\d+)\s*:\s*(\d+)/) || [];
    if (home !== undefined && away !== undefined) return [Number(home), Number(away)];
  }
  return round?.scorePreview || [0, 0];
}

function getInitialScreen() {
  if (typeof window === "undefined") return "home";
  const screen = new URLSearchParams(window.location.search).get("screen");
  return ["home", "attributes", "replace", "transition", "group", "knockout", "final", "failure"].includes(screen) ? screen : "home";
}

function getTeamDisplayName(name) {
  return TEAM_DISPLAY_NAMES[name] || name;
}

function getFlagSrc(code) {
  return `/assets/flags/${code}.svg`;
}

function didChinaWinMatch(match) {
  if (match?.penalties) return match.penalties[0] > match.penalties[1];
  return match?.chinaGoals > match?.opponentGoals;
}

function FlagIcon({ code, className = "" }) {
  return <img className={cx("flag-icon", className)} src={getFlagSrc(code)} alt="" />;
}

function PageShell({ children, className = "" }) {
  return <section className={cx("screen-content", className)}>{children}</section>;
}

function TopBar({ title, onBack, right = "help", className = "" }) {
  const hasTwoActions = right === "music-help";
  return (
    <div className={cx("top-bar", hasTwoActions && "top-bar-two-actions", className)}>
      <button className="icon-button" onClick={onBack} aria-label="返回">
        {onBack ? <ChevronLeft size={20} /> : null}
      </button>
      <div className="top-title">{title}</div>
      {hasTwoActions ? (
        <div className="top-actions">
          <button className="icon-button" aria-label="音乐">
            <Music size={18} />
          </button>
          <button className="icon-button" aria-label="帮助">
            <HelpCircle size={18} />
          </button>
        </div>
      ) : right ? (
        <button className="icon-button" aria-label={right === "music" ? "音乐" : "帮助"}>
          {right === "music" ? <Music size={18} /> : <HelpCircle size={18} />}
        </button>
      ) : (
        <span className="top-spacer" aria-hidden="true" />
      )}
    </div>
  );
}

function RadarChart({ values, compact = false }) {
  const size = compact ? 188 : 250;
  const center = size / 2;
  const radius = compact ? 54 : 87;
  const labelRadius = compact ? 77 : 104;
  const points = ATTRIBUTES.map((attr, index) => {
    const angle = -Math.PI / 2 + (index * 2 * Math.PI) / ATTRIBUTES.length;
    const valueRadius = (values[attr.key] / ATTRIBUTE_MAX) * radius;
    return {
      attr,
      x: center + Math.cos(angle) * valueRadius,
      y: center + Math.sin(angle) * valueRadius,
      lx: center + Math.cos(angle) * labelRadius,
      ly: center + Math.sin(angle) * labelRadius,
      gx: center + Math.cos(angle) * radius,
      gy: center + Math.sin(angle) * radius,
    };
  });
  const gridLevels = [0.25, 0.5, 0.75, 1];
  const valueLabels = [
    { label: "10", level: 1 },
    { label: "7.5", level: 0.75 },
    { label: "5", level: 0.5 },
    { label: "2.5", level: 0.25 },
    { label: "0", level: 0 },
  ];

  return (
    <svg className="radar-chart" viewBox={`0 0 ${size} ${size}`} role="img" aria-label="国足属性雷达图">
      {gridLevels.map((level) => (
        <polygon
          key={level}
          className="radar-grid"
          points={ATTRIBUTES.map((_, index) => {
            const angle = -Math.PI / 2 + (index * 2 * Math.PI) / ATTRIBUTES.length;
            return `${center + Math.cos(angle) * radius * level},${center + Math.sin(angle) * radius * level}`;
          }).join(" ")}
        />
      ))}
      {points.map((point) => (
        <line key={point.attr.key} className="radar-axis" x1={center} y1={center} x2={point.gx} y2={point.gy} />
      ))}
      <polygon className="radar-fill" points={points.map((point) => `${point.x},${point.y}`).join(" ")} />
      {points.map((point) => (
        <circle key={`${point.attr.key}-dot`} className="radar-dot" cx={point.x} cy={point.y} r="3" />
      ))}
      {valueLabels.map((item) => (
        <text key={item.label} className="radar-value-label" x={center} y={center - radius * item.level + 10}>
          {item.label}
        </text>
      ))}
      {points.map((point) => (
        <text key={`${point.attr.key}-label`} className="radar-label" x={point.lx} y={point.ly}>
          {point.attr.label}
        </text>
      ))}
    </svg>
  );
}

function HomeScreen({ onStart, setMusicOn }) {
  return (
    <PageShell className="home-screen">
      <div className="home-hero">
        <img src="/home-reference.png" alt="国足 IF：美加墨奇迹首页" />
      </div>
      <button className="home-hotspot music-hotspot" onClick={() => setMusicOn((value) => !value)} aria-label="切换音乐" />
      <button className="home-hotspot home-cta-hotspot" onClick={onStart} aria-label="开启平行宇宙" />
    </PageShell>
  );
}

function AttributeScreen({ values, setValues, onNext, onBack }) {
  const total = ATTRIBUTES.reduce((sum, attr) => sum + values[attr.key], 0);
  const canContinue = total === ATTRIBUTE_TOTAL;

  const updateValue = (key, nextValue) => {
    const current = values[key];
    const proposed = clamp(nextValue, ATTRIBUTE_MIN, ATTRIBUTE_MAX);
    const nextTotal = total - current + proposed;
    if (nextTotal <= ATTRIBUTE_TOTAL || proposed < current) {
      setValues((prev) => ({ ...prev, [key]: proposed }));
    }
  };

  return (
    <PageShell className="attribute-screen">
      <TopBar title="给国足塞点属性" onBack={onBack} right={null} />
      <div className="points-card">
        <span>可分配点数</span>
        <strong className={total === ATTRIBUTE_TOTAL ? "" : "points-warning"}>
          <em className="points-used">{total}</em>
          <em className="points-total"> / 30 点</em>
        </strong>
        <p>拖动滑块分配属性，打造最强国足 IF 线</p>
      </div>
      <div className="attribute-panel">
        {ATTRIBUTES.map(({ key, label, color, asset }) => (
          <div className={cx("attribute-row", key === "luck" && "luck-row")} key={key}>
            <img className="attr-icon-img" src={asset} alt="" />
            <span className="attr-label">{label}</span>
            <input
              type="range"
              min={ATTRIBUTE_MIN}
              max={ATTRIBUTE_MAX}
              value={values[key]}
              onChange={(event) => updateValue(key, Number(event.target.value))}
              style={{
                "--attr-color": color,
                "--attr-fill": `${(values[key] / ATTRIBUTE_MAX) * 100}%`,
              }}
              aria-label={label}
            />
            <span className="attr-value">{values[key]}/10</span>
            <button className="step-button" onClick={() => updateValue(key, values[key] - 1)} aria-label={`${label}减少`}>
              <Minus size={14} />
            </button>
            <button className="step-button" onClick={() => updateValue(key, values[key] + 1)} aria-label={`${label}增加`}>
              <Plus size={14} />
            </button>
            {key === "luck" ? (
              <p className="luck-note">
                幸运会触发正向奇迹  0 幸运就是硬核宇宙
                <span>◆ 看过千万条宇宙线  能夺冠的可能只有一条</span>
              </p>
            ) : null}
          </div>
        ))}
      </div>
      {values.luck === 0 ? <div className="zero-luck-note">看过千万条宇宙线，能夺冠的可能只有一条。</div> : null}
      <div className="radar-and-presets">
        <div className="radar-card">
          <RadarChart values={values} />
        </div>
        <div className="preset-row">
          {PRESETS.map((preset) => (
            <button
              className={cx(isPresetActive(values, preset) && "is-active")}
              key={preset.name}
              onClick={() => setValues(attributesFromArray(preset.values))}
            >
              {preset.name}
            </button>
          ))}
          <button className="random-chip" onClick={() => setValues(randomAttributes())}>
            <img src="/assets/attribute/dice.png" alt="" /> 随机配点
          </button>
        </div>
      </div>
      <button className="primary-button sticky-button" disabled={!canContinue} onClick={onNext}>
        去替换一个倒霉蛋 <ArrowRight size={20} />
      </button>
    </PageShell>
  );
}

function ReplacementScreen({ selected, setSelected, onNext, onBack }) {
  return (
    <PageShell className="replacement-screen">
      <TopBar title="替换一个倒霉蛋" onBack={onBack} right={null} />
      <p className="screen-hint">挑一个倒霉蛋  中国队顺手继承它的小组和赛程</p>
      <div className="group-table">
        {GROUPS.map((group) => (
          <div className="group-row" key={group.id}>
            <div className="group-id">{group.id}组</div>
            <div className="team-grid">
              {group.teams.map((team) => {
                const active = selected?.group === group.id && selected?.name === team.name;
                return (
                  <button
                    className={cx("team-pill", active && "selected-team")}
                    key={`${group.id}-${team.name}`}
                    onClick={() => setSelected({ ...team, group: group.id })}
                  >
                    {active ? (
                      <img className="china-sticker-img" src="/assets/replacement/china-team-sticker.svg" alt="中国队" />
                    ) : (
                      <>
                        <img className="flag-icon" src={getFlagSrc(team.code)} alt="" />
                        <span className="team-pill-label">{getTeamDisplayName(team.name)}</span>
                      </>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <div className={cx("replace-cta", !selected && "is-empty")}>
        <span>{selected ? <>中国队将替换  <b>{selected.name}</b></> : "先挑一个倒霉蛋"}</span>
        <button className="primary-button" disabled={!selected} onClick={onNext}>
          进入平行宇宙 <ArrowRight size={20} />
        </button>
      </div>
    </PageShell>
  );
}

function TransitionScreen({ selectedTeam, gameRun, onDone }) {
  const [visibleCount, setVisibleCount] = useState(1);
  const [isAccelerated, setIsAccelerated] = useState(false);
  const feedRef = useRef(null);
  const revealTimerRef = useRef(null);
  const doneTimerRef = useRef(null);
  const transitionLines = useMemo(() => gameRun?.transitionLines || getTransitionLines(selectedTeam), [gameRun, selectedTeam]);
  const revealTarget = transitionLines.length;
  const displayLines = useMemo(
    () => transitionLines.slice(0, visibleCount).slice(-10).reverse(),
    [transitionLines, visibleCount],
  );

  const clearTransitionTimers = useCallback(() => {
    if (revealTimerRef.current) {
      window.clearInterval(revealTimerRef.current);
      revealTimerRef.current = null;
    }
    if (doneTimerRef.current) {
      window.clearTimeout(doneTimerRef.current);
      doneTimerRef.current = null;
    }
  }, []);

  const startRevealLoop = useCallback((intervalMs) => {
    if (revealTimerRef.current) {
      window.clearInterval(revealTimerRef.current);
    }
    revealTimerRef.current = window.setInterval(() => {
      setVisibleCount((count) => {
        if (count >= revealTarget) {
          window.clearInterval(revealTimerRef.current);
          revealTimerRef.current = null;
          if (!doneTimerRef.current) {
            doneTimerRef.current = window.setTimeout(onDone, TRANSITION_SETTLE_MS);
          }
          return count;
        }
        const next = count + 1;
        if (next >= revealTarget) {
          window.clearInterval(revealTimerRef.current);
          revealTimerRef.current = null;
          if (!doneTimerRef.current) {
            doneTimerRef.current = window.setTimeout(onDone, TRANSITION_SETTLE_MS);
          }
        }
        return next;
      });
    }, intervalMs);
  }, [onDone, revealTarget]);

  useEffect(() => {
    clearTransitionTimers();
    setVisibleCount(1);
    setIsAccelerated(false);
    startRevealLoop(TRANSITION_LINE_INTERVAL_MS);
    return clearTransitionTimers;
  }, [clearTransitionTimers, startRevealLoop]);

  const handleAccelerate = useCallback(() => {
    if (isAccelerated || visibleCount >= revealTarget) return;
    setIsAccelerated(true);
    startRevealLoop(TRANSITION_FAST_LINE_INTERVAL_MS);
  }, [isAccelerated, startRevealLoop, visibleCount, revealTarget]);

  useGSAP(
    () => {
      gsap.fromTo(
        ".feed-line.is-new",
        { y: -14, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.34, ease: "power2.out" },
      );
    },
    { dependencies: [visibleCount], scope: feedRef },
  );

  return (
    <PageShell className="transition-screen">
      <div className="simple-title">平行宇宙正在改写</div>
      <div className="transition-head">
        <h2><span>{selectedTeam.group} 组</span> 正在发生一点小意外</h2>
        <p>解说席收到了一份很难解释的赛程更新</p>
      </div>
      <div className="text-feed" ref={feedRef}>
        <div className="feed-status-card">
          <span>小组赛剧本正在生成</span>
          <span>比分正在排版  别急</span>
        </div>
        <div className="feed-queue">
          {displayLines.map((line, index) => (
            <p key={line.id} className={cx("feed-line", index === 0 && "is-new")}>
              {renderRichParts(line)}
            </p>
          ))}
        </div>
      </div>
      <button
        className={cx("primary-button transition-accelerate-button", isAccelerated && "is-active")}
        disabled={isAccelerated || visibleCount >= revealTarget}
        onClick={handleAccelerate}
        type="button"
      >
        {isAccelerated ? "加速生成中" : "加速生成"} <ArrowRight size={20} />
      </button>
    </PageShell>
  );
}

function GroupOverviewScreen({ selectedTeam, gameRun, onNext, onBack }) {
  const selectedGroup = gameRun?.chinaGroup || GROUPS.find((group) => group.id === selectedTeam.group) || GROUPS[5];
  const opponents = selectedGroup.teams.filter((team) => team.code !== "cn" && team.code !== selectedTeam.code);
  const opponentA = opponents[0] || { code: "nl", name: "荷兰" };
  const opponentB = opponents[1] || { code: "se", name: "瑞典" };
  const opponentC = opponents[2] || { code: "tn", name: "突尼斯" };
  const chinaStanding = selectedGroup.standings?.find((row) => row.team.code === "cn");
  const chinaAdvanced = gameRun?.groupAdvancers?.some((team) => team.code === "cn") ?? true;
  const standingRows = selectedGroup.standings
    ? selectedGroup.standings.map((row, index) => ({
        rank: String(index + 1),
        team: row.team,
        record: `${row.wins}-${row.draws}-${row.losses}`,
        goals: `${row.gf}/${row.ga}`,
        points: String(row.points),
        china: row.team.code === "cn",
      }))
    : [
        { rank: "1", team: opponentA, record: "2-1-0", goals: "5/2", points: "7" },
        { rank: "2", team: opponentB, record: "1-1-1", goals: "4/4", points: "4" },
        { rank: "3", team: { code: "cn", name: "中国队" }, record: "1-1-1", goals: "4/4", points: "4", china: true },
        { rank: "4", team: opponentC, record: "0-1-2", goals: "2/5", points: "1" },
      ];
  const groupsWithoutChinaGroup = GROUPS.filter((group) => group.id !== selectedGroup.id);
  const previewGroups = groupsWithoutChinaGroup.length % 2 === 0 ? groupsWithoutChinaGroup : GROUPS;
  const otherGroups = gameRun?.groupResults
    ? gameRun.groupResults.map((group) => [
        `${group.id}组`,
        group.standings.slice(0, 2).map((row) => row.team.name).join(" / "),
      ])
    : previewGroups.map((group) => [
        `${group.id}组`,
        group.id === selectedGroup.id ? `中国队 / ${opponentA.name}` : GROUP_ADVANCE_PREVIEW[group.id],
      ]);
  const chinaMatches = gameRun?.chinaMatches?.length
    ? gameRun.chinaMatches.map((match) => ({
        score: `${match.chinaGoals}:${match.opponentGoals}`,
        opponent: match.opponent,
      }))
    : [
        { score: "1:2", opponent: opponentA },
        { score: "2:1", opponent: opponentC },
        { score: "1:1", opponent: opponentB },
      ];

  return (
    <PageShell className="group-screen">
      <TopBar title="小组赛结束" onBack={onBack} right="music" />
      <div className="result-card group-result">
        <img className="group-trophy" src="/assets/worldcup-trophy-cutout.png" alt="" />
        <div className="group-result-copy">
          <h2>{chinaAdvanced ? "中国队压线活了！" : "中国队梦醒小组赛"}</h2>
          <p>
            <b>{chinaStanding?.wins ?? 1}</b> 胜 <b>{chinaStanding?.draws ?? 1}</b> 平 <b>{chinaStanding?.losses ?? 1}</b> 负，积 <b className="red-number">{chinaStanding?.points ?? 4}</b> 分
          </p>
          <div className={cx("status-chip", chinaAdvanced && "green")}><span>{chinaAdvanced ? "✓" : "×"}</span> {chinaAdvanced ? "晋级 32 强" : "小组赛出局"}</div>
          <em>{chinaAdvanced ? "数学还没放弃我们  宇宙也没来得及关门" : "这条宇宙线先到这里  下一条再整活"}</em>
        </div>
      </div>
      <section className="data-panel standings-panel">
        <header><span></span>{selectedGroup.id} 组积分榜<i></i></header>
        <div className="table-row table-head group-table-row">
          <span>排名</span>
          <span>球队</span>
          <span>胜平负</span>
          <span>进/失</span>
          <span>积分</span>
        </div>
        {standingRows.map((row) => (
          <div className={cx("table-row group-table-row", row.china && "china-row")} key={row.rank}>
            <span>{row.rank}</span>
            <span className="table-team">
              <FlagIcon code={row.team.code} />
              <strong>{row.team.name}</strong>
              {row.china ? (
                <em className={cx("line-badge", !chinaAdvanced && "is-out")}>
                  {chinaAdvanced ? "压线活了" : "小组出局"}
                </em>
              ) : null}
            </span>
            <span>{row.record}</span>
            <span>{row.goals}</span>
            <span>{row.points}</span>
          </div>
        ))}
      </section>
      <section className="data-panel compact-panel group-matches-panel">
        <header><span></span>中国队三场<i></i></header>
        {chinaMatches.map((match) => (
          <div className="match-row group-match-row" key={`${match.score}-${match.opponent.name}`}>
            <span className="match-team"><FlagIcon code="cn" /> 中国队</span>
            <strong>{match.score}</strong>
            <span className="match-team match-team-away">{match.opponent.name} <FlagIcon code={match.opponent.code} /></span>
          </div>
        ))}
        <p>{chinaAdvanced ? "输得有尊严  赢得很突然  平得刚刚好" : "算分器关机  但段子还在"}</p>
      </section>
      <section className="other-groups">
        <header><span></span>晋级队伍速览<i></i></header>
        {otherGroups.map(([group, teams]) => (
          <div className="other-group-pill" key={group}>
            <b>{group}</b>
            <span>{teams}</span>
          </div>
        ))}
      </section>
      <button className="primary-button group-next-button" onClick={onNext}>
        {chinaAdvanced ? "进入 32 强：梦还没醒" : "查看本局结算"} <ArrowRight size={20} />
      </button>
    </PageShell>
  );
}

function AdvancementBoard({ stage, revealed = true }) {
  if (stage.podium) {
    const { champion, runnerUp, third } = stage.podium;
    return (
      <div className={cx("advancement-board champion-board", revealed && "is-revealed")}>
        <div className="champion-showcase">
          <div className="podium-side-card runner-up-card">
            <span>亚军</span>
            <FlagIcon code={runnerUp.code} />
            <strong>{runnerUp.name}</strong>
          </div>
          <div className="champion-spotlight">
            <div className="champion-crown"><Trophy size={24} /></div>
            <span>世界杯冠军</span>
            <div className="champion-team-name">
              <FlagIcon code={champion.code} />
              <strong>{champion.name}</strong>
            </div>
            <em>请所有人起立</em>
          </div>
          <div className="podium-side-card third-place-card">
            <span>季军</span>
            <FlagIcon code={third.code} />
            <strong>{third.name}</strong>
          </div>
        </div>
      </div>
    );
  }

  if (stage.teams.length === 2) {
    const [home, away] = stage.teams;
    return (
      <div className={cx("advancement-board compact-board final-duel-board", revealed && "is-revealed")}>
        <div className="duel-lock-strip">
          <span>本轮过关</span>
          <strong><FlagIcon code={home.code} /> {home.name}</strong>
          <em>决赛碰 <FlagIcon code={away.code} /> {away.name}</em>
        </div>
        <div className="final-duel-match">
          <div className="duel-team-card china-duel-card">
            <FlagIcon code={home.code} />
            <strong>{home.name}</strong>
            <small>一路离谱到门口</small>
          </div>
          <div className="duel-vs-badge">
            <b>VS</b>
            <span>决赛</span>
          </div>
          <div className="duel-team-card next-duel-card">
            <FlagIcon code={away.code} />
            <strong>{away.name}</strong>
            <small>奖杯守门员上线</small>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cx("advancement-board", revealed && "is-revealed", stage.teams.length <= 8 && "compact-board", `stage-${stage.teams.length}`)}>
      <div className="advance-focus">
        <span>本轮过关</span>
        <strong><FlagIcon code="cn" /> 中国队</strong>
        {stage.nextCode ? (
          <em>下轮 <FlagIcon code={stage.nextCode} /> {stage.teams.find((item) => item.code === stage.nextCode)?.name}</em>
        ) : (
          <em>等待结算</em>
        )}
      </div>
      <div className="advance-grid">
        {stage.teams.map((item, index) => (
          <div
            className={cx("advance-team-card", item.code === "cn" && "china-advance", item.code === stage.nextCode && "next-advance")}
            key={item.code}
            style={{ "--seat-index": index }}
          >
            <FlagIcon code={item.code} />
            <span>{getTeamDisplayName(item.name)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function KnockoutScreen({ roundIndex, setRoundIndex, gameRun, onFinal, onBack }) {
  const rounds = gameRun?.knockoutRounds?.length ? gameRun.knockoutRounds : KNOCKOUT_ROUNDS;
  const round = rounds[roundIndex] || rounds[0];
  const progress = roundIndex + 1;
  const advancementStage = gameRun?.advancementStages?.[roundIndex] || getAdvancementStage(progress);
  const [visibleReportCount, setVisibleReportCount] = useState(1);
  const [reportRoundIndex, setReportRoundIndex] = useState(roundIndex);
  const reportRef = useRef(null);
  const visibleReportCountForRound = reportRoundIndex === roundIndex ? visibleReportCount : 1;
  const reportComplete = visibleReportCountForRound >= round.commentary.length;
  const visibleReportLines = round.commentary.slice(0, visibleReportCountForRound);
  const displayedScore = reportComplete ? round.score : getVisibleMatchScore(round, visibleReportLines);

  useEffect(() => {
    let nextCount = 1;
    setReportRoundIndex(roundIndex);
    setVisibleReportCount(1);
    const timer = window.setInterval(() => {
      nextCount += 1;
      setVisibleReportCount(Math.min(nextCount, round.commentary.length));
      if (nextCount >= round.commentary.length) {
        window.clearInterval(timer);
      }
    }, KNOCKOUT_REPORT_LINE_INTERVAL_MS);

    return () => window.clearInterval(timer);
  }, [roundIndex, round.commentary.length]);

  useEffect(() => {
    const scroller = reportRef.current?.querySelector(".commentary-scroll");
    if (!scroller) return;
    scroller.scrollTop = scroller.scrollHeight;
  }, [visibleReportCountForRound, roundIndex]);

  useGSAP(
    () => {
      gsap.fromTo(
        ".comment-line.is-new",
        { y: -8, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 0.28, ease: "power2.out" },
      );
    },
    { dependencies: [visibleReportCountForRound, roundIndex], scope: reportRef },
  );

  const handleNext = () => {
    if (!reportComplete) return;
    if (roundIndex >= rounds.length - 1) {
      onFinal();
      return;
    }
    setRoundIndex((value) => value + 1);
  };

  return (
    <PageShell className="knockout-screen">
      <TopBar title={round.title} onBack={onBack} right="music" />
      <div className={cx("knockout-result", reportComplete && "is-complete")}>
        <span className="mini-label">淘汰赛  单场定生死</span>
        <div className="score-line knockout-score-card">
          <div className="knockout-team is-home">
            <FlagIcon code="cn" className="score-flag" />
            <strong>中国队</strong>
          </div>
          <div className="score-stack">
            <b>{displayedScore[0]} : {displayedScore[1]}</b>
          </div>
          <div className="knockout-team is-away">
            <FlagIcon code={round.opponent.code} className="score-flag" />
            <strong>{round.opponent.name}</strong>
          </div>
        </div>
        {reportComplete ? <span className="knockout-status"><Trophy size={14} /> {round.status}</span> : null}
        {reportComplete ? <p>这球踢得不一定科学  但比分很讲礼貌</p> : null}
      </div>
      <section className="data-panel commentary-panel" ref={reportRef} aria-live="polite">
        <header><span></span>本场战报<i></i></header>
        <div className="commentary-scroll">
          {visibleReportLines.map((line, index) => {
            return (
              <div
                className={cx(
                  "comment-line",
                  index >= round.commentary.length - 1 && "highlight",
                  index === visibleReportCountForRound - 1 && "is-new",
                )}
                key={line.id}
              >
                {renderRichParts(line)}
              </div>
            );
          })}
        </div>
      </section>
      <section className="bracket-section advancement-section">
        <div className="section-title-row">
          <h3><Trophy size={17} /> {advancementStage.title}</h3>
          <span>{reportComplete ? advancementStage.hint : "席位等待终场"}</span>
        </div>
        {reportComplete ? (
          <AdvancementBoard stage={advancementStage} revealed />
        ) : (
          <div className="advancement-board pending-board">
            <span>席位等待终场</span>
          </div>
        )}
      </section>
      <button
        className={cx("primary-button sticky-button", !reportComplete && "is-reporting")}
        disabled={!reportComplete}
        onClick={handleNext}
      >
        {reportComplete ? (
          <>
            {round.next} <ArrowRight size={20} />
          </>
        ) : (
          "比赛进行中"
        )}
      </button>
    </PageShell>
  );
}

function getKnownNode(side, round, index, progress) {
  if (side !== "left") return null;
  const nodes = {
    r32: {
      4: { code: "cn", name: "中国队", score: 2, active: true },
      5: { code: "co", name: "哥伦比亚", score: 1 },
      6: { code: "nl", name: "荷兰", score: "?" },
      7: { code: "us", name: "美国", score: "?" },
      8: { code: "fr", name: "法国", score: "?" },
      10: { code: "ar", name: "阿根廷", score: "?" },
      14: { code: "br", name: "巴西", score: "?" },
    },
    r16: {
      2: progress >= 1 ? { code: "cn", name: "中国队", score: 2, active: true } : null,
    },
    qf: {
      1: progress >= 2 ? { code: "cn", name: "中国队", score: 1, active: true } : null,
    },
    sf: {
      0: progress >= 3 ? { code: "cn", name: "中国队", score: 2, active: true } : null,
    },
    final: {
      0: progress >= 4 ? { code: "cn", name: "中国队", score: 3, active: true } : null,
    },
  };
  return nodes[round]?.[index] || null;
}

function BracketCanvas({ progress }) {
  const viewportRef = useRef(null);
  const contentRef = useRef(null);
  const pointersRef = useRef(new Map());
  const dragRef = useRef({ x: 0, y: 0, offsetX: 0, offsetY: 0, distance: 0, scale: 1 });
  const [bounds, setBounds] = useState({ minScale: 0.42, maxScale: 3, viewW: 330, viewH: 270, contentW: 900, contentH: 360 });
  const [view, setView] = useState({ scale: 0.42, x: 0, y: 0 });
  const contentW = 900;
  const contentH = 680;
  const nodeW = 104;
  const nodeH = 22;
  const leftX = [14, 142, 270, 398, 520];
  const rightX = [782, 654, 526, 398, 520];

  const yForRound = useMemo(() => {
    const r32 = Array.from({ length: 16 }, (_, index) => 64 + index * 36);
    const r16 = Array.from({ length: 8 }, (_, index) => (r32[index * 2] + r32[index * 2 + 1]) / 2);
    const qf = Array.from({ length: 4 }, (_, index) => (r16[index * 2] + r16[index * 2 + 1]) / 2);
    const sf = Array.from({ length: 2 }, (_, index) => (qf[index * 2] + qf[index * 2 + 1]) / 2);
    const final = [(sf[0] + sf[1]) / 2];
    return { r32, r16, qf, sf, final };
  }, []);

  const clampView = useCallback(
    (next) => {
      const scaledW = bounds.contentW * next.scale;
      const scaledH = bounds.contentH * next.scale;
      const minX = Math.min(0, bounds.viewW - scaledW);
      const minY = Math.min(0, bounds.viewH - scaledH);
      return {
        scale: clamp(next.scale, bounds.minScale, bounds.maxScale),
        x: scaledW <= bounds.viewW ? (bounds.viewW - scaledW) / 2 : clamp(next.x, minX, 0),
        y: scaledH <= bounds.viewH ? (bounds.viewH - scaledH) / 2 : clamp(next.y, minY, 0),
      };
    },
    [bounds],
  );

  useLayoutEffect(() => {
    if (!viewportRef.current) return;
    const resize = () => {
      const rect = viewportRef.current.getBoundingClientRect();
      const minScale = Math.min(rect.width / contentW, rect.height / contentH);
      const nextBounds = { minScale, maxScale: 3, viewW: rect.width, viewH: rect.height, contentW, contentH };
      setBounds(nextBounds);
      setView({
        scale: minScale,
        x: (rect.width - contentW * minScale) / 2,
        y: (rect.height - contentH * minScale) / 2,
      });
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(viewportRef.current);
    return () => observer.disconnect();
  }, []);

  const setClampedView = useCallback((next) => setView((current) => clampView({ ...current, ...next })), [clampView]);

  const handleWheel = (event) => {
    const factor = event.deltaY > 0 ? 0.9 : 1.1;
    const nextScale = clamp(view.scale * factor, bounds.minScale, bounds.maxScale);
    setClampedView({ scale: nextScale, x: view.x, y: view.y });
  };

  const handlePointerDown = (event) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    pointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    dragRef.current = {
      x: event.clientX,
      y: event.clientY,
      offsetX: view.x,
      offsetY: view.y,
      distance: 0,
      scale: view.scale,
    };
    const points = Array.from(pointersRef.current.values());
    if (points.length === 2) {
      dragRef.current.distance = Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y);
    }
  };

  const handlePointerMove = (event) => {
    if (!pointersRef.current.has(event.pointerId)) return;
    pointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    const points = Array.from(pointersRef.current.values());
    if (points.length === 1) {
      setClampedView({
        x: dragRef.current.offsetX + event.clientX - dragRef.current.x,
        y: dragRef.current.offsetY + event.clientY - dragRef.current.y,
      });
    }
    if (points.length === 2 && dragRef.current.distance > 0) {
      const distance = Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y);
      setClampedView({ scale: dragRef.current.scale * (distance / dragRef.current.distance) });
    }
  };

  const handlePointerUp = (event) => {
    pointersRef.current.delete(event.pointerId);
    dragRef.current = { ...dragRef.current, offsetX: view.x, offsetY: view.y };
  };

  const renderNode = (side, round, index, x, y) => {
    const known = getKnownNode(side, round, index, progress);
    const active = known?.active;
    return (
      <div
        className={cx("bracket-node", active && "active-node", !known && "unknown-node")}
        key={`${side}-${round}-${index}`}
        style={{ left: x, top: y - nodeH / 2, width: nodeW, height: nodeH }}
      >
        {known ? (
          <>
            <FlagIcon code={known.code} />
            <span>{known.name}</span>
            {known.score !== undefined ? <b>{known.score}</b> : null}
          </>
        ) : (
          <span>?</span>
        )}
      </div>
    );
  };

  const linePaths = [];
  const addLines = (side, sourceRound, targetRound, sourceX, targetX, sourceY, targetY, roundIndex) => {
    for (let index = 0; index < targetY.length; index++) {
      const y1 = sourceY[index * 2];
      const y2 = sourceY[index * 2 + 1];
      const ty = targetY[index];
      const sourceEdge = side === "left" ? sourceX + nodeW : sourceX;
      const targetEdge = side === "left" ? targetX : targetX + nodeW;
      const midX = side === "left" ? targetEdge - 18 : targetEdge + 18;
      const active = side === "left" && index === Math.floor(4 / 2 ** (roundIndex + 1)) && progress > roundIndex;
      linePaths.push(
        <path
          key={`${side}-${sourceRound}-${targetRound}-${index}`}
          className={cx("bracket-path", active && "active-path")}
          d={`M${sourceEdge} ${y1} H${midX} V${y2} H${sourceEdge} M${midX} ${ty} H${targetEdge}`}
        />,
      );
    }
  };

  addLines("left", "r32", "r16", leftX[0], leftX[1], yForRound.r32, yForRound.r16, 0);
  addLines("left", "r16", "qf", leftX[1], leftX[2], yForRound.r16, yForRound.qf, 1);
  addLines("left", "qf", "sf", leftX[2], leftX[3], yForRound.qf, yForRound.sf, 2);
  addLines("left", "sf", "final", leftX[3], leftX[4], yForRound.sf, yForRound.final, 3);
  addLines("right", "r32", "r16", rightX[0], rightX[1], yForRound.r32, yForRound.r16, 0);
  addLines("right", "r16", "qf", rightX[1], rightX[2], yForRound.r16, yForRound.qf, 1);
  addLines("right", "qf", "sf", rightX[2], rightX[3], yForRound.qf, yForRound.sf, 2);
  addLines("right", "sf", "final", rightX[3], rightX[4], yForRound.sf, yForRound.final, 3);

  return (
    <div className="bracket-viewport" ref={viewportRef} onWheel={handleWheel}>
      <div className="zoom-indicator">{Math.round(view.scale / bounds.minScale * 100)}% {view.scale <= bounds.minScale + 0.01 ? "最小" : ""}</div>
      <div
        className="bracket-content"
        ref={contentRef}
        style={{ width: contentW, height: contentH, transform: `translate(${view.x}px, ${view.y}px) scale(${view.scale})` }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <div className="round-labels">
          <span style={{ left: 20 }}>32强</span>
          <span style={{ left: 136 }}>16强</span>
          <span style={{ left: 248 }}>8强</span>
          <span style={{ left: 352 }}>半决赛</span>
          <span style={{ left: 476 }}>决赛</span>
          <span style={{ right: 248 }}>8强</span>
          <span style={{ right: 136 }}>16强</span>
          <span style={{ right: 20 }}>32强</span>
        </div>
        <svg className="bracket-svg" viewBox={`0 0 ${contentW} ${contentH}`} aria-hidden="true">
          {linePaths}
        </svg>
        {yForRound.r32.map((y, index) => renderNode("left", "r32", index, leftX[0], y))}
        {yForRound.r16.map((y, index) => renderNode("left", "r16", index, leftX[1], y))}
        {yForRound.qf.map((y, index) => renderNode("left", "qf", index, leftX[2], y))}
        {yForRound.sf.map((y, index) => renderNode("left", "sf", index, leftX[3], y))}
        {renderNode("left", "final", 0, leftX[4], yForRound.final[0])}
        {yForRound.r32.map((y, index) => renderNode("right", "r32", index, rightX[0], y))}
        {yForRound.r16.map((y, index) => renderNode("right", "r16", index, rightX[1], y))}
        {yForRound.qf.map((y, index) => renderNode("right", "qf", index, rightX[2], y))}
        {yForRound.sf.map((y, index) => renderNode("right", "sf", index, rightX[3], y))}
        <div className="final-badge" style={{ left: 430, top: yForRound.final[0] + 36 }}>决赛</div>
      </div>
    </div>
  );
}

function MiraclePathLine({ row }) {
  if (row.type === "replace") {
    return (
      <>
        <span>{row.label}：</span>
        <strong>
          <FlagIcon code="cn" /> <b>中国队</b>
          <i>{row.verb}</i>
          <FlagIcon code={row.targetCode} /> <span className="path-team-name">{row.targetName}</span>
          <i>名额</i>
        </strong>
      </>
    );
  }
  if (row.type === "group") {
    return (
      <>
        <span>{row.label}：</span>
        <strong><FlagIcon code="cn" /> <b>中国队</b> <i>{row.text}</i></strong>
      </>
    );
  }
  const [homeScore, awayScore] = row.score.split(":");
  return (
    <>
      <span>{row.label}：</span>
      <strong>
        <FlagIcon code="cn" /> <b>中国队</b>
        <span className={cx("path-score", row.lost && "lost-score")}>
          <em>{homeScore}</em><i>:</i><em>{awayScore}</em>
        </span>
        <FlagIcon code={row.opponentCode} /> <span className="path-team-name">{row.opponentName}</span>
      </strong>
    </>
  );
}

function FinalScreen({ values, selectedTeam, gameRun, onRestart, onBack, result = "champion" }) {
  const [qrSrc, setQrSrc] = useState("");
  const reportRef = useRef(null);
  const selectedCode = selectedTeam.code || "jp";
  const resultState = gameRun?.settlement?.result || result;
  const isFailure = resultState === "failure";
  const fallbackPathRows = isFailure
    ? [
        { type: "replace", label: "替换", verb: "贴上", targetCode: selectedCode, targetName: selectedTeam.name },
        { type: "group", label: "小组赛", text: `${selectedTeam.group} 组压线晋级` },
        { type: "match", label: "32强", score: "2:1", opponentCode: "co", opponentName: "哥伦比亚" },
        { type: "match", label: "16强", score: "0:1", opponentCode: "nl", opponentName: "荷兰", final: true, lost: true },
      ]
    : [
        { type: "replace", label: "替换", verb: "贴上", targetCode: selectedCode, targetName: selectedTeam.name },
        { type: "group", label: "小组赛", text: `${selectedTeam.group} 组压线晋级` },
        { type: "match", label: "32强", score: "2:1", opponentCode: "co", opponentName: "哥伦比亚" },
        { type: "match", label: "16强", score: "1:0", opponentCode: "nl", opponentName: "荷兰" },
        { type: "match", label: "8强", score: "2:1", opponentCode: "fr", opponentName: "法国" },
        { type: "match", label: "半决赛", score: "2:1", opponentCode: "ar", opponentName: "阿根廷" },
        { type: "match", label: "决赛", score: "3:2", opponentCode: "br", opponentName: "巴西", final: true },
      ];
  const pathRows = gameRun?.pathRows?.length ? gameRun.pathRows : fallbackPathRows;
  const finalMatchRow = [...pathRows].reverse().find((row) => row.type === "match" && row.final);
  const failureStageText = finalMatchRow?.label ? `止步 ${finalMatchRow.label}` : "小组赛出局";
  const settlementCharacter = getSettlementCharacterAsset({
    result: resultState,
    defeatedOpponentCode: gameRun?.settlement?.defeatedOpponentCode || finalMatchRow?.opponentCode,
    defeatedOpponentName: gameRun?.settlement?.defeatedOpponentName || finalMatchRow?.opponentName,
    failureReason: gameRun?.settlement?.failureReason,
    failureSeed: gameRun?.settlement?.failureSeed,
  });

  const copyLink = async () => {
    track("share_click", { action: "copy_link", result: resultState });
    try {
      await navigator.clipboard.writeText(window.location.href);
    } catch {
      // Clipboard permission can be blocked in previews; the UI remains usable.
    }
  };

  const saveReport = async () => {
    if (!reportRef.current) return;
    track("share_click", { action: "save_report", result: resultState });
    try {
      const dataUrl = await toPng(reportRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: "#ffffff",
      });
      const link = document.createElement("a");
      link.download = "guozu-if-report.png";
      link.href = dataUrl;
      link.click();
    } catch {
      // Report export can fail if the preview browser blocks canvas/image reads.
    }
  };

  useEffect(() => {
    let mounted = true;
    QRCode.toDataURL(window.location.href, {
      width: 132,
      margin: 1,
      color: {
        dark: "#12315b",
        light: "#ffffff",
      },
    })
      .then((url) => {
        if (mounted) setQrSrc(url);
      })
      .catch(() => {
        if (mounted) setQrSrc("");
      });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <PageShell className={cx("final-screen", isFailure && "failure-screen")}>
      <TopBar title="本局结算" onBack={onBack} right="music" />
      <div className="report-card" ref={reportRef}>
        <div className="final-hero">
          <div className="final-hero-copy">
            <h2 className={cx(!isFailure && "champion-title")}>
              {!isFailure ? <FlagIcon code="cn" className="hero-title-flag" /> : null}
              <span className="final-hero-title-text">{isFailure ? "梦醒了！" : "世界杯冠军！"}</span>
            </h2>
            <p>{isFailure ? "请先别关机  宇宙线还在加载下一条" : "中国队历史首次夺得世界杯冠军"}</p>
            <span className="final-hero-note">{isFailure ? `${failureStageText}  但这局已经够离谱` : "本局建议收藏  现实服暂未同步"}</span>
          </div>
          <img
            className="final-defeated-mascot"
            src={settlementCharacter.src}
            alt={settlementCharacter.alt}
            style={{ "--character-display-scale": String(settlementCharacter.displayScale || 1) }}
          />
        </div>
        <section className={cx("path-panel", isFailure && "failure-path-panel", `path-count-${Math.min(pathRows.length, 7)}`)}>
          <header><Trophy size={18} /> 奇迹路径</header>
          {pathRows.map((row) => (
            <div className={cx("path-row", `path-row-${row.type}`, row.final && "final-row")} key={row.label}>
              <MiraclePathLine row={row} />
              {row.final ? <small>{isFailure ? `${row.opponentName}队看完战报  表示这宇宙线也挺累` : `${row.opponentName}队看完比分  申请重开宇宙线`}</small> : null}
            </div>
          ))}
        </section>
        <div className="final-bottom-grid">
          <section className="mini-info-panel">
            <header>国足属性</header>
            <RadarChart values={values} compact />
          </section>
          <section className="mini-info-panel share-panel">
            <header>分享这条宇宙线</header>
            <div className="qr-box">
              {qrSrc ? (
                <img src={qrSrc} alt="分享二维码" />
              ) : (
                <>
                  <span></span>
                  <span></span>
                  <span></span>
                </>
              )}
            </div>
            <p>扫码开启你的宇宙线</p>
            <button onClick={copyLink}>
              <Copy size={14} /> 复制链接
            </button>
          </section>
        </div>
      </div>
      <div className="final-actions">
        <button className="small-red-button" onClick={saveReport}>
          <Download size={15} /> 保存战报图
        </button>
        <button className="small-light-button" onClick={onRestart}>
          <RotateCcw size={15} /> {isFailure ? "重开复活赛" : "重开一条宇宙线"}
        </button>
      </div>
    </PageShell>
  );
}

export function App() {
  const [screen, setScreen] = useState(getInitialScreen);
  const [, setMusicOn] = useState(true);
  const [attributes, setAttributes] = useState(attributesFromArray([5, 5, 5, 5, 5, 5]));
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [gameRun, setGameRun] = useState(null);
  const [roundIndex, setRoundIndex] = useState(0);
  const appRef = useRef(null);

  const go = useCallback((nextScreen) => setScreen(nextScreen), []);

  const startSimulation = useCallback(() => {
    if (!selectedTeam) return;
    const run = simulateWorldCupRun({
      attributes,
      selectedTeam,
      seed: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    });
    track("team_selected", { teamCode: selectedTeam.code, group: selectedTeam.group });
    setGameRun(run);
    setRoundIndex(0);
    setScreen("transition");
  }, [attributes, selectedTeam]);

  const restart = () => {
    track("restart", { from: screen });
    setAttributes(attributesFromArray([5, 5, 5, 5, 5, 5]));
    setSelectedTeam(null);
    setGameRun(null);
    setRoundIndex(0);
    setScreen("home");
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [screen]);

  useEffect(() => {
    track("page_view", { screen });

    if (screen === "group" && gameRun) {
      track("group_stage_result", {
        run: gameRun.id,
        result: gameRun.groupAdvancers.some((team) => team.code === "cn") ? "advanced" : "failed",
        teamCode: gameRun.selectedTeam.code,
      });
    }

    if (screen === "knockout" && gameRun?.knockoutRounds?.[roundIndex]) {
      const round = gameRun.knockoutRounds[roundIndex];
      track("knockout_result", {
        run: gameRun.id,
        round: round.round || round.title,
        opponentCode: round.opponent.code,
        result: didChinaWinMatch(round.match) ? "win" : "loss",
      });
    }

    if ((screen === "final" || screen === "failure") && gameRun) {
      track("final_result", { run: gameRun.id, result: gameRun.result });
      track(gameRun.result === "champion" ? "champion" : "failed", { run: gameRun.id, teamCode: gameRun.selectedTeam.code });
    }
  }, [screen, gameRun, roundIndex]);

  useGSAP(
    () => {
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduceMotion) return;
      gsap.fromTo(
        ".screen-content",
        { opacity: 0, y: 18 },
        { opacity: 1, y: 0, duration: 0.42, ease: "power2.out" },
      );
    },
    { scope: appRef, dependencies: [screen, roundIndex] },
  );

  return (
    <main className="app" ref={appRef}>
      <div className="phone-shell">
        {screen === "home" ? <HomeScreen onStart={() => { track("game_start"); go("attributes"); }} setMusicOn={setMusicOn} /> : null}
        {screen === "attributes" ? (
          <AttributeScreen
            values={attributes}
            setValues={setAttributes}
            onNext={() => {
              track("attribute_submit", { luck: attributes.luck });
              go("replace");
            }}
            onBack={() => go("home")}
          />
        ) : null}
        {screen === "replace" ? (
          <ReplacementScreen
            selected={selectedTeam}
            setSelected={setSelectedTeam}
            onNext={startSimulation}
            onBack={() => go("attributes")}
          />
        ) : null}
        {screen === "transition" ? <TransitionScreen selectedTeam={selectedTeam || PREVIEW_SELECTED_TEAM} gameRun={gameRun} onDone={() => go("group")} /> : null}
        {screen === "group" ? (
          <GroupOverviewScreen
            selectedTeam={selectedTeam || PREVIEW_SELECTED_TEAM}
            gameRun={gameRun}
            onNext={() => go(gameRun?.knockoutRounds?.length ? "knockout" : "failure")}
            onBack={() => go("replace")}
          />
        ) : null}
        {screen === "knockout" ? (
          <KnockoutScreen
            roundIndex={roundIndex}
            setRoundIndex={setRoundIndex}
            gameRun={gameRun}
            onFinal={() => go(gameRun?.result === "failure" ? "failure" : "final")}
            onBack={() => go("group")}
          />
        ) : null}
        {screen === "final" ? (
          <FinalScreen values={attributes} selectedTeam={selectedTeam || PREVIEW_SELECTED_TEAM} gameRun={gameRun} onRestart={restart} onBack={() => go("knockout")} />
        ) : null}
        {screen === "failure" ? (
          <FinalScreen values={attributes} selectedTeam={selectedTeam || PREVIEW_SELECTED_TEAM} gameRun={gameRun} result="failure" onRestart={restart} onBack={() => go(gameRun?.knockoutRounds?.length ? "knockout" : "group")} />
        ) : null}
      </div>
    </main>
  );
}
