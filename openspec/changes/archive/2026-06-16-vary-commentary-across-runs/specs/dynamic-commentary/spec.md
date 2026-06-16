## MODIFIED Requirements

### Requirement: Single-run visible copy uniqueness
系统 MUST 避免在单局内重复生成可见解说或短文案；生成文案 MUST NOT 暴露内部 id；当比赛事实相近但本局种子不同时，生成解说 SHOULD 尽量产生变化。

#### Scenario: 单局内没有重复生成文案
- **WHEN** 一局游戏生成小组赛转场、淘汰赛解说、小组结果文案、晋级提示、路径文案和结算文案
- **THEN** 本局内生成的可见文本不得重复

#### Scenario: 去重逻辑保持确定性
- **WHEN** 两局使用相同 seed、属性和替换球队
- **THEN** 去重后的生成文案必须完全一致

#### Scenario: 内部 id 不进入可见文案
- **WHEN** 常规文案池耗尽后生成可见 fallback 解说
- **THEN** 可见文本不得包含淘汰赛轮次 id、比赛 id 或 run id 等内部标识

#### Scenario: 不同局种子让相似赛事实产生变化
- **WHEN** 两段生成播报拥有相同比赛事实，但使用不同 run commentary seed
- **THEN** 可见解说应出现差异，同时仍尊重比分、球队和球员角色事实

#### Scenario: 小组赛转场限制 system 高亮
- **WHEN** 生成小组赛转场解说
- **THEN** 紫色 system 高亮只能出现在终场比分行
- **AND** 终场 system 文本必须为 `终场哨响`
