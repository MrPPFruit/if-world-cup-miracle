---
comet_change: vary-commentary-across-runs
role: technical-design
canonical_spec: openspec
archived-with: 2026-06-16-vary-commentary-across-runs
status: final
---

# Vary Commentary Across Runs Design

## Context

当前 commentary 系统已经能保证单局内不重复使用同一条作者文案，但部分可见播报仍然显得模板化。小组赛转场 feed 主要暴露两个问题：

- 多行结构接近：时间、球队、属性词、泛化结果。
- `system` rich part 使用过多，导致属性、VAR、积分榜等普通词也变成紫色高亮，视觉噪声偏大。

本次用户反馈要求重新设计小组赛转场文案，提升丰富度；紫色高亮只保留 `终场哨响`；属性玩梗可以有一两处，但不能成为主要句式。

## Design

转场与淘汰赛解说使用本局级 commentary RNG seed，而不是只依赖固定比赛事实。同一种子仍可复现同一局，但不同局即使赛事实相似，也能抽到不同文本。

小组赛转场行按更分散的叙事节奏重建：

- 赛前上下文、看台或替补席反应；
- 比赛节奏与压力，不总是点名主属性；
- 对手球员或明星动作；
- 比分摇摆或积分榜影响；
- 终场比分行。

只有终场比分行使用 `PART_KIND.SYSTEM`，固定文本为 `终场哨响`。VAR、裁判、积分榜、战术和属性词在小组赛转场里都保持普通文本。队名仍为蓝色，球员名为暖橙色，比分为红色，时间为蓝色胶囊。

属性可以影响文案口味，但不应每场比赛都显式提属性。主属性最多出现在开场铺垫或少量比赛节奏里。

## Verification

- 增加回归检查：小组赛转场除了 `终场哨响` 不得出现其它 system 高亮。
- 增加固定比赛事实/不同 seed 检查：不同 commentary seed 应产生不同可见播报，同 seed 仍保持确定性。
- 继续保留重复文案、球员角色和内部 id 泄漏检查。
