# IF? World Cup Miracle!

一个世界杯主题的非官方娱乐向小游戏原型：如果中国队空降 2026 世界杯，会发生什么离谱但快乐的平行宇宙？

项目基于 React、Vite、GSAP 构建，重点是移动端小游戏式 UI、属性分配、球队替换、小组赛生成、淘汰赛播报和结算战报分享。

## 功能亮点

- 首页、属性分配、替换球队、生成过渡、小组赛结果、淘汰赛结果、冠军/失败结算等完整流程。
- 30 点属性分配与雷达图展示。
- 12 个小组球队替换选择，使用本地方形 SVG 国旗。
- 小组赛和淘汰赛过程使用轻量动效和播报式文案。
- 结算页支持生成战报图、二维码和复制链接。
- 适配 400px 左右宽度的手机竖屏体验。

## 本地开发

```bash
npm install
npm run dev -- --port 5180 --strictPort
```

打开：

```text
http://127.0.0.1:5180/
```

## 构建

```bash
npm run build
```

构建产物会输出到 `dist/`。

## 生产部署

正式访问域名是 `https://game.ppserver.xyz`。当前链路为 Cloudflare DNS 到腾讯云 CDN（中国境外）到腾讯云 COS 香港 Bucket 静态网站。

部署时只上传 `dist/` 里的内容到 COS Bucket 根目录，正确结构是：

```text
index.html
assets/
__track/
```

不要上传 `src/`、`.env`、`.env.local`、`node_modules/`、设计源文件、密钥或私密配置。Cloudflare 中 `game.ppserver.xyz` 的 CNAME 指向 `game.ppserver.xyz.cdn.dnsv1.com`，必须保持 DNS only 灰色云朵，不要开启橙色云代理。

生产构建显式关闭 sourcemap。发布前运行：

```bash
npm run build
npm run verify:static
```

确认 `dist/index.html` 存在、没有 `dist/dist/index.html`、`dist/__track/pixel.gif` 存在，并且 `dist/assets/` 下没有 `.map` 文件。

第一版埋点只使用 CDN 日志。前端会请求 `/__track/pixel.gif` 携带匿名会话参数，不接友盟、百度统计、数据库或自建后端。埋点参数不得包含手机号、微信号、真实姓名、精确定位、身份证、邮箱、密钥或管理员口令。

## 技术栈

- React 19
- Vite 6
- GSAP
- lucide-react
- html-to-image
- qrcode

## 说明

这是一个非官方、娱乐性质的交互原型，不代表任何赛事组织、球队或官方机构。项目中的世界杯相关表达仅用于玩法语境和 UI 演示。
