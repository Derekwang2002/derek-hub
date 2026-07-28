# ADR-0012: Projects Use a Structural Manifest and Localized Content Trees

Status: Accepted

Date: 2026-07-28

## Context

Project sections, ownership, lifecycle, and reading order must be identical in
English and Chinese, while titles, summaries, and prose are localized. The site
is already Markdown-first and uses Chinese source content with English
translation mirrors.

## Decision

- `content/projects.ts` stores non-localized Project structure: slugs,
  lifecycle, sections, item types, and reading order.
- `content/projects/<project>/` stores the Chinese overview, item Markdown, and
  explicitly authored Updates.
- `content/translations/en/projects/<project>/` mirrors those Markdown files.
- Matching localized files use identical relative paths and slugs.
- Blog frontmatter uses `projects: [project-slug]` for associations.
- configured Demos use `projectSlugs`.
- Project-owned interactive assets use localized public directories and a
  Project-owned application route.
- No new dependency is introduced.

## Consequences

- One manifest controls structure for both locales.
- The loader must validate manifest uniqueness, reserved slugs, file existence,
  translation parity, ownership conflicts, and association targets.
- Localized prose can differ naturally while navigation remains identical.
- The source atlas needs separate Chinese and English assets below
  `public/projects/call-e/source-atlas/`.
- Content migration can remain repository-backed and statically generated.

