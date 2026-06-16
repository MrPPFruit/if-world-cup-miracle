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
