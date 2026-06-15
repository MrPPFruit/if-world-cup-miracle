# Comet Design Handoff

- Change: expand-dynamic-commentary-system
- Phase: design
- Mode: compact
- Context hash: c260249610d430d95baf151b6f8480a2adc3c70e4d696acc5c7addb79de1b6c1

Generated-by: comet-handoff.sh

OpenSpec remains the canonical capability spec. This handoff is a deterministic, source-traceable context pack, not an agent-authored summary.

## openspec/changes/expand-dynamic-commentary-system/proposal.md

- Source: openspec/changes/expand-dynamic-commentary-system/proposal.md
- Lines: 1-28
- SHA256: 9cb8fdb3374cb09c0d2a5e4244d2b14368ca267ce40819d1a9038c14a2ab0b03

```md
## Why

当前模拟引擎已经能生成完整世界杯 IF 路径，但动态文案仍偏少，部分页面文案也还停留在固定提示或旧 demo 兜底。玩家重复游玩时，属性、对手、比分、失败阶段、冠军路线等差异没有被充分转化为叙事差异。

这次变更要把文案当成模拟结果的一部分：既保持国足 IF 小游戏的无厘头和梗感，也让文案尊重比赛事实、球员位置、UI 字数限制和非低俗表达边界。

## What Changes

- 扩展动态文案生成系统，让小组赛过渡流、淘汰赛战报、晋级提示、结算路径和失败/冠军表达根据模拟上下文变化。
- 增加参赛国家队球星/位置语境文案，按球队、球员位置、对手强弱和比赛事件触发，不使用退役传奇或非本届国家队语境人物。
- 建立短文案与长战报的长度边界，避免按钮、卡片、小组赛总览、晋级席位板等紧凑 UI 被长文本破坏。
- 评估并清理旧 demo 或硬编码兜底文案，保留必要 UI 标题，移除会与真实模拟结果冲突的内容。
- 补充验证，覆盖文案结构、语义高亮、零幸运确定性、明星文案安全边界和 UI 文案长度约束。

## Capabilities

### New Capabilities
- `dynamic-commentary`: 覆盖模拟上下文驱动的多样化文案、球星位置语境、语义高亮、安全表达和 UI 长度限制。

### Modified Capabilities
- `game-simulation`: 模拟结果需要继续作为文案事实源，生成过程必须保持 seeded deterministic，尤其是 luck=0 路线。

## Impact

- 主要影响 `src/game/commentary.js`、`src/game/simulation.js`、`src/game/teams.js` 和相关验证脚本。
- 可能少量调整 `src/App.jsx` 中仍保留的旧 demo/fallback 文案，让真实运行路径优先消费 simulation result。
- 不新增后端、数据库、登录、云存档、外部实时数据或生产 sourcemap。
- 不改变核心赛果概率、晋级规则、静态部署与 telemetry 约束。
```

## openspec/changes/expand-dynamic-commentary-system/design.md

- Source: openspec/changes/expand-dynamic-commentary-system/design.md
- Lines: 1-65
- SHA256: b842665e6c64299ec255afffda311e3a4d49c218f75fea5e89a36b652d91fbc0

```md
## Context

项目是纯前端世界杯 IF 小游戏。当前 `simulateWorldCupRun()` 会在过渡页前生成完整 `SimulationResult`，后续小组赛、淘汰赛和结算页都消费这份结果。动态文案集中在 `src/game/commentary.js`，但文案池较少，且部分页面仍有固定 fallback/demo 文案。

本次变更需要在不改变赛果概率、不引入后台、不破坏 400×865 移动端布局的前提下，让文案更像游戏叙事引擎的一部分。

## Goals / Non-Goals

**Goals:**
- 用模拟事实驱动文案：阶段、对手、比分、胜负、点球、属性主导、幸运值、失败阶段和冠军路线都进入文案上下文。
- 增加参赛国家队球星语境，并按位置触发不同事件文案。
- 区分短 UI 文案和长战报文案，给紧凑位置设置明确长度预算。
- 清理或降级旧 demo/fallback 文案，避免和真实模拟结果冲突。
- 增加验证脚本，确保文案结构、语义高亮、零幸运确定性和长度预算稳定。

**Non-Goals:**
- 不接入实时 FIFA 数据、球员 API、新闻数据或外部 LLM。
- 不改变核心赛果概率、晋级规则、隐藏零幸运冠军路线。
- 不新增页面、后端、数据库、云存档、登录或付费功能。
- 不做低俗、恶俗、地域攻击、球员羞辱或群体伤害表达。

## Decisions

1. **文案上下文在引擎层生成，而不是页面层拼接**
   - 做法：`commentary.js` 暴露按场景生成的函数，输入 match、opponent、attributes、roundLabel、rng、runPlan 等事实。
   - 理由：页面只负责渲染 rich parts；文案事实源保持在 simulation result 生成阶段，避免 UI 组件推断比赛逻辑。
   - 替代方案：在 `App.jsx` 按页面状态随机选文案。放弃，因为会复制业务逻辑，也容易让文案和比分/晋级状态不一致。

2. **球队数据补充静态代表球员语境**
   - 做法：在 `teams.js` 或独立模块加入 `stars`/`playerProfiles`，包含姓名、位置、角色标签和克制的事件触发语义。
   - 理由：项目必须保持静态站和 frozen snapshot。球星文案也应 frozen，不能依赖实时名单。
   - 替代方案：直接在文案模板里硬编码球星名。放弃，因为难以按球队/位置验证，也难以避免错配。

3. **短文案与长文案分预算**
   - 做法：为 CTA、status、hint、path small、group hero、feed line、battle report line 设置不同最大长度。生成器优先选择符合位置的模板。
   - 理由：已有 UI 是紧凑移动端布局，长文本会破坏按钮、卡片、晋级席位板和结算路径。
   - 替代方案：让 CSS 自动压缩或省略所有文本。放弃，因为这会隐藏核心梗点，也不能解决语义过长。

4. **荒诞度由场景控制，不能无条件堆梗**
   - 做法：高幸运、绝杀、点球、爆冷、隐藏零幸运路线可提高无厘头模板权重；普通比赛保持“懂球但嘴碎”的轻喜剧语气。
   - 理由：如果每句话都过度夸张，玩家会失去节奏差异；失败页也需要留出一点体面。

5. **语义高亮沿用 rich parts**
   - 做法：继续使用 `time/team/player/system/score/text` part kind。球队用 team，球员用 player，VAR/裁判/积分榜等用 system，比分用 score。
   - 理由：现有 CSS 已根据 part kind 建立语义色彩，扩展文案不应重新造渲染协议。

## Risks / Trade-offs

- [Risk] 球星名单可能与最终参赛名单漂移 → Mitigation: 明确作为静态游戏快照，只使用当前项目确认语境下的代表球员；后续可独立更新名单。
- [Risk] 文案池过大后维护困难 → Mitigation: 按场景、位置、事件类型分组，并用验证脚本检查结构和长度。
- [Risk] 无厘头表达踩到低俗或冒犯边界 → Mitigation: 禁止身体羞辱、地域/民族攻击、侮辱性失败描写；失败也写成宇宙线/赛事实验，不攻击球员个人。
- [Risk] 增加随机模板影响零幸运确定性 → Mitigation: 所有选择继续使用 seeded rng，验证同配置同 seed 的 path/commentary 稳定。
- [Risk] UI 短位文案被长模板撑破 → Mitigation: 给紧凑字段加预算检查，必要时让短位只消费专门 short copy。

## Migration Plan

1. 建立文案上下文与球员语境数据。
2. 扩展小组赛、淘汰赛、结算路径和短 UI 文案生成器。
3. 替换或删除真实路径中冲突的旧 demo/fallback 文案。
4. 补充验证脚本并运行 `npm run verify:game`、`npm run build`。
5. 使用本地预览抽查关键路径 UI，确认长文本没有破坏布局。

## Open Questions

- 是否要在后续版本为球星名单单独建立可维护的 `docs/player-copy-guidelines.md`，记录每名球员可用/不可用的文案方向。
```

## openspec/changes/expand-dynamic-commentary-system/tasks.md

- Source: openspec/changes/expand-dynamic-commentary-system/tasks.md
- Lines: 1-22
- SHA256: a29c90b9b1a9234f2ca823b4f210dcffd5a5d0ec05b4f5381318d4e627eb2c7e

```md
## 1. Commentary Data Model

- [ ] 1.1 Add static national-team player profiles with team, position, and safe role tags.
- [ ] 1.2 Add commentary context helpers for match phase, score flow, opponent strength, attribute profile, luck tone, and UI surface budget.

## 2. Dynamic Copy Generation

- [ ] 2.1 Expand transition and group-stage commentary using replacement team, group opponents, scores, attributes, and compact semantic highlights.
- [ ] 2.2 Expand knockout battle reports with role-compatible star references, score-state lines, penalties, upset tones, and attribute-specific events.
- [ ] 2.3 Add generated short copy for group result, advancement hints, settlement path notes, and failure/champion hero details without breaking compact UI surfaces.
- [ ] 2.4 Remove or neutralize old demo/fallback copy that can conflict with real simulation results.

## 3. Verification

- [ ] 3.1 Extend game verification for deterministic commentary, player/team matching, position-compatible events, semantic part kinds, and compact-copy length budgets.
- [ ] 3.2 Run `npm run verify:game` and `npm run build`.
- [ ] 3.3 Preview the app in the Codex in-app browser and screenshot-review key result screens for text overflow or layout breakage.

## 4. Closeout

- [ ] 4.1 Update design QA or project notes with the dynamic commentary system boundary.
- [ ] 4.2 Run OpenSpec/Comet validation and prepare the change for archive.
```

## openspec/changes/expand-dynamic-commentary-system/specs/dynamic-commentary/spec.md

- Source: openspec/changes/expand-dynamic-commentary-system/specs/dynamic-commentary/spec.md
- Lines: 1-64
- SHA256: b438ea65ab246ac34d15d88e5fc33aaef93986e4cb63af8cfa319ea5a1a25593

```md
## ADDED Requirements

### Requirement: Simulation-aware commentary
The system SHALL generate commentary from simulation facts instead of independent random copy.

#### Scenario: Commentary reflects match facts
- **WHEN** a China match has an opponent, round, score, penalties, win/loss state, and attribute profile
- **THEN** generated commentary MUST mention facts consistently with that match and MUST NOT imply a different winner, opponent, score, or stage

#### Scenario: Group transition uses group matches
- **WHEN** the transition feed is generated after team replacement
- **THEN** the feed MUST use the selected replacement team, China group opponents, China group match scores, and dominant attribute context

### Requirement: Player-position copy
The system SHALL support static national-team player references that match the player's team and position.

#### Scenario: Star copy matches opponent team
- **WHEN** a commentary line references an opponent player
- **THEN** the player MUST belong to that opponent team's static player profile list

#### Scenario: Position copy matches football event
- **WHEN** a player profile has a goalkeeper, defender, midfielder, forward, or creator role
- **THEN** generated copy MUST use that player in an event compatible with the role, such as saves for goalkeepers, blocks for defenders, control for midfielders, and finishing for forwards

#### Scenario: China player copy remains national-team scoped
- **WHEN** commentary references a China player
- **THEN** the copy MUST treat the player as part of the China national-team game universe and MUST NOT imply China qualified for the real tournament outside this IF simulation

### Requirement: Tone safety and variety
The system SHALL provide varied humorous copy without low, vulgar, or harmful phrasing.

#### Scenario: Humor stays non-harmful
- **WHEN** any generated commentary or settlement copy is shown
- **THEN** it MUST avoid vulgar insults, protected-class attacks, body shaming, and hostile personal humiliation

#### Scenario: Luck increases absurdity without punishment
- **WHEN** luck is high or a match contains VAR, posts, own goals, penalties, or an upset
- **THEN** generated copy MAY become more absurd or meme-like while staying consistent with the positive-miracle role of luck

#### Scenario: Cultural references stay compact
- **WHEN** a cultural or quote-like joke is used
- **THEN** it MUST be short enough for the target UI surface and MUST NOT require long explanatory text to understand

### Requirement: UI copy length budgets
The system SHALL keep generated text within budgets for compact UI surfaces.

#### Scenario: Compact hints stay short
- **WHEN** text is generated for CTA labels, status chips, advancement hints, path small text, or group-result helper copy
- **THEN** it MUST use short-copy templates intended for compact surfaces

#### Scenario: Battle report supports longer text
- **WHEN** text is generated for transition feed lines or knockout battle-report lines
- **THEN** it MAY use longer commentary templates while preserving line readability in the 400x865 mobile viewport

### Requirement: Legacy copy cleanup
The system SHALL avoid showing old demo/fallback copy on real simulation paths.

#### Scenario: Real run has generated copy
- **WHEN** `gameRun` contains generated simulation data
- **THEN** group result, knockout, and settlement screens MUST prefer generated copy and MUST NOT show contradictory old demo copy

#### Scenario: Fallback copy remains non-conflicting
- **WHEN** a screen renders without `gameRun` for development fallback
- **THEN** fallback copy MUST remain generic and MUST NOT imply a fixed tournament path that conflicts with generated data
```

## openspec/changes/expand-dynamic-commentary-system/specs/game-simulation/spec.md

- Source: openspec/changes/expand-dynamic-commentary-system/specs/game-simulation/spec.md
- Lines: 1-19
- SHA256: 72cc460409d1a22aa775c9368f20b9bb9561f3188e27183954c9e61553b3c95c

```md
## ADDED Requirements

### Requirement: Commentary determinism
The system SHALL generate commentary deterministically from the same seed, attributes, and replacement team.

#### Scenario: Same run repeats commentary
- **WHEN** two runs use the same seed, attributes, and replacement team
- **THEN** generated transition lines, knockout commentary lines, path copy, and settlement copy MUST match exactly

#### Scenario: Zero-luck commentary remains deterministic
- **WHEN** `luck = 0` and the same attributes plus replacement team are used
- **THEN** commentary generation MUST NOT introduce unseeded randomness or external data that changes between runs

### Requirement: Commentary does not alter outcomes
The system SHALL keep commentary generation separate from tournament outcome decisions.

#### Scenario: Copy expansion preserves results
- **WHEN** commentary templates or player profiles are expanded
- **THEN** champion/failure outcome, failure stage, scores, standings, and advancement boards MUST remain controlled by the simulation engine rather than by copy selection
```

