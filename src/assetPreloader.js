import { getCountryDefeatedCharacterAsset, getSettlementCharacterAsset } from "./characterAssets";
import { TEAMS } from "./game/teams";

const ATTRIBUTE_ASSETS = [
  "/assets/attribute/attack.png",
  "/assets/attribute/defense.png",
  "/assets/attribute/midfield.png",
  "/assets/attribute/stamina.png",
  "/assets/attribute/tactics.png",
  "/assets/attribute/luck.png",
  "/assets/attribute/dice.png",
];

const FLAG_ASSETS = Array.from(new Set(["cn", ...TEAMS.map((team) => team.code)])).map((code) => `/assets/flags/${code}.svg`);

const GROUP_SURVIVAL_ASSETS = Array.from(
  { length: 10 },
  (_, index) => `/assets/group-result/china-group-survival-${String(index + 1).padStart(2, "0")}.png`,
);

const COMMON_RESULT_ASSETS = [
  "/assets/replacement/china-team-sticker.svg",
  "/assets/worldcup-trophy-cutout.png",
  "/assets/worldcup-trophy-crop.png",
  ...GROUP_SURVIVAL_ASSETS,
];

const ATTRIBUTE_FONT_SAMPLE = "给国足塞点属性 可分配点数 锋线火力 铁桶防线 中场脑子 体能韧性 战术整活 幸运值 预设方案 随机配点";
const REPLACEMENT_FONT_SAMPLE = `替换一个倒霉蛋 挑一个倒霉蛋 中国队顺手继承它的小组和赛程 ${TEAMS.map((team) => team.name).join(" ")}`;
const RESULT_FONT_SAMPLE =
  "小组赛结束 晋级队伍速览 本场战报 比赛进行中 席位等待终场 世界杯冠军 奇迹路径 分享这条宇宙线 保存战报图 重新复活赛";

const loadedAssets = new Set();
const queuedAssets = new Set();
const loadedFontSamples = new Set();
const taskQueue = [];
let activeTasks = 0;
let pumpScheduled = false;

function getMaxParallelTasks() {
  if (typeof navigator === "undefined") return 2;
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  const effectiveType = connection?.effectiveType || "";
  if (effectiveType.includes("2g")) return 1;
  if (effectiveType.includes("3g")) return 2;
  return 3;
}

function schedulePump() {
  if (pumpScheduled || typeof window === "undefined") return;
  pumpScheduled = true;
  const run = () => {
    pumpScheduled = false;
    pumpQueue();
  };

  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(run, { timeout: 700 });
    return;
  }

  window.setTimeout(run, 120);
}

function pumpQueue() {
  const maxParallel = getMaxParallelTasks();
  while (activeTasks < maxParallel && taskQueue.length > 0) {
    const task = taskQueue.shift();
    activeTasks += 1;
    Promise.resolve()
      .then(task)
      .catch(() => {})
      .finally(() => {
        activeTasks -= 1;
        if (taskQueue.length > 0) schedulePump();
      });
  }
}

function enqueueTask(task, priority = "normal") {
  if (priority === "high") {
    taskQueue.unshift(task);
  } else {
    taskQueue.push(task);
  }
  schedulePump();
}

function warmImage(src) {
  return new Promise((resolve) => {
    const image = new Image();
    image.decoding = "async";
    image.loading = "eager";
    image.onload = resolve;
    image.onerror = resolve;
    image.src = src;
  });
}

function preloadImages(urls, { priority = "normal" } = {}) {
  for (const src of urls) {
    if (!src || loadedAssets.has(src) || queuedAssets.has(src)) continue;
    queuedAssets.add(src);
    enqueueTask(
      () =>
        warmImage(src).finally(() => {
          loadedAssets.add(src);
        }),
      priority,
    );
  }
}

function warmFontSample(sample, { priority = "normal" } = {}) {
  if (typeof document === "undefined" || !document.fonts || !sample) return;
  const compactSample = sample.replace(/\s+/g, " ").trim();
  if (!compactSample || loadedFontSamples.has(compactSample)) return;
  loadedFontSamples.add(compactSample);

  enqueueTask(
    () =>
      Promise.allSettled([
        document.fonts.load("380 16px MiSans", compactSample),
        document.fonts.load("630 16px MiSans", compactSample),
      ]),
    priority,
  );
}

function getGameRunCharacterAssets(gameRun) {
  if (!gameRun) return [];
  const assets = [];

  for (const round of gameRun.knockoutRounds || []) {
    if (round?.opponent?.code) {
      assets.push(getCountryDefeatedCharacterAsset(round.opponent.code, round.opponent.name).src);
    }
  }

  assets.push(
    getSettlementCharacterAsset({
      result: gameRun.settlement?.result || gameRun.result,
      defeatedOpponentCode: gameRun.settlement?.defeatedOpponentCode,
      defeatedOpponentName: gameRun.settlement?.defeatedOpponentName,
      failureReason: gameRun.settlement?.failureReason,
      failureSeed: gameRun.settlement?.failureSeed,
    }).src,
  );

  return assets;
}

export function preloadAttributeScreenAssets() {
  preloadImages(ATTRIBUTE_ASSETS, { priority: "high" });
  warmFontSample(ATTRIBUTE_FONT_SAMPLE, { priority: "high" });
}

export function preloadReplacementScreenAssets() {
  preloadImages(["/assets/replacement/china-team-sticker.svg", ...FLAG_ASSETS], { priority: "normal" });
  warmFontSample(REPLACEMENT_FONT_SAMPLE);
}

export function preloadPostReplacementAssets() {
  preloadImages(COMMON_RESULT_ASSETS, { priority: "normal" });
  warmFontSample(RESULT_FONT_SAMPLE);
}

export function preloadGameRunAssets(gameRun) {
  if (!gameRun) return;
  const teamNames = [
    gameRun.selectedTeam?.name,
    gameRun.chinaGroup?.id,
    ...(gameRun.chinaGroup?.teams || []).map((team) => team.name),
    ...(gameRun.knockoutRounds || []).map((round) => round.opponent?.name),
    ...(gameRun.pathRows || []).map((row) => row.opponentName || row.targetName || row.text),
  ]
    .filter(Boolean)
    .join(" ");

  preloadImages([...COMMON_RESULT_ASSETS, ...getGameRunCharacterAssets(gameRun)], { priority: "high" });
  warmFontSample(`${RESULT_FONT_SAMPLE} ${teamNames}`, { priority: "high" });
}
