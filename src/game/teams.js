export const RANKING_SNAPSHOT = {
  source: "FIFA/Coca-Cola Men's World Ranking",
  officialUpdate: "2026-06-11",
  nextUpdate: "2026-07-20",
  note: "FIFA official page confirms the update date; rank/points snapshot is frozen for static gameplay.",
};

export const GROUP_MATCH_PATTERN = [
  [1, 2],
  [3, 4],
  [4, 2],
  [1, 3],
  [4, 1],
  [2, 3],
];

export function team({ code, name, group, slot, fifaRank, fifaPoints = null, baseRating, tags = [] }) {
  return {
    code,
    flag: code,
    name,
    group,
    slot,
    fifaRank,
    fifaPoints,
    baseRating,
    tags,
  };
}

export const TEAMS = [
  team({ code: "mx", name: "墨西哥", group: "A", slot: 1, fifaRank: 14, fifaPoints: 1687.48, baseRating: 82, tags: ["host"] }),
  team({ code: "za", name: "南非", group: "A", slot: 2, fifaRank: 60, baseRating: 66 }),
  team({ code: "kr", name: "韩国", group: "A", slot: 3, fifaRank: 25, fifaPoints: 1591.63, baseRating: 77, tags: ["asia"] }),
  team({ code: "cz", name: "捷克", group: "A", slot: 4, fifaRank: 40, fifaPoints: 1505.74, baseRating: 73 }),

  team({ code: "ca", name: "加拿大", group: "B", slot: 1, fifaRank: 30, fifaPoints: 1559.48, baseRating: 75, tags: ["host"] }),
  team({ code: "ba", name: "波黑", group: "B", slot: 2, fifaRank: 64, baseRating: 68 }),
  team({ code: "qa", name: "卡塔尔", group: "B", slot: 3, fifaRank: 56, baseRating: 68, tags: ["asia"] }),
  team({ code: "ch", name: "瑞士", group: "B", slot: 4, fifaRank: 19, fifaPoints: 1650.06, baseRating: 80 }),

  team({ code: "br", name: "巴西", group: "C", slot: 1, fifaRank: 6, fifaPoints: 1765.86, baseRating: 90, tags: ["superpower"] }),
  team({ code: "ma", name: "摩洛哥", group: "C", slot: 2, fifaRank: 7, fifaPoints: 1755.10, baseRating: 88 }),
  team({ code: "ht", name: "海地", group: "C", slot: 3, fifaRank: 83, baseRating: 60 }),
  team({ code: "gb-sct", name: "苏格兰", group: "C", slot: 4, fifaRank: 42, fifaPoints: 1503.34, baseRating: 72 }),

  team({ code: "us", name: "美国", group: "D", slot: 1, fifaRank: 17, fifaPoints: 1671.23, baseRating: 81, tags: ["host"] }),
  team({ code: "py", name: "巴拉圭", group: "D", slot: 2, fifaRank: 41, fifaPoints: 1505.35, baseRating: 73 }),
  team({ code: "au", name: "澳大利亚", group: "D", slot: 3, fifaRank: 27, fifaPoints: 1579.34, baseRating: 76, tags: ["asia"] }),
  team({ code: "tr", name: "土耳其", group: "D", slot: 4, fifaRank: 22, fifaPoints: 1605.73, baseRating: 79 }),

  team({ code: "de", name: "德国", group: "E", slot: 1, fifaRank: 10, fifaPoints: 1735.77, baseRating: 87, tags: ["superpower"] }),
  team({ code: "cw", name: "库拉索", group: "E", slot: 2, fifaRank: 82, baseRating: 61 }),
  team({ code: "ci", name: "科特迪瓦", group: "E", slot: 3, fifaRank: 33, fifaPoints: 1540.87, baseRating: 75 }),
  team({ code: "ec", name: "厄瓜多尔", group: "E", slot: 4, fifaRank: 23, fifaPoints: 1598.52, baseRating: 78 }),

  team({ code: "nl", name: "荷兰", group: "F", slot: 1, fifaRank: 8, fifaPoints: 1753.57, baseRating: 88, tags: ["hidden-zero-luck"] }),
  team({ code: "jp", name: "日本", group: "F", slot: 2, fifaRank: 18, fifaPoints: 1661.58, baseRating: 81, tags: ["asia"] }),
  team({ code: "se", name: "瑞典", group: "F", slot: 3, fifaRank: 38, fifaPoints: 1509.79, baseRating: 74 }),
  team({ code: "tn", name: "突尼斯", group: "F", slot: 4, fifaRank: 45, fifaPoints: 1476.41, baseRating: 70 }),

  team({ code: "be", name: "比利时", group: "G", slot: 1, fifaRank: 9, fifaPoints: 1742.24, baseRating: 86 }),
  team({ code: "eg", name: "埃及", group: "G", slot: 2, fifaRank: 29, fifaPoints: 1562.37, baseRating: 76 }),
  team({ code: "ir", name: "伊朗", group: "G", slot: 3, fifaRank: 20, fifaPoints: 1619.58, baseRating: 78, tags: ["asia"] }),
  team({ code: "nz", name: "新西兰", group: "G", slot: 4, fifaRank: 85, baseRating: 61 }),

  team({ code: "es", name: "西班牙", group: "H", slot: 1, fifaRank: 2, fifaPoints: 1874.71, baseRating: 93, tags: ["superpower"] }),
  team({ code: "cv", name: "佛得角", group: "H", slot: 2, fifaRank: 67, baseRating: 65 }),
  team({ code: "sa", name: "沙特", group: "H", slot: 3, fifaRank: 61, baseRating: 67, tags: ["asia"] }),
  team({ code: "uy", name: "乌拉圭", group: "H", slot: 4, fifaRank: 16, fifaPoints: 1673.07, baseRating: 83 }),

  team({ code: "fr", name: "法国", group: "I", slot: 1, fifaRank: 3, fifaPoints: 1870.70, baseRating: 93, tags: ["superpower"] }),
  team({ code: "sn", name: "塞内加尔", group: "I", slot: 2, fifaRank: 15, fifaPoints: 1684.07, baseRating: 82 }),
  team({ code: "iq", name: "伊拉克", group: "I", slot: 3, fifaRank: 57, baseRating: 67, tags: ["asia"] }),
  team({ code: "no", name: "挪威", group: "I", slot: 4, fifaRank: 31, fifaPoints: 1557.44, baseRating: 77 }),

  team({ code: "ar", name: "阿根廷", group: "J", slot: 1, fifaRank: 1, fifaPoints: 1877.27, baseRating: 94, tags: ["superpower"] }),
  team({ code: "dz", name: "阿尔及利亚", group: "J", slot: 2, fifaRank: 28, fifaPoints: 1571.03, baseRating: 76 }),
  team({ code: "at", name: "奥地利", group: "J", slot: 3, fifaRank: 24, fifaPoints: 1597.40, baseRating: 78 }),
  team({ code: "jo", name: "约旦", group: "J", slot: 4, fifaRank: 63, baseRating: 66, tags: ["asia"] }),

  team({ code: "pt", name: "葡萄牙", group: "K", slot: 1, fifaRank: 5, fifaPoints: 1767.85, baseRating: 90, tags: ["superpower"] }),
  team({ code: "cd", name: "刚果（金）", group: "K", slot: 2, fifaRank: 46, fifaPoints: 1474.43, baseRating: 70 }),
  team({ code: "uz", name: "乌兹别克", group: "K", slot: 3, fifaRank: 50, fifaPoints: 1458.73, baseRating: 69, tags: ["asia"] }),
  team({ code: "co", name: "哥伦比亚", group: "K", slot: 4, fifaRank: 13, fifaPoints: 1698.35, baseRating: 84 }),

  team({ code: "gb-eng", name: "英格兰", group: "L", slot: 1, fifaRank: 4, fifaPoints: 1828.02, baseRating: 91, tags: ["superpower"] }),
  team({ code: "hr", name: "克罗地亚", group: "L", slot: 2, fifaRank: 11, fifaPoints: 1714.87, baseRating: 85 }),
  team({ code: "gh", name: "加纳", group: "L", slot: 3, fifaRank: 73, baseRating: 64 }),
  team({ code: "pa", name: "巴拿马", group: "L", slot: 4, fifaRank: 34, fifaPoints: 1539.16, baseRating: 74 }),
];

export const CHINA_TEAM = team({
  code: "cn",
  name: "中国队",
  group: null,
  slot: 0,
  fifaRank: 91,
  baseRating: 58,
  tags: ["china"],
});

export const PLAYER_POSITIONS = ["goalkeeper", "defender", "midfielder", "creator", "forward"];
export const PLAYER_ROLES = ["save", "block", "control", "finish", "pace", "setPiece"];

const profile = (name, position, roles) => ({ name, position, roles });
const genericProfiles = (teamName) => [
  profile(`${teamName}队长`, "midfielder", ["control"]),
  profile(`${teamName}门将`, "goalkeeper", ["save"]),
  profile(`${teamName}锋线`, "forward", ["finish"]),
];

export const PLAYER_PROFILES_BY_TEAM = {
  cn: [
    profile("武磊", "forward", ["finish", "pace"]),
    profile("张玉宁", "forward", ["finish"]),
    profile("王大雷", "goalkeeper", ["save"]),
    profile("蒋光太", "defender", ["block"]),
    profile("谢鹏飞", "creator", ["control", "setPiece"]),
    profile("韦世豪", "forward", ["finish", "pace"]),
  ],
  mx: [profile("希门尼斯", "forward", ["finish"]), profile("埃德松", "midfielder", ["control"]), profile("奥乔亚", "goalkeeper", ["save"])],
  za: genericProfiles("南非"),
  kr: [profile("孙兴慜", "forward", ["finish", "pace"]), profile("李刚仁", "creator", ["control", "setPiece"]), profile("金玟哉", "defender", ["block"])],
  cz: [profile("希克", "forward", ["finish"]), profile("绍切克", "midfielder", ["control", "block"]), profile("切尔尼", "creator", ["pace"])],
  ca: [profile("戴维", "forward", ["finish", "pace"]), profile("阿方索", "creator", ["pace", "control"]), profile("欧斯塔基奥", "midfielder", ["control"])],
  ba: [profile("哲科", "forward", ["finish"]), profile("皮亚尼奇", "creator", ["control", "setPiece"]), profile("科拉希纳茨", "defender", ["block"])],
  qa: [profile("阿菲夫", "creator", ["control", "pace"]), profile("阿里", "forward", ["finish"]), profile("巴沙姆", "goalkeeper", ["save"])],
  ch: [profile("扎卡", "midfielder", ["control", "setPiece"]), profile("阿坎吉", "defender", ["block"]), profile("索默", "goalkeeper", ["save"])],
  br: [profile("内马尔", "creator", ["control", "setPiece", "finish"]), profile("维尼修斯", "forward", ["finish", "pace"]), profile("阿利森", "goalkeeper", ["save"])],
  ma: [profile("阿什拉夫", "defender", ["pace", "block"]), profile("齐耶赫", "creator", ["control", "setPiece"]), profile("布努", "goalkeeper", ["save"])],
  ht: genericProfiles("海地"),
  "gb-sct": [profile("麦克托米奈", "midfielder", ["control", "finish"]), profile("罗伯逊", "defender", ["pace", "block"]), profile("麦金", "midfielder", ["control"])],
  us: [profile("普利西奇", "creator", ["control", "finish", "pace"]), profile("雷纳", "creator", ["control"]), profile("泰勒亚当斯", "midfielder", ["block", "control"])],
  py: [profile("阿尔米隆", "creator", ["pace", "control"]), profile("恩西索", "forward", ["finish"]), profile("巴拉圭队长", "defender", ["block"])],
  au: [profile("古德温", "creator", ["setPiece", "control"]), profile("博伊尔", "forward", ["pace", "finish"]), profile("瑞恩", "goalkeeper", ["save"])],
  tr: [profile("恰尔汗奥卢", "creator", ["control", "setPiece"]), profile("居莱尔", "creator", ["control", "finish"]), profile("德米拉尔", "defender", ["block"])],
  de: [profile("穆西亚拉", "creator", ["control", "finish"]), profile("维尔茨", "creator", ["control", "setPiece"]), profile("诺伊尔", "goalkeeper", ["save"])],
  cw: genericProfiles("库拉索"),
  ci: [profile("凯西", "midfielder", ["control", "block"]), profile("阿丁格拉", "forward", ["pace", "finish"]), profile("科特迪瓦门将", "goalkeeper", ["save"])],
  ec: [profile("凯塞多", "midfielder", ["control", "block"]), profile("恩纳瓦伦西亚", "forward", ["finish"]), profile("因卡皮耶", "defender", ["block"])],
  nl: [profile("范戴克", "defender", ["block"]), profile("德容", "midfielder", ["control"]), profile("加克波", "forward", ["finish", "pace"])],
  jp: [profile("三笘薰", "creator", ["pace", "control"]), profile("久保建英", "creator", ["control", "setPiece"]), profile("远藤航", "midfielder", ["block", "control"])],
  se: [profile("伊萨克", "forward", ["finish", "pace"]), profile("库卢塞夫斯基", "creator", ["control"]), profile("林德洛夫", "defender", ["block"])],
  tn: genericProfiles("突尼斯"),
  be: [profile("德布劳内", "creator", ["control", "setPiece"]), profile("卢卡库", "forward", ["finish", "control"]), profile("库尔图瓦", "goalkeeper", ["save"])],
  eg: [profile("萨拉赫", "forward", ["finish", "pace"]), profile("特雷泽盖", "creator", ["control", "finish"]), profile("埃及门将", "goalkeeper", ["save"])],
  ir: [profile("塔雷米", "forward", ["finish"]), profile("阿兹蒙", "forward", ["finish"]), profile("贝兰万德", "goalkeeper", ["save"])],
  nz: [profile("伍德", "forward", ["finish"]), profile("新西兰队长", "defender", ["block"]), profile("新西兰门将", "goalkeeper", ["save"])],
  es: [profile("亚马尔", "creator", ["pace", "control"]), profile("佩德里", "midfielder", ["control"]), profile("罗德里", "midfielder", ["control", "block"])],
  cv: genericProfiles("佛得角"),
  sa: [profile("多萨里", "creator", ["control", "finish"]), profile("布赖坎", "forward", ["finish"]), profile("奥韦斯", "goalkeeper", ["save"])],
  uy: [profile("巴尔韦德", "midfielder", ["control", "finish"]), profile("努涅斯", "forward", ["finish", "pace"]), profile("阿劳霍", "defender", ["block"])],
  fr: [profile("姆巴佩", "forward", ["finish", "pace"]), profile("登贝莱", "creator", ["control", "finish", "pace"]), profile("迈尼昂", "goalkeeper", ["save"])],
  sn: [profile("马内", "forward", ["finish", "pace"]), profile("库利巴利", "defender", ["block"]), profile("门迪", "goalkeeper", ["save"])],
  iq: genericProfiles("伊拉克"),
  no: [profile("哈兰德", "forward", ["finish"]), profile("厄德高", "creator", ["control", "setPiece"]), profile("挪威门将", "goalkeeper", ["save"])],
  ar: [profile("梅西", "creator", ["control", "setPiece", "finish"]), profile("劳塔罗", "forward", ["finish"]), profile("马丁内斯", "goalkeeper", ["save"])],
  dz: [profile("马赫雷斯", "creator", ["control", "setPiece"]), profile("本纳赛尔", "midfielder", ["control"]), profile("阿尔及利亚门将", "goalkeeper", ["save"])],
  at: [profile("阿拉巴", "defender", ["block", "setPiece"]), profile("萨比策", "midfielder", ["control", "finish"]), profile("阿瑙托维奇", "forward", ["finish"])],
  jo: genericProfiles("约旦"),
  pt: [profile("C罗", "forward", ["finish", "pace"]), profile("B费", "creator", ["control", "setPiece"]), profile("鲁本迪亚斯", "defender", ["block"])],
  cd: genericProfiles("刚果金"),
  uz: [profile("肖穆罗多夫", "forward", ["finish"]), profile("乌兹别克队长", "midfielder", ["control"]), profile("乌兹别克门将", "goalkeeper", ["save"])],
  co: [profile("迪亚斯", "forward", ["pace", "finish"]), profile("J罗", "creator", ["control", "setPiece"]), profile("哥伦比亚门将", "goalkeeper", ["save"])],
  "gb-eng": [profile("凯恩", "forward", ["finish", "control"]), profile("贝林厄姆", "midfielder", ["control", "finish"]), profile("萨卡", "creator", ["pace", "control"])],
  hr: [profile("莫德里奇", "creator", ["control", "setPiece"]), profile("格瓦迪奥尔", "defender", ["block"]), profile("利瓦科维奇", "goalkeeper", ["save"])],
  gh: [profile("库杜斯", "creator", ["control", "finish"]), profile("托马斯", "midfielder", ["control", "block"]), profile("加纳门将", "goalkeeper", ["save"])],
  pa: [profile("巴尔塞纳斯", "creator", ["control"]), profile("巴拿马队长", "defender", ["block"]), profile("巴拿马门将", "goalkeeper", ["save"])],
};

export const GROUPS = Array.from({ length: 12 }, (_, index) => {
  const id = String.fromCharCode("A".charCodeAt(0) + index);
  return {
    id,
    teams: TEAMS.filter((item) => item.group === id).sort((a, b) => a.slot - b.slot),
  };
});

export const TEAM_BY_CODE = Object.fromEntries(TEAMS.map((item) => [item.code, item]));

export function getTeamByCode(code) {
  return TEAM_BY_CODE[code] || null;
}

export function getGroupById(groupId) {
  return GROUPS.find((group) => group.id === groupId) || null;
}

export function getReplacementDifficulty(teamData) {
  if (!teamData) return 0;
  if (teamData.baseRating >= 88) return 8;
  if (teamData.baseRating >= 82) return 5;
  if (teamData.baseRating >= 74) return 1;
  if (teamData.baseRating >= 68) return -2;
  return -5;
}
