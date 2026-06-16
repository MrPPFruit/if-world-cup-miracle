# Comet Design Handoff

- Change: broaden-commentary-variant-pools
- Phase: design
- Mode: compact
- Context hash: 4325077de6245d547dbe07019f3f31c3f8981de28936df5e6597811a2f44beb8

Generated-by: comet-handoff.sh

OpenSpec remains the canonical capability spec. This handoff is a deterministic, source-traceable context pack, not an agent-authored summary.

## openspec/changes/broaden-commentary-variant-pools/proposal.md

- Source: openspec/changes/broaden-commentary-variant-pools/proposal.md
- Lines: 1-16
- SHA256: 63f7b473ec3b35df2a8a78cc99cf30590e9747d87f1266b9d4af4b976edfc1ae

```md
## Why

上一轮已经把小组赛转场和淘汰赛解说接入本局 commentary seed，解决了“不同局只看同一赛事实时完全固定”的根因。但从体验上看，部分行位的候选池仍然偏薄：例如小组赛开局、幸运铺垫、终场情绪、短结果文案等位置，多开几局仍容易撞见熟句，给人一种“只是换了顺序”的模板感。

## What Changes

- 扩大小组赛转场里开局、走势、积分影响、终场情绪和收束行的候选池。
- 扩大 group-result 三场短评、hero note、match note、晋级/结算短文案等紧凑 UI 文案池。
- 扩展固定赛事实多 seed 验证，不只检查两个 seed 不同，而是要求样本中有足够多不同输出。
- 保持同一 seed 的确定性、单局内去重、UI 字数预算和语义高亮规则。

## Out Of Scope

- 不修改 UI 布局。
- 不修改比赛胜负、进球或晋级模型。
- 不引入运行时联网或 AI 生成。
```

## openspec/changes/broaden-commentary-variant-pools/design.md

- Source: openspec/changes/broaden-commentary-variant-pools/design.md
- Lines: 1-17
- SHA256: a491035338bed674ef7f2a5c7a4c2da92b388f9b18b9307c2fcb398f304bd5d5

```md
## Design

本次不改变生成架构，继续沿用 seeded RNG 和 run-local copy ledger。改动重点是“候选池厚度”和“验证阈值”：

- 对长 feed 文案，增加同一行位的不同写法，避免连续多局看到类似句式。
- 对紧凑 UI 文案，增加短句候选并继续使用 `COMPACT_COPY_LIMITS` 截断保护。
- 对 group match detail，按不同赛果形态扩展模板，避免每种形态只有少量短评。
- 对验证脚本，新增 sample diversity 检查：固定赛事实在多个 seed 下应产生足够多唯一整段输出；同 seed 可复现检查保持不变。

这类变化仍属于静态前端文案资产，不影响纯前端部署约束。

## Verification

- `npm run verify:game` 需要覆盖多 seed 样本多样性。
- `npm run build` 确认可打包。
- `openspec validate --all --strict` 确认规格归档前后有效。
- 真实预览仅用于确认文本没有破坏 400x865 转场页面布局。
```

## openspec/changes/broaden-commentary-variant-pools/tasks.md

- Source: openspec/changes/broaden-commentary-variant-pools/tasks.md
- Lines: 1-9
- SHA256: aa0b607f76a9ad1799f83364efc8cdb647c6e56876357263769f54664c1a62a6

```md
## 1. 文案池扩容

- [ ] 1.1 扩大小组赛转场长 feed 的薄候选池。
- [ ] 1.2 扩大 group-result 和 settlement 紧凑短文案候选池。

## 2. 验证

- [ ] 2.1 增加固定赛事实多 seed 多样性回归。
- [ ] 2.2 运行语法、游戏验证、构建、OpenSpec、diff 检查和真实预览。
```

## openspec/changes/broaden-commentary-variant-pools/specs/dynamic-commentary/spec.md

- Source: openspec/changes/broaden-commentary-variant-pools/specs/dynamic-commentary/spec.md
- Lines: 1-9
- SHA256: b0f3cd64a12b405a2deb0d2e2b0d7211dac6f0fbd5018441ea8182c401dc92de

```md
## MODIFIED Requirements

### Requirement: Single-run visible copy uniqueness
The system SHALL avoid repeating generated visible commentary or short-copy strings within a single game run, generated visible copy SHALL NOT expose internal ids, different run seeds SHOULD produce varied generated commentary even when match facts are similar, and fixed-fact commentary samples SHOULD maintain a minimum diversity floor across multiple commentary seeds.

#### Scenario: Fixed facts maintain sample diversity
- **WHEN** the same match facts are generated with multiple different commentary seeds
- **THEN** the sample SHOULD contain multiple distinct visible outputs rather than collapsing to one or two repeated reports
- **AND** the output MUST still respect score, team, player-role, UI budget, and semantic-highlight rules
```
