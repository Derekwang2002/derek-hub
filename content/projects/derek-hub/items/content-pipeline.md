---
title: "双语内容管线与校验"
summary: "中文为正本、英文为镜像的内容布局，装载时的奇偶校验与 CJK 防护，以及 Project 导航回环的测试方式。"
---

Derek Hub 的公开内容是纯文件驱动的：没有 CMS，所有页面在构建期从 Markdown 与 TypeScript 定义生成。这套管线的核心是让"中文正本 + 英文镜像"在任何时候都保持结构一致。

## 1. 正本与镜像

Project 内容按 locale 分置两处：

```text
content/projects/[project]/                    # 中文正本
content/translations/en/projects/[project]/    # 英文镜像
```

每个 Project 都有 `index.md`、`items/` 与 `updates/`；两种语言的文件名必须完全一致。装载时逐目录比较两侧文件清单：缺翻译或出现孤儿文件都会直接抛错，构建失败，而不是静默降级。

## 2. 装载期校验

`lib/projects.ts` 在读取时校验：slug 必须是小写 kebab-case 且全站唯一；日期必须是合法的 `YYYY-MM-DD`；item 必须引用已定义的 section 并携带 `reviewedRevision`；交互型 item 的双语资产文件必须真实存在于 `public/`。英文内容额外有 CJK 防护——标题、摘要或正文中出现中文字符即报错，防止镜像文件混入未翻译内容。

## 3. 导航回环

Project 概览是位置 0，与有序文档树共用同一个底部 pager：概览的 next 指向第一篇已发布文档，最后一篇文档只有 previous。`npm run test:projects` 会在中英文两种 locale 下逐页渲染 pager，断言每一个边界状态的真实 `href`，而不是只看 loader 数据。

## 4. Blog 的多来源合并

Blog 可以同时来自本地文件、显式配置的 GitHub 单文件和 GitHub 文件夹。`githubFolder` 来源通过 GitHub Contents API 展开文件夹内的 `.md` 文件（忽略 `README.md`），每个文件成为一篇站内文章。装载层按公开 slug/href 与 source id 双重查重，保证一篇文章只有一个来源。

## 5. 构建与部署

公开页面全部静态生成（`force-static` + `generateStaticParams`）；Share Board 与 Private Repo 是动态路由，依赖 Neon Postgres 与服务端环境变量。CI 依次执行 `npm ci`、lint、`test:board`、`test:projects`、typecheck 与 `next build`，通过后由 Vercel 部署。
