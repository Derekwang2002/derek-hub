---
title: "Bilingual Content Pipeline and Validation"
summary: "A content layout with Chinese as the canonical source and English as the mirror, load-time parity checks with a CJK guard, and the way the Project navigation loop is tested."
---

Derek Hub's public content is purely file-driven: there is no CMS, and every page is generated at build time from Markdown and TypeScript definitions. The core of this pipeline is keeping the "Chinese canonical + English mirror" pair structurally consistent at all times.

## 1. Canonical and mirror

Project content is split by locale:

```text
content/projects/[project]/                    # Chinese canonical
content/translations/en/projects/[project]/    # English mirror
```

Each Project has an `index.md`, an `items/` directory, and an `updates/` directory, and filenames must match exactly across the two languages. At load time the file lists on both sides are compared directory by directory: a missing translation or an orphan file throws an error and fails the build instead of silently degrading.

## 2. Load-time validation

`lib/projects.ts` validates on read: slugs must be lowercase kebab-case and unique across the site; dates must be valid `YYYY-MM-DD`; items must reference a defined section and carry a `reviewedRevision`; interactive items must have both locale asset files present under `public/`. English content gets an extra CJK guard: any Chinese character in the title, summary, or body raises an error, which keeps untranslated content from leaking into mirror files.

## 3. Navigation loop

The Project overview is position zero and shares one bottom pager with the ordered document tree: the overview's next link opens the first published document, and the final document has only a previous link. `npm run test:projects` renders the pager page by page in both English and Chinese and asserts the real `href` of every boundary state, rather than trusting loader data alone.

## 4. Multi-source Blog merging

Blog posts can come from local files, explicitly configured single GitHub files, and GitHub folders at the same time. A `githubFolder` source expands the `.md` files inside a folder through the GitHub Contents API (ignoring `README.md`), and each file becomes an internal article page. The loader deduplicates by both public slug/href and source id, so one article always has exactly one source.

## 5. Build and deployment

Public pages are fully static (`force-static` plus `generateStaticParams`); the Share Board and Private Repo routes are dynamic and depend on Neon Postgres and server-only environment variables. CI runs `npm ci`, lint, `test:board`, `test:projects`, typecheck, and `next build` in order, and Vercel deploys the result.
