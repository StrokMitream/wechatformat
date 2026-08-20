# WeChat Format · 在线 Markdown 编辑器 / 预览器

一款高度简洁的**在线 Markdown 编辑器**（Markdown editor）与**预览器**（Markdown viewer / preview）：
在浏览器中在线（online）编写 Markdown，实时预览排版效果，一键复制粘贴到微信公众号。

> 核心排版引擎基于开源项目 [doocs/md](https://github.com/doocs/md)（WTFPL，见 `vendor/LICENSE`），
> 本项目在其基础上**只保留核心的 Markdown 格式化能力**，移除了图床、账户、插件市场、AI 助手等复杂功能，
> 并重构为一个可直接部署到 **Cloudflare Pages** 的纯静态单页应用。

## 功能特性

- **实时预览**：左侧编辑，右侧即时渲染微信公众号排版效果。
- **多主题排版**：内置「经典 / 优雅 / 简洁」主题，可切换字体、字号、主题色。
- **语法高亮**：代码块支持数十种 highlight.js 配色主题、Mac 风格窗口、行号。
- **进阶语法**：数学公式（KaTeX / MathJax）、图表（Mermaid、PlantUML、信息图）、
  Alert 提示块、脚注、目录、Ruby 注音、高亮/下划线等扩展语法。
- **一键复制**：内联所有样式（juice），复制后可直接粘贴到公众号编辑器。
- **深色模式**、本地自动保存（localStorage），无需登录、无需服务器。

## 技术栈

- Vue 3 + Vite + TypeScript
- CodeMirror 6 编辑器
- doocs/md 核心渲染引擎（`vendor/core`、`vendor/shared`，通过 `@md/core` / `@md/shared` 别名引用）

## 本地开发

```bash
pnpm install
pnpm dev        # 启动开发服务器
pnpm build      # 产出静态文件到 dist/
pnpm preview    # 本地预览生产构建
```

> 需要 Node.js ≥ 20.19 与 pnpm 10。

## 部署到 Cloudflare Pages

本项目为纯静态站点，直接接入 Cloudflare Pages 即可：

| 配置项 | 值 |
| --- | --- |
| Framework preset | None（或 Vite） |
| Build command | `pnpm build` |
| Build output directory | `dist` |
| Node version | `22`（已在 `.node-version` 中固定） |

Cloudflare 会根据 `pnpm-lock.yaml` 自动使用 pnpm 安装依赖。构建产物为静态资源，
`public/_headers` 已为 `assets/*` 配置了长期缓存。

## 目录结构

```
├── index.html              # 入口 + SEO 元信息
├── src/
│   ├── App.vue             # 布局
│   ├── components/         # 头部控制栏 / 编辑器 / 预览
│   ├── composables/        # 渲染 + 主题 + 状态（替代 doocs 的 Pinia store）
│   ├── services/export/    # 微信复制管线（juice 内联 + SVG/公式处理）
│   └── assets/             # 默认示例文档
└── vendor/
    ├── core/               # doocs/md @md/core 渲染引擎
    └── shared/             # doocs/md @md/shared 配置与编辑器扩展
```

## 致谢

- 排版引擎 Fork 自 [doocs/md](https://github.com/doocs/md)。
- 早期版本参考了 [lyricat/wechat-format](https://github.com/lyricat/wechat-format)。
