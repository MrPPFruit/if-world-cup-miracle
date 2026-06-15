# 结算页角色资产替换交接说明

本文档说明最后结算页如何把右侧角色图从临时梅西/阿根廷基准图，替换为真实的战败角色资产。当前代码入口已经落在 `src/characterAssets.js`，结算页调用点在 `src/App.jsx` 的 `FinalScreen`。

## 资产规格

- 所有角色 PNG 统一为 `442 x 604` 透明画布。
- 结算页右侧图片槽位是 `.final-defeated-mascot`，默认布局尺寸为 `94 x 124px`。
- CSS 使用 `object-fit: contain` 和 `object-position: center bottom`，所以替换图片不会撑开结算页布局。
- 个别视觉偏小的资产可以通过 `displayScale` 做展示层放大；当前巴西/内马尔为 `1.3`，只影响视觉比例，不改变布局槽位和 PNG 资产规格。
- 已完成 53 张真实替换测试：48 个国家队失败角色 + 5 个中国队失败变体，无槽位越界或 hero 框越界。

## 资产目录

国家队战败图：

```text
public/assets/characters/pending/<team-code>-defeated.png
```

阿根廷基准图是历史例外：

```text
public/assets/characters/argentina-defeated-10.png
```

中国队失败变体：

```text
public/assets/characters/pending/cn-defeated-01.png
public/assets/characters/pending/cn-defeated-02.png
public/assets/characters/pending/cn-defeated-03.png
public/assets/characters/pending/cn-defeated-04.png
public/assets/characters/pending/cn-defeated-05.png
```

完整资产规范与登记表见 `docs/character-assets.md`。

## 代码入口

文件：

```text
src/characterAssets.js
```

主要函数：

```js
getSettlementCharacterAsset({
  result,
  defeatedOpponentCode,
  defeatedOpponentName,
  failureVariant,
  failureReason,
  failureSeed,
});
```

返回值：

```js
{
  type: "country" | "china",
  code: "br",
  name: "巴西",
  src: "/assets/characters/pending/br-defeated.png",
  alt: "巴西队战败形象",
  displayScale: 1.3
}
```

`displayScale` 是结算页展示倍率。默认是 `1`；巴西/内马尔图因为姿态偏低，当前设置为 `1.3`，由 CSS 放大显示，不改变 PNG 的 `442 x 604` 资产规格。

## 当前结算页调用

`FinalScreen` 会从 `pathRows` 找到最终比赛行：

```js
const finalMatchRow = [...pathRows].reverse().find((row) => row.type === "match" && row.final);
```

冠军结算时，传入最终被中国队击败的对手：

```js
const settlementCharacter = getSettlementCharacterAsset({
  result,
  defeatedOpponentCode: finalMatchRow?.opponentCode,
  defeatedOpponentName: finalMatchRow?.opponentName,
  failureVariant: "var-frozen",
});
```

渲染：

```jsx
<img
  className="final-defeated-mascot"
  src={settlementCharacter.src}
  alt={settlementCharacter.alt}
  style={{ "--character-display-scale": settlementCharacter.displayScale }}
/>
```

当前冠军剧情的决赛对手是巴西，所以会返回：

```js
{
  type: "country",
  code: "br",
  name: "巴西",
  src: "/assets/characters/pending/br-defeated.png",
  alt: "巴西队战败形象",
  displayScale: 1.3
}
```

## 替换规则

### 中国队夺冠

使用“最后被中国队击败的对手”的国家队战败图。

例子：

```js
getSettlementCharacterAsset({
  result: "champion",
  defeatedOpponentCode: "br",
  defeatedOpponentName: "巴西",
});
```

适用场景：

- 决赛击败巴西：用 `br-defeated.png`。
- 半决赛击败阿根廷但最后结算展示冠军战报时：仍然用决赛对手，不用半决赛对手。
- 如果后续剧本改成决赛击败英格兰，就传 `gb-eng`，自动用 `gb-eng-defeated.png`。

### 中国队失败

使用中国队失败变体。失败页当前原型仍保留数字标记，后续如果切换为图片，可以直接复用同一个函数。

推荐场景映射：

| 场景 | variant | 文件 | 使用建议 |
| --- | --- | --- | --- |
| 小组出局、提前回家 | `pack-home` | `cn-defeated-01.png` | 打包回家，适合普通淘汰 |
| 防线崩盘、乌龙、被打穿 | `net-trap` | `cn-defeated-02.png` | 被球网裹住，适合防守灾难 |
| 战术失败、换人失败、阵型混乱 | `tactics-collapse` | `cn-defeated-03.png` | 战术板崩盘，适合教练/战术梗 |
| VAR、越位、点球判罚 | `var-frozen` | `cn-defeated-04.png` | VAR 石化，适合争议判罚 |
| 最后时刻崩盘、读秒被绝杀 | `luggage-chase` | `cn-defeated-05.png` | 追行李车，适合终场梦醒 |

直接指定：

```js
getSettlementCharacterAsset({
  result: "failure",
  failureVariant: "tactics-collapse",
});
```

按失败原因指定：

```js
getSettlementCharacterAsset({
  result: "failure",
  failureReason: "var",
});
```

没有明确失败原因时，可以传 `failureSeed` 做稳定轮换：

```js
getSettlementCharacterAsset({
  result: "failure",
  failureSeed: matchId,
});
```

## 单独取国家队资产

如果某个页面只需要“某国家队战败图”，不用关心结算结果，可以直接调用：

```js
getCountryDefeatedCharacterAsset("nl", "荷兰");
```

返回：

```js
{
  type: "country",
  code: "nl",
  name: "荷兰",
  src: "/assets/characters/pending/nl-defeated.png",
  alt: "荷兰队战败形象"
}
```

未知国家代码会回退到阿根廷基准图，避免页面空图。

## 单独取中国队失败资产

```js
getChinaDefeatedCharacterAsset({
  variant: "pack-home",
});
```

或：

```js
getChinaDefeatedCharacterAsset({
  reason: "lateCollapse",
});
```

## 后续接入注意

1. 如果资产从 `pending/` 移入正式目录，只需要更新 `src/characterAssets.js` 的路径生成逻辑。
2. 不要在页面组件里手写 `/assets/characters/...` 路径，统一走函数，避免后续资产迁移时漏改。
3. 结算页冠军态应展示“被中国队击败的对手”，不是被替换掉的小组名额球队。
4. 结算页失败态应展示“中国队失败变体”，不是对手失败图。
5. `alt` 文案由函数生成，页面调用时直接使用返回值即可。

## 验证记录

最近一次真实结算页替换测试输出：

```text
tmp/imagegen/characters/settlement-slot-test
```

最终审查包：

```text
tmp/imagegen/characters/final-review-pack
```
