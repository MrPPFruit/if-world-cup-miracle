const CHARACTER_ASSET_ROOT = "/assets/characters";

const COUNTRY_CHARACTER_NAMES = {
  mx: "墨西哥",
  za: "南非",
  kr: "韩国",
  cz: "捷克",
  ca: "加拿大",
  ba: "波黑",
  qa: "卡塔尔",
  ch: "瑞士",
  br: "巴西",
  ma: "摩洛哥",
  ht: "海地",
  "gb-sct": "苏格兰",
  us: "美国",
  py: "巴拉圭",
  au: "澳大利亚",
  tr: "土耳其",
  de: "德国",
  cw: "库拉索",
  ci: "科特迪瓦",
  ec: "厄瓜多尔",
  nl: "荷兰",
  jp: "日本",
  se: "瑞典",
  tn: "突尼斯",
  be: "比利时",
  eg: "埃及",
  ir: "伊朗",
  nz: "新西兰",
  es: "西班牙",
  cv: "佛得角",
  sa: "沙特",
  uy: "乌拉圭",
  fr: "法国",
  sn: "塞内加尔",
  iq: "伊拉克",
  no: "挪威",
  ar: "阿根廷",
  dz: "阿尔及利亚",
  at: "奥地利",
  jo: "约旦",
  pt: "葡萄牙",
  cd: "刚果（金）",
  uz: "乌兹别克",
  co: "哥伦比亚",
  "gb-eng": "英格兰",
  hr: "克罗地亚",
  gh: "加纳",
  pa: "巴拿马",
};

const COUNTRY_CHARACTER_DISPLAY_SCALE = {
  br: 1.3,
};

export const COUNTRY_DEFEATED_CHARACTER_CODES = Object.keys(COUNTRY_CHARACTER_NAMES);

export const CHINA_DEFEATED_CHARACTER_VARIANTS = {
  "pack-home": {
    src: `${CHARACTER_ASSET_ROOT}/pending/cn-defeated-01.png`,
    label: "打包回家",
  },
  "net-trap": {
    src: `${CHARACTER_ASSET_ROOT}/pending/cn-defeated-02.png`,
    label: "球网裹住",
  },
  "tactics-collapse": {
    src: `${CHARACTER_ASSET_ROOT}/pending/cn-defeated-03.png`,
    label: "战术崩盘",
  },
  "var-frozen": {
    src: `${CHARACTER_ASSET_ROOT}/pending/cn-defeated-04.png`,
    label: "VAR 石化",
  },
  "luggage-chase": {
    src: `${CHARACTER_ASSET_ROOT}/pending/cn-defeated-05.png`,
    label: "追行李车",
  },
};

const CHINA_FAILURE_VARIANT_BY_REASON = {
  groupExit: "pack-home",
  groupEliminated: "pack-home",
  ownGoal: "net-trap",
  defensiveCollapse: "net-trap",
  tacticalMess: "tactics-collapse",
  tacticsCollapse: "tactics-collapse",
  var: "var-frozen",
  offside: "var-frozen",
  lateCollapse: "luggage-chase",
  finalWhistle: "luggage-chase",
};

function normalizeCode(code) {
  return String(code || "").trim();
}

function getCountryCharacterSrc(code) {
  if (code === "ar") {
    return `${CHARACTER_ASSET_ROOT}/argentina-defeated-10.png`;
  }
  return `${CHARACTER_ASSET_ROOT}/pending/${code}-defeated.png`;
}

export function getCountryDefeatedCharacterAsset(teamCode, teamName) {
  const normalizedCode = normalizeCode(teamCode);
  const code = COUNTRY_CHARACTER_NAMES[normalizedCode] ? normalizedCode : "ar";
  const name = teamName || COUNTRY_CHARACTER_NAMES[code] || "对手";

  return {
    type: "country",
    code,
    name,
    src: getCountryCharacterSrc(code),
    alt: `${name}队战败形象`,
    displayScale: COUNTRY_CHARACTER_DISPLAY_SCALE[code] || 1,
  };
}

export function getChinaDefeatedCharacterAsset({ variant, reason, seed = 0 } = {}) {
  const variantKeys = Object.keys(CHINA_DEFEATED_CHARACTER_VARIANTS);
  const variantKey =
    (variant && CHINA_DEFEATED_CHARACTER_VARIANTS[variant] && variant) ||
    CHINA_FAILURE_VARIANT_BY_REASON[reason] ||
    variantKeys[Math.abs(seed) % variantKeys.length];
  const asset = CHINA_DEFEATED_CHARACTER_VARIANTS[variantKey];

  return {
    type: "china",
    code: "cn",
    variant: variantKey,
    name: `中国队失败形象：${asset.label}`,
    src: asset.src,
    alt: `中国队失败形象 ${asset.label}`,
    displayScale: 1,
  };
}

export function getSettlementCharacterAsset({
  result = "champion",
  defeatedOpponentCode,
  defeatedOpponentName,
  failureVariant,
  failureReason,
  failureSeed = 0,
} = {}) {
  if (result === "failure") {
    return getChinaDefeatedCharacterAsset({
      variant: failureVariant,
      reason: failureReason,
      seed: failureSeed,
    });
  }

  return getCountryDefeatedCharacterAsset(defeatedOpponentCode, defeatedOpponentName);
}
