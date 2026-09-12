---
title: "Derek Hub"
summary: "A personal content hub: bilingual Blog, Project workspaces, resource and demo collections, and a private Share Board, statically generated with the Next.js App Router and deployed on Vercel."
---

Derek Hub is this site itself: a personal content hub for writing, resource curation, skill documentation, and interactive demos. The code is open source in the [GitHub repository](https://github.com/Derekwang2002/derek-hub), built with Next.js 15 App Router and React 19; all public pages are statically generated and deployed on Vercel.

## 1. Site capabilities

- Home page with profile links and pinned resources;
- Blog from three source types (local Markdown, explicit remote GitHub files, and remote GitHub folders) with a tag index;
- Projects: bilingual workspaces with an overview, an ordered document tree, an update stream, and interactive assets;
- Hub: all resources, skill articles (expanded from the `docs/` folder of the `Derekwang2002/skills` repository into internal pages), and static demos;
- Share Board: private Markdown/HTML uploads with revocable, single-document share links, stored in Neon Postgres;
- RSS (`/rss.xml`) and a static sitemap (`/sitemap.xml`).

## 2. Content model

```text
content/
├── posts/            # local Blog posts (YYYY-MM-DD-slug.md)
├── projects/         # canonical Chinese Project content
├── blog.ts           # remote Blog source configuration
├── projects.ts       # Project structure and ordering definitions
└── resources.ts      # Hub resource and collection configuration
content/translations/en/  # English mirror; filenames must match the Chinese canonical tree exactly
```

Blog frontmatter can associate a post with a Project's update stream through the `projects` field, and demos associate through `projectSlugs`. Associated content appears in Updates but does not change the Project's `lastUpdated` date.

## 3. Engineering foundation

Markdown rendering supports headings, tables of contents, code highlighting (Shiki), links, lists, tables, and blockquotes. The shared `lib/markdown-sources.ts` layer unifies local files, single GitHub files, and GitHub folders, and validates duplicates by both public slug and source id. CI (GitHub Actions) runs lint, the Share Board and Project test suites, typecheck, and a production build.

## 4. How to keep reading

[Bilingual Content Pipeline and Validation](/projects/derek-hub/content-pipeline) expands on the Chinese/English parity checks, routing, and the way the navigation loop is tested. Changes to the site itself are collected under [Updates](/projects/derek-hub/updates).
