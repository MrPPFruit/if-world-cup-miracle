# 角色资产规范

本文档是世界杯失利角色资产的唯一制作规范和素材登记表。后续新增角色先放入 `public/assets/characters/pending/` 作为待确认资产；用户确认后，再移动到正式角色目录并接入 UI。

结算页如何按剧情替换角色图，见 `docs/settlement-character-replacement.md`。

## 制作流程

1. 按小组赛顺序制作，每批 10 个国家。
2. 每批资产先标记为 `待确认`，不直接替换 UI 中的正式资产。
3. 用户确认该批风格、肤色、队服、体积和透明边距后，再继续下一批。
4. 每个资产必须在本文档登记：国家、参考球员或外观依据、队服要点、提示词要点、文件路径、状态。
5. 每批 10 张必须先做动作和梗元素分配，避免连续出现同一种坐地、抱球、流泪模板；坐姿/半躺姿态合计最多 2 张。

## 技术规格

- 源图尺寸固定为 `442 x 604`。
- 输出格式固定为透明背景 PNG，RGBA。
- UI 替换尺寸以当前已落地资产为基准：`.final-defeated-mascot` 中约 `94 x 124`。
- 人物必须完整入框，四周保留透明安全边距，避免在 UI 中被裁切。
- 人物主体占比要接近现有基准图 `public/assets/characters/argentina-defeated-10.png`。
- 可以保留很轻的角色脚下阴影或道具阴影，但不能有实色背景、矩形底、场景背景、文字或水印。
- 生成后必须在深色背景上检查透明抠图效果，不能留下绿色、红色、洋红色、白色或黄色底块、亮边和内部空隙残留；球网缝隙、门框内侧、道具洞口这类封闭区域也要透出来。清理时要保护足球、眼白、白色队服、纸张道具、球网线本体等合理白色细节；必要时先用 `scripts/normalize-character-asset.py --clean-only` 二次清理，再做手工连通块检查，最后进入待确认总览。

## 视觉风格

- 统一：Q 版卡通、头大身小、移动游戏角色质感、圆润轮廓、柔和阴影、清晰边缘。
- 统一：每个角色穿对应国家队的世界杯队服风格，使用国家队主色、常见图案和世界杯球衣气质。
- 统一：不得使用官方队徽、赞助商 logo、品牌标志或完全照搬球衣商标细节。
- 统一：必须是滑稽的失利后形象，带一点戏剧化和幽默感。
- 不统一：眼神、表情、姿态、道具和情绪强度。每个国家要有差异，避免只是换队服。
- 可选道具：足球、大力神杯、奖牌、毛巾、战术板、护腿板、饮水瓶、VAR 小屏、记分牌碎片、飞走的球鞋、翻倒的水桶、门柱、替补席毛巾等。道具可以更夸张、更有梗，但不能抢主体。
- 娱乐化要求：后续资产要比第一批早期版本更开放、更夸张。允许夸张物理姿态和小剧场，但不能变成复杂场景图；仍然要是一个可替换的单角色 cutout。

## 每批动作多样性要求

每批 10 张中，坐地、半躺、抱球哭丧这类低重心模板合计最多 2 张。每批必须至少有 5 张采用明显不同的大轮廓：站立/跳起/趴倒/悬挂/被道具压住/钻进道具/被道具弹飞。优先从下面动作库分配，且相邻国家不要使用相同情绪结构：

- 被小号大力神杯压住或抱着奖杯腿不撒手
- 盯着小 VAR 屏幕石化
- 战术板倒拿，箭头画成迷宫
- 球鞋飞走，一只袜子露出来
- 披毛巾自闭，只露出眼睛
- 抱门柱、挂在横梁上、抱角旗杆或抱替补席椅子
- 被足球弹到脸，脸上有球印
- 坐在翻倒的水桶旁边，水花夸张但不做背景
- 抱着记分牌碎片发懵
- 躺成星形、跪地仰天、缩成一团、侧坐滑倒等明显不同姿态
- 被小道具弹飞、倒栽葱卡进球网、钻进战术板洞、挂在门框上、站着僵住等强轮廓姿态

## 人物外观规则

- 如果该国家队有高辨识度代表球员，角色外观优先参考该球员的发型、胡须、体态、号码气质和公众熟悉特征，但只做卡通化启发，不做真实肖像复刻。
- 如果没有明确代表球员，肤色、发色和面部特征应参考该队当前成年国家队常见球员外观。
- 不允许出现与该国家队明显不匹配的肤色和外观。例如以黑人球员为主的队伍不能画成白人角色。
- 对多民族、多肤色国家队，允许按代表球员或该批角色多样性选择合理肤色；不要刻板化。

## 基准提示词模板

```text
Use case: stylized-concept
Asset type: transparent mobile-game character cutout for a World Cup mini-game result screen
Primary request: Create a chibi defeated football mascot for [COUNTRY].

Subject:
A single male football player mascot inspired by [REFERENCE PLAYER OR SQUAD LOOK], wearing a [COUNTRY] World Cup national team kit style. Use the team's real football color identity and kit pattern cues, but do not include official crests, sponsor logos, brand marks, or exact trademarked details.

Appearance:
Skin tone, hair, facial hair, and facial structure should match the referenced player or the common appearance of the current national team squad. Avoid mismatched ethnicity or generic default skin tones.

Style:
Cute two-head chibi cartoon, oversized head, compact small body, rounded cheeks, polished mobile-game illustration, soft painterly shading, crisp clean edges.

Pose and emotion:
Use a varied, meme-like, entertainment-game defeated expression and pose with a strong silhouette. Prefer standing, hanging, jumping, falling, being crushed by a small prop, being bounced by a ball, frozen stiff, tangled in a net, stuck inside a prop, or slipping mid-motion. The character may look shocked, devastated, dizzy, embarrassed, crying, frozen, collapsed, stone-faced, self-isolating under a towel, crushed by a tiny trophy, staring at a tiny VAR screen, holding a broken tactics board, losing a boot, hugging a goalpost, or interacting with a small funny football prop. Do not repeat the same eyes, pose, or prop setup across countries. Avoid defaulting to sitting while hugging a football unless that country specifically needs it for variety balance.

Composition:
Full-body single character, centered, generous transparent-safe padding, same visual scale and canvas ratio as the existing Argentina defeated mascot. No background scene, no text, no watermark.

Transparent workflow:
Create on a perfectly flat solid #00ff00 chroma-key background for background removal. The background must be uniform with no shadow, gradient, texture, floor plane, or lighting variation. Do not use #00ff00 anywhere in the subject.

Output:
Final normalized asset is a 442 x 604 transparent PNG.
```

## 参考优先级

资料日期：2026-06-14。角色参考先按国内辨识度和国家队代表性选择；如果当前竞技状态和大众认知冲突，优先选用户更容易一眼认出的球星，但硬标准是该球员必须是本届世界杯参赛/入选国家队名单方向。老将可以优先，退役名宿或未入选本届世界杯的球员不能作为角色参考。例如巴西固定使用本届入选语境下的内马尔方向，而不是维尼修斯方向；德国可使用本届回归名单语境下的诺伊尔方向，而不是穆西亚拉/维尔茨方向；瑞典不能使用已退役的伊布，乌拉圭不能使用未入选/已退出国家队语境下的苏亚雷斯。生成时只使用配色、发型、肤色、体态和公众气质做卡通化启发，不复刻真人肖像，不复制官方 logo。

状态说明：

- `设计待确认`：只完成设计蓝图，尚未生成。
- `待确认`：已有待确认 PNG，但仍需用户确认是否保留。
- `待重做`：已有 PNG，但参考方向或效果不对，确认后重生。

## 全量角色设计表

| 顺序 | 组 | 代码 | 国家 | 参考形象 | 肤色/外观基准 | 队服方向 | 动作梗草案 | 待确认路径 | 状态 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | A | mx | 墨西哥 | Santiago Gimenez / Hirving Lozano 气质，必要时可转 Ochoa 发型梗 | 拉美中等肤色，深色短发或卷发 | 绿色主场，红白边，墨西哥几何纹样感 | 战术纸画成迷宫，抱球发懵 | `public/assets/characters/pending/mx-defeated.png` | 待确认 |
| 2 | A | za | 南非 | Percy Tau 或南非队常见前场球员 | 深棕肤色，短黑卷发 | 黄色主场，绿色边饰 | 小喇叭震懵，球鞋松开，半躺滑倒 | `public/assets/characters/pending/za-defeated.png` | 待确认 |
| 3 | A | kr | 韩国 | 孙兴慜 | 东亚肤色，短黑发，温和但戏剧化眼神 | 红色主场，黑白金点缀 | 盯 VAR 小屏石化，越位线绕成团 | `public/assets/characters/pending/kr-defeated.png` | 待确认 |
| 4 | A | cz | 捷克 | Patrik Schick | 浅肤色，棕发，高个前锋气质压成 Q 版 | 红色主场，白蓝点缀 | 角旗杆当手帕，小乌云跟头顶 | `public/assets/characters/pending/cz-defeated.png` | 待确认 |
| 5 | B | ca | 加拿大 | Alphonso Davies / Jonathan David | 中深到深棕肤色，短黑发，速度型气质 | 红色主场，白色枫叶几何感 | 一只球鞋飞起，滑坐刹不住 | `public/assets/characters/pending/ca-defeated.png` | 待确认 |
| 6 | B | ba | 波黑 | Edin Dzeko | 浅肤色，深发短胡茬，老牌中锋气质 | 蓝黄配色，蓝色主场 | 队长袖标滑落，抱瘪足球沉默 | `public/assets/characters/pending/ba-defeated.png` | 待确认 |
| 7 | B | qa | 卡塔尔 | Akram Afif | 中东橄榄/浅棕肤色，深发，短胡茬 | 酒红主场，白色锯齿/国旗感细节 | 小金杯近在咫尺但够不到，眼睛旋涡 | `public/assets/characters/pending/qa-defeated.png` | 待确认 |
| 8 | B | ch | 瑞士 | Granit Xhaka / Xherdan Shaqiri 备选 | 浅橄榄肤色，深发，浓眉 | 红色主场，白色几何十字感 | 抱球当证据，头顶冒气，计时牌爆表 | `public/assets/characters/pending/ch-defeated.png` | 待确认 |
| 9 | C | br | 巴西 | Neymar，国内辨识度优先 | 浅棕/偏小麦肤色，造型短发，可带一点漂染感，巴西 10 号气质 | 金丝雀黄主场，绿边，蓝短裤 | 跪地扑空，奖杯在浅蓝透明罩里但够不到，避免像已经拿杯 | `public/assets/characters/pending/br-defeated.png` | 待确认 |
| 10 | C | ma | 摩洛哥 | Achraf Hakimi | 北非浅棕肤色，深发，短胡茬 | 深红主场，绿色边饰，摩洛哥几何感 | 倒拿战术板，足球卡在脚下 | `public/assets/characters/pending/ma-defeated.png` | 待确认 |
| 11 | C | ht | 海地 | Duckens Nazon / Frantzdy Pierrot | 加勒比黑人外观，深棕肤色，短黑发 | 蓝红配色，蓝色主场 | 倒栽葱卡进小球网，手里还举错庆祝牌 | `public/assets/characters/pending/ht-defeated.png` | 待确认 |
| 12 | C | gb-sct | 苏格兰 | 罗伯逊，苏格兰队长方向 | 浅肤色，浅棕/棕发，队长型左后卫气质 | 深蓝主场，白色边饰 | 抱角旗杆当救命稻草，围巾盖头自闭 | `public/assets/characters/pending/gb-sct-defeated.png` | 待确认 |
| 13 | D | us | 美国 | Christian Pulisic | 浅肤色，棕发，年轻边锋气质 | 白/蓝/红配色，星条几何感 | 盯着小记分牌石化，足球从怀里滚走 | `public/assets/characters/pending/us-defeated.png` | 待确认 |
| 14 | D | py | 巴拉圭 | Miguel Almiron | 拉美浅棕肤色，深发，瘦削灵动 | 红白条纹主场，蓝色点缀 | 抱门柱滑下来，表情像没加载完 | `public/assets/characters/pending/py-defeated.png` | 待确认 |
| 15 | D | au | 澳大利亚 | Harry Souttar / Mathew Leckie | 浅肤色，棕发或浅发，澳洲队常见外观 | 金黄主场，绿色边饰 | 战术箭头飞回来砸头，球鞋横飞 | `public/assets/characters/pending/au-defeated.png` | 待确认 |
| 16 | D | tr | 土耳其 | Arda Guler / Hakan Calhanoglu | 土耳其浅橄榄肤色，深发，浓眉 | 红色主场，白色月牙星感但不做官方标 | 任意球战术板碎成拼图，跪地捡碎片 | `public/assets/characters/pending/tr-defeated.png` | 待确认 |
| 17 | E | de | 德国 | 诺伊尔，国内辨识度优先的门将方向 | 浅肤色，浅棕/金棕短发，门将手套和队长气质 | 白色主场或门将绿色/亮色球衣，黑红金细节 | 精密门线机器冒烟，手套接住裂开的记分牌 | `public/assets/characters/pending/de-defeated.png` | 待确认 |
| 18 | E | cw | 库拉索 | Leandro Bacuna / Cuco Martina | 加勒比黑人或深棕肤色，短黑发 | 蓝色主场，黄色点缀 | 翻倒水桶旁边懵圈，球漂在小水花上 | `public/assets/characters/pending/cw-defeated.png` | 待确认 |
| 19 | E | ci | 科特迪瓦 | Sebastien Haller / Franck Kessie | 西非黑人外观，深棕肤色，短发 | 橙色主场，绿色白色点缀 | 橙色毛巾披头，只露出委屈眼睛 | `public/assets/characters/pending/ci-defeated.png` | 待确认 |
| 20 | E | ec | 厄瓜多尔 | Moises Caicedo / Enner Valencia | 安第斯/拉美棕色肤色，黑发 | 黄色主场，蓝红点缀 | 抱着裂开的记分牌，表情彻底断网 | `public/assets/characters/pending/ec-defeated.png` | 待确认 |
| 21 | F | nl | 荷兰 | Virgil van Dijk | 深棕肤色，可用束发/辫发气质，强壮后卫 Q 版 | 橙色主场，黑白点缀 | 双手挂在小横梁上被橙色战术箭头缠住，脚尖够不到地 | `public/assets/characters/pending/nl-defeated.png` | 待确认 |
| 22 | F | jp | 日本 | 三笘薰 / 久保建英 备选 | 东亚肤色，黑发，灵巧边路气质 | 蓝色主场，白色折纸/电流感纹样 | 战术板变漫画分镜，人物从格子里滑出来 | `public/assets/characters/pending/jp-defeated.png` | 待确认 |
| 23 | F | se | 瑞典 | 伊萨克，本届参赛球员优先 | 深棕肤色，短黑发，高个前锋气质 Q 版 | 黄色主场，蓝色边饰 | 长腿被夸张鞋带和蓝黄围巾缠成结，仍然站着扶额发懵 | `public/assets/characters/pending/se-defeated.png` | 待确认 |
| 24 | F | tn | 突尼斯 | Wahbi Khazri / Ellyes Skhiri | 北非浅棕/橄榄肤色，深发或短胡茬 | 白色或红色主场，红色细节 | 红白毛巾像斗篷一样把人缠住，角色站着原地转圈 | `public/assets/characters/pending/tn-defeated.png` | 待确认 |
| 25 | G | be | 比利时 | Kevin De Bruyne | 浅肤色，金棕发，红脸郁闷感 | 红色主场，黑黄金点缀 | 黄金一代时钟挂在脖子上冒烟，站着抓头表情断线 | `public/assets/characters/pending/be-defeated.png` | 待确认 |
| 26 | G | eg | 埃及 | Mohamed Salah | 北非棕色肤色，黑卷发，短胡须 | 红色主场，白黑细节 | 抱着小 VAR 屏，卷发都被震成问号 | `public/assets/characters/pending/eg-defeated.png` | 待确认 |
| 27 | G | ir | 伊朗 | Mehdi Taremi / Sardar Azmoun | 西亚浅橄榄肤色，深发，短胡茬 | 白色主场，红绿点缀 | 点球点旁边站成木桩，战术纸被风吹成龙卷小团 | `public/assets/characters/pending/ir-defeated.png` | 待确认 |
| 28 | G | nz | 新西兰 | Chris Wood | 浅肤色，高壮前锋气质，浅棕/棕发 | 白色主场，黑色点缀 | 抱着门柱像抱树，足球卡在脚边 | `public/assets/characters/pending/nz-defeated.png` | 待确认 |
| 29 | H | es | 西班牙 | 亚马尔 | 棕色肤色，黑卷发，年轻天才边锋气质 | 红色主场，黄蓝细节 | 年轻天才石化，脚下足球变成问号气泡 | `public/assets/characters/pending/es-defeated.png` | 待确认 |
| 30 | H | cv | 佛得角 | Ryan Mendes / Bebé 备选 | 西非/大西洋岛国黑人外观，深棕肤色 | 蓝色主场，白红点缀 | 踩上翻倒水桶打滑，身体腾空，海浪形小水花夸张 | `public/assets/characters/pending/cv-defeated.png` | 待确认 |
| 31 | H | sa | 沙特 | Salem Al-Dawsari | 阿拉伯浅棕/橄榄肤色，深发短胡 | 绿色主场，白色细节 | 滑跪失控后腾空，球鞋飞走，小金杯在下方翻滚 | `public/assets/characters/pending/sa-defeated.png` | 待确认 |
| 32 | H | uy | 乌拉圭 | 巴尔韦德，本届参赛球员优先 | 浅肤色，深发，中场核心气质 | 天蓝主场，黑白点缀 | 站着被马黛茶杯吸管缠住，手拿裂开记分牌碎片发懵 | `public/assets/characters/pending/uy-defeated.png` | 待确认 |
| 33 | I | fr | 法国 | Kylian Mbappe | 中深棕肤色，短黑发，速度型前锋气质 | 深蓝主场，红白细节 | 冲刺急刹失败，速度球鞋飞走，足球反弹到胸口 | `public/assets/characters/pending/fr-defeated.png` | 待确认 |
| 34 | I | sn | 塞内加尔 | Sadio Mane | 西非黑人外观，深棕肤色，短发 | 白色主场，绿黄红细节 | 短角旗杆和毛巾把角色挂住，双脚乱踢，球鞋滑落 | `public/assets/characters/pending/sn-defeated.png` | 待确认 |
| 35 | I | iq | 伊拉克 | Aymen Hussein | 中东浅棕/橄榄肤色，深发短胡 | 白色或绿色主场，红黑绿细节 | 站着被空白记分牌碎片和护腿板环绕，护腿板歪扣头顶 | `public/assets/characters/pending/iq-defeated.png` | 待确认 |
| 36 | I | no | 挪威 | Erling Haaland | 浅肤色，金发，高壮前锋气质 Q 版 | 红色主场，蓝白细节 | 站着被细白战术圈卡在腰间，双手摊开发懵，脚下足球被踩扁 | `public/assets/characters/pending/no-defeated.png` | 待确认 |
| 37 | J | ar | 阿根廷 | Lionel Messi | 浅肤色，棕发短胡，10 号气质 | 天蓝白条纹，黑白细节 | 现有基准：坐地抱球、星星转圈；后续可加金杯躲远梗 | `public/assets/characters/argentina-defeated-10.png` | 已有基准资产 |
| 38 | J | dz | 阿尔及利亚 | Riyad Mahrez | 北非浅棕/橄榄肤色，深发短胡 | 白绿主场，红色点缀 | 倒拿小战术夹板，围巾滑住一只眼，脚下误踩足球 | `public/assets/characters/pending/dz-defeated.png` | 待确认 |
| 39 | J | at | 奥地利 | 阿拉巴 | 中棕肤色，短黑发，后场指挥官气质 | 红白主场 | 指挥官袖标断掉后缠住双臂，站着努力指挥却指错方向 | `public/assets/characters/pending/at-defeated.png` | 待确认 |
| 40 | J | jo | 约旦 | Musa Al-Taamari | 中东浅棕肤色，深发，灵巧边锋气质 | 白红黑配色，国旗感细节 | 红白黑毛巾被飞球带起蒙住半张脸，角色单脚踉跄追球 | `public/assets/characters/pending/jo-defeated.png` | 待确认 |
| 41 | K | pt | 葡萄牙 | Cristiano Ronaldo | 浅橄榄肤色，黑发，强烈眉眼，CR7 气质但不写字 | 红绿主场，金色点缀 | 招牌庆祝动作做到一半卡住，脚下小金杯倒了 | `public/assets/characters/pending/pt-defeated.png` | 待确认 |
| 42 | K | cd | 刚果（金） | Chancel Mbemba / Cedric Bakambu | 中非黑人外观，深棕肤色，短发 | 蓝色主场，红黄斜带感 | 队长袖标拉成长条，抱替补席椅子发呆 | `public/assets/characters/pending/cd-defeated.png` | 待确认 |
| 43 | K | uz | 乌兹别克 | Eldor Shomurodov | 中亚浅肤/浅橄榄肤色，深发或浅棕发 | 白蓝主场，绿色点缀 | 盯小 VAR 屏，头顶小冰块式冷场符号 | `public/assets/characters/pending/uz-defeated.png` | 待确认 |
| 44 | K | co | 哥伦比亚 | J 罗，世界杯记忆点优先 | 拉美浅棕肤色，深发，左脚核心气质 | 黄色主场，蓝红点缀 | 黄金左脚球鞋飞走，抱着鞋愣住 | `public/assets/characters/pending/co-defeated.png` | 待确认 |
| 45 | L | gb-eng | 英格兰 | 凯恩，国内辨识度和英格兰队长优先 | 浅肤色，浅棕发，传统中锋和队长气质 | 白色主场，海军蓝/红点缀 | 双臂庆祝动作定格但气球漏气，表情尴尬 | `public/assets/characters/pending/gb-eng-defeated.png` | 待确认 |
| 46 | L | hr | 克罗地亚 | Luka Modric | 浅肤色，金棕长发或中长发，老将气质 | 红白棋盘格主场，蓝色点缀 | 棋盘格毛巾被风吹成斗篷，老将追着滚远的足球伸手 | `public/assets/characters/pending/hr-defeated.png` | 待确认 |
| 47 | L | gh | 加纳 | Mohammed Kudus / Thomas Partey 备选 | 西非黑人外观，深棕肤色，短发 | 白色主场，红黄绿黑星感但不复制徽章 | 黑星形眩晕符号绕头，足球弹到脸 | `public/assets/characters/pending/gh-defeated.png` | 待确认 |
| 48 | L | pa | 巴拿马 | Adalberto Carrasquilla / Michael Murillo | 中美拉美棕色肤色，深发 | 红色主场，蓝白点缀 | 记分牌像折页一样裂开，角色从中间探头发懵 | `public/assets/characters/pending/pa-defeated.png` | 待确认 |

## 中国队失败变体资产

中国队失败形象不参考武磊等明星球员，统一采用普通中国成年男足球员气质。队服只使用泛中国队红白配色或白红配色，不出现国旗、官方队徽、赞助商、品牌标志或可读文字。每个变体都是待确认资产，用于后续失败结算或替换测试。

| 变体 | 参考形象 | 肤色/外观基准 | 队服方向 | 动作梗草案 | 待确认路径 | 状态 |
| --- | --- | --- | --- | --- | --- | --- |
| CN-01 | 普通中国队球员 | 东亚肤色，短黑发，普通年轻球员气质 | 红色球衣，白色边饰，无国旗队徽 | 打包回家，拖着装满球鞋和瘪球的行李箱回头发懵 | `public/assets/characters/pending/cn-defeated-01.png` | 待确认 |
| CN-02 | 普通中国队球员 | 东亚肤色，短黑发，普通年轻球员气质 | 白红球衣，无国旗队徽 | 被白灰球网裹住，足球卡在网里，网洞保持透明 | `public/assets/characters/pending/cn-defeated-02.png` | 待确认 |
| CN-03 | 普通中国队球员 | 东亚肤色，短黑发，普通年轻球员气质 | 红色球衣，白色边饰，无国旗队徽 | 倒拿战术板，红蓝箭头像面条一样缠住双臂 | `public/assets/characters/pending/cn-defeated-03.png` | 待确认 |
| CN-04 | 普通中国队球员 | 东亚肤色，短黑发，普通年轻球员气质 | 白红球衣，无国旗队徽 | 抱着 VAR 小屏石化，球从脚边慢慢滚走 | `public/assets/characters/pending/cn-defeated-04.png` | 待确认 |
| CN-05 | 普通中国队球员 | 东亚肤色，短黑发，普通年轻球员气质 | 红色球衣，白色边饰，无国旗队徽 | 追不上滚走的小行李车，球鞋护腿板和瘪球飞出来 | `public/assets/characters/pending/cn-defeated-05.png` | 待确认 |

## 资料来源

- Mexico 2026 home kit: https://www.adidas.com/us/mexico
- South Africa 2026 home kit: https://www.adidas.com/us/south-africa-26-home-jersey/KY2209.html
- South Korea 2026 home kit: https://www.nike.com/t/south-korea-national-team-2026-stadium-away-mens-dri-fit-soccer-jersey-gA3fN7vg
- Czech Republic 2026 kit collection: https://us.puma.com/us/en/sport/soccer/czechia
- Canada 2026 home kit: https://www.nike.com/t/canada-soccer-2026-match-home-mens-aero-fit-soccer-jersey-7yhGNzdf
- Bosnia and Herzegovina 2026 kit: https://www.kelme.store/collections/world-cup-2026-official-jersey
- Qatar 2026 home kit notes: https://www.goal.com/en/lists/world-cup-2026-kits/blt513e7881d13f2633
- Switzerland 2026 home kit: https://sa.puma.com/en/switzerland-2026-home-jersey-men-783218-01.html
- Brazil 2026 home kit: https://www.nike.com/t/brazil-national-team-2026-stadium-away-mens-dri-fit-soccer-jersey-GLz3n7bY
- Morocco 2026 home kit notes: https://www.goal.com/en-us/lists/morocco-fifa-world-cup-kits/blt31105f8f19a16325
