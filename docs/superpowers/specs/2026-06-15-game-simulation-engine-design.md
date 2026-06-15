---
comet_change: build-game-simulation-engine
role: technical-design
canonical_spec: openspec
archived-with: 2026-06-16-build-game-simulation-engine
status: final
---

# 游戏模拟引擎技术设计

## 背景

当前原型的视觉流程已经完整，但小组赛、淘汰赛、比分、晋级席位、结算路径和角色图仍由 `src/App.jsx` 中的演示常量定义。正式游戏逻辑需要从组件中抽离，形成可测试、可调参、可复现的纯前端模拟引擎。

本项目必须保持静态站点形态：生产域名 `https://game.ppserver.xyz` 经 Cloudflare DNS-only 到腾讯云 CDN，再到腾讯云 COS 香港 Bucket 静态网站。第一版不引入服务器、数据库、登录、云存档、排行榜或长期持久化。

## 模块边界

新增 `src/game/`，按职责拆分：

- `teams.js`：48 队分组、签位、中文名、国旗代码、FIFA 排名快照、游戏 `baseRating`、标签和替换难度。
- `random.js`：稳定 hash、seeded RNG、加权选择、泊松/简化进球采样。
- `model.js`：属性计算、China skill、luck 概率曲线、rating 差转期望进球、比分限制。
- `zeroLuckRoutes.js`：显式 0 幸运隐藏冠军路线表。
- `commentary.js`：属性加权事件模板、语义 rich parts、幸运夸张等级。
- `simulation.js`：唯一对外入口 `simulateTournament(config)`，返回完整 `SimulationResult`。
- `telemetry.js`：CDN pixel 埋点，不存游戏进度。

React 层只保留展示与交互状态：属性输入、替换选择、当前页、淘汰赛当前轮次。比赛事实由 `SimulationResult` 提供。

## 数据合同

`GameConfig`：

```js
{
  attributes: { attack, defense, midfield, stamina, tactics, luck },
  replacedTeamCode: "nl",
  seed?: "string"
}
```

`SimulationResult`：

```js
{
  config,
  seed,
  finalAchievement,
  outcomeType,
  replacedTeam,
  chinaGroup,
  groupStage: {
    summary,
    standings,
    chinaMatches,
    advancePreview,
    chinaAdvanced,
    chinaPlacement
  },
  knockout: {
    rounds,
    advancementStages,
    podium
  },
  settlement: {
    result,
    pathRows,
    defeatedOpponentCode,
    defeatedOpponentName,
    failureReason,
    failureSeed,
    title,
    subtitle
  }
}
```

现有页面的改造目标不是重画 UI，而是把页面内硬编码常量替换成以上字段。

## 概率与胜率模型

先决定最终成就，再回填路径。原因是这个产品是娱乐小游戏，结算和分享需要稳定叙事；如果逐场完全独立采样，容易出现节奏失控、过早出局或不合适的战报密度。

推荐冠军概率曲线以 `luck` 为主轴，但受非幸运属性和替换入口修正：

| luck | 基础冠军概率 |
| ---: | ---: |
| 0 | 0，除显式隐藏路线 |
| 1 | 2% |
| 2 | 4% |
| 3 | 7% |
| 4 | 11% |
| 5 | 17% |
| 6 | 25% |
| 7 | 36% |
| 8 | 49% |
| 9 | 62% |
| 10 | 72% |

修正项：

- 非幸运属性总评分高：最多 +8%。
- 替换弱队或好签位：最多 +5%。
- 替换强队或困难签位：最多 -8%。
- `luck=10` 且构筑合理时上限可到 80%；差构筑不能无脑 80%。

失败成就按概率余量分布到小组出局、32 强、16 强、8 强、四强、亚军等结果。高 luck 失败也要更戏剧化，低 luck 失败更像“现实拉回来了”。

## 属性内容模型

五项非幸运属性决定比赛内容：

- `attack` 高：射门、反击、禁区混战、前锋终结事件更多。
- `defense` 高：门将、铁桶、大巴、解围、低比分、门线救险更多。
- `midfield` 高：控球、直塞、节奏、传导和对手困惑更多。
- `stamina` 高：下半场、补时、加时、点球、最后冲刺更多。
- `tactics` 高：定位球、怪阵、换人、强队克制和战术板梗更多。
- `luck` 高：VAR、门柱、乌龙、天气、设备、离谱巧合、夸张事件更多。

每场战报先按比分和阶段生成骨架，再按 dominant attributes 填充事件。淘汰赛报告继续使用现有语义高亮：时间和比分胶囊、队名蓝色、球员暖橙、系统/事件紫色。

## 排名与比分模型

FIFA 排名只作为源数据，不直接等同游戏实力。`baseRating` 由排名、积分和游戏平衡微调得到。

比赛期望进球：

```js
lambdaA = clamp(1.12 + (powerA - powerB) / 30, 0.25, 3.2)
lambdaB = clamp(1.12 + (powerB - powerA) / 30, 0.25, 3.2)
```

中国队 power：

```js
skill = 38
  + attack * 1.9
  + defense * 1.9
  + midfield * 1.5
  + stamina * 1.2
  + tactics * 1.5
```

淘汰赛中 stamina 和 tactics 追加小修正；面对强队时高 tactics 可提供克制加成。比分要保留足球低比分特征，强弱差距大时提高 2 球以上胜利概率，但不把比赛写成篮球分。

## 0 幸运隐藏路线

`luck=0` 完全确定。没有随机救场，没有普通幸运事件。

第一条隐藏冠军路线：

- 属性：`attack=7, defense=7, midfield=6, stamina=5, tactics=5, luck=0`
- 替换：荷兰 `nl`，继承 F1
- 路径：小组压线晋级，32 强、16 强、8 强、半决赛逐步过关
- 决赛：中国队 1:0 日本
- 结算：冠军态展示日本战败角色图

可以再保留 1-2 条表驱动隐藏路线，例如东道主借壳线或强队借壳线，但全部必须是显式表项。所谓 3% 是“有提示后的 0 幸运硬核尝试池”体验目标；在所有随机配置和 48 队空间里，精确隐藏路线的自然占比必然远低于 3%。

## UI 接入

`App` 新增 `simulationResult` state：

- 点击替换页 CTA 时生成结果并进入 transition。
- 随机整一局时生成随机属性、随机替换队伍和结果。
- group 页面读取 `simulationResult.groupStage`。
- knockout 页面读取 `simulationResult.knockout.rounds[roundIndex]` 和 advancement state。
- final/failure 页面读取 `simulationResult.settlement`。

若用户通过 `?screen=...` 直接打开内部页面且没有 `simulationResult`，回到首页或生成一条默认演示结果。不要用 localStorage/sessionStorage 保存进度。

## 结算角色

冠军：

```js
getSettlementCharacterAsset({
  result: "champion",
  defeatedOpponentCode,
  defeatedOpponentName
})
```

失败：

```js
getSettlementCharacterAsset({
  result: "failure",
  failureReason,
  failureSeed
})
```

页面组件不得直接拼 `/assets/characters/...`。

## 部署与埋点

Vite 配置显式：

```js
build: {
  sourcemap: false
}
```

添加 `public/__track/pixel.gif`，构建后应存在于 `dist/__track/pixel.gif`。

`track(eventName, data)` 使用 `new Image()` 请求 `/__track/pixel.gif`。`sessionStorage` 只保存匿名 `sid`，不保存属性、赛程、比分或结算结果。

首版事件：

- `page_view`
- `game_start`
- `attribute_submit`
- `team_selected`
- `group_stage_result`
- `knockout_result`
- `final_result`
- `champion`
- `failed`
- `restart`
- `share_click`

## 测试策略

- 单元级脚本验证：
  - zero-luck 同配置重复完全一致。
  - `7/7/6/5/5/0 + nl` 生成中国 1:0 日本冠军路线。
  - luck 概率随分数单调上升，luck 10 合理构筑不超过 80%上限。
  - 高 rating 球队在大量样本中胜率高于低 rating 球队。
  - rating gap 更大时平均比分差更大。
- 构建验证：
  - `npm run build`
  - `dist/index.html` 存在。
  - `dist/dist/index.html` 不存在。
  - `dist/__track/pixel.gif` 存在。
  - `dist/assets/` 没有 `.map` 文件。
- 浏览器验证：
  - 400x865 手机视口完整跑一条冠军线。
  - 400x865 手机视口完整跑一条失败线。
  - 结算页冠军角色对应最终被击败队伍，失败页使用中国失败变体。

## 开放问题

- 额外 0 幸运隐藏路线保留几条：第一版建议最多 3 条，避免攻略空间过散。
- 分享链接是否在本 change 内支持只读恢复：当前建议不做，只保留复制当前链接和战报图。
- 是否显示 FIFA 排名来源说明：第一版建议不在 UI 中强调，避免严肃预测误解；可在 README 中记录来源日期。
