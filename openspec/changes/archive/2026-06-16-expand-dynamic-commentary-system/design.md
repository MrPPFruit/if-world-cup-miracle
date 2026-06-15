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
