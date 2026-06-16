---
comet_change: broaden-commentary-variant-pools
role: technical-design
canonical_spec: openspec
archived-with: 2026-06-16-broaden-commentary-variant-pools
status: final
---

# 扩充文案变体池设计

## Context

上一轮已经解决 seed 绑定问题：同一 seed 可复现，不同 seed 能改变整体播报。但玩家反馈的底层体验还包括“多开几局仍容易撞见熟悉句式”。这说明文案池本身还不够厚，尤其是小组赛转场和 group-result 紧凑短评。

## Design

继续使用现有 seeded RNG、`pickUnique` 和 run-local ledger，不新增运行时系统。主要增加候选池：

- 小组赛转场的开场、走势、积分影响、终场情绪和总结行。
- 小组赛每场短评的各类赛果模板。
- group hero、match note、晋级提示、结算 note 等紧凑 UI 文案。

验证从“两个 seed 不相等”升级为“固定事实多 seed 样本要有足够多唯一输出”。这样能防止未来只补一两条文案又回到模板感。

## Verification

- 固定淘汰赛事实 16 个 seed 的整段报告至少产生 12 个不同输出。
- 固定小组赛转场事实 16 个 seed 的整段 feed 至少产生 12 个不同输出。
- 固定 run-copy 路径 16 个 seed 至少产生 12 个不同短文案组合。
- 保留同 seed determinism、单局去重、字数预算和 `终场哨响` system 高亮限制。
