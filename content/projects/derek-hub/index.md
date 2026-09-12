---
title: "Derek Hub"
summary: "个人内容 Hub 站点：中英双语 Blog、Project 工作区、资源与 Demo 集合、私有 Share Board，基于 Next.js App Router 静态生成，部署在 Vercel。"
---

Derek Hub 是本站本身：一个用于写作、资源策展、skill 文档与交互 Demo 的个人内容 Hub。代码开源在 [GitHub 仓库](https://github.com/Derekwang2002/derek-hub)，基于 Next.js 15 App Router 与 React 19 构建，公开页面全部静态生成，部署在 Vercel。

## 1. 站点能力

- 首页：profile 链接与精选资源；
- Blog：本地 Markdown 与远程 GitHub 文件/文件夹三种来源，支持标签索引；
- Projects：双语 Project 工作区，包含概览、有序文档树、更新流与交互资产；
- Hub：全部资源、skill 文章（由 `Derekwang2002/skills` 仓库的 `docs/` 文件夹展开为站内页面）与静态 Demo；
- Share Board：私有的 Markdown/HTML 上传与可撤销的单文档分享链接，数据存在 Neon Postgres；
- RSS（`/rss.xml`）与静态 sitemap（`/sitemap.xml`）。

## 2. 内容模型

```text
content/
├── posts/            # 本地 Blog（YYYY-MM-DD-slug.md）
├── projects/         # Project 中文正本
├── blog.ts           # 远程 Blog 来源配置
├── projects.ts       # Project 结构与排序定义
└── resources.ts      # Hub 资源与合集配置
content/translations/en/  # 英文镜像，文件名必须与中文正本一一对应
```

Blog frontmatter 可通过 `projects` 字段关联到 Project 的更新流，Demo 通过 `projectSlugs` 关联；关联内容出现在 Updates 中，但不改变 Project 的 `lastUpdated`。

## 3. 工程底座

Markdown 渲染支持标题、目录、代码高亮（Shiki）、链接、列表、表格与引用。共享的 `lib/markdown-sources.ts` 统一了本地文件、GitHub 单文件与 GitHub 文件夹三种来源，并按公开 slug 与 source id 做重复校验。CI（GitHub Actions）执行 lint、Share Board 与 Project 测试、typecheck 和生产构建。

## 4. 怎样继续阅读

[双语内容管线与校验](/zh/projects/derek-hub/content-pipeline)展开中英文奇偶校验、路由与导航回环的测试方式。站点自身的变更记录集中在 [Updates](/zh/projects/derek-hub/updates)。
