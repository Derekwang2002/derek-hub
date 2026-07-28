# Projects Feature Discovery

Status: Discovery

## Problem statement

CALL-E material has outgrown the site's current chronological Blog and tag-based
navigation. Related material is published in several shapes and locations, so a
reader cannot enter one stable CALL-E space and understand what exists, where to
start, or how the pieces relate.

## Current CALL-E inventory

| Content shape | Current location | Count |
| --- | --- | ---: |
| Blog post | `content/posts/` | 5 |
| Series document | `content/post-series/calle-agentic-goal/` | 3 |
| Interactive demo | `public/calle-agentic-architecture/index.html` | 1 |

The five blog posts currently cover:

- the CALL-E system overview;
- Agentic Goal architecture;
- Agentic latency optimization;
- the Agentic Runtime six-week development plan;
- Agentic technical architecture and framework trade-offs.

The existing Goal architecture post is also the position-0 overview of a
three-document series. That series already has bidirectional bottom-pager
navigation in both supported locales.

## Observed constraints

- Public content is static-first and Markdown-first.
- The site supports English and Chinese routes.
- Blog discovery is chronological, with tags as filters.
- Hub contains resources and demos, but does not model a body of work that owns
  both articles and demos.
- Any new parent/child navigation must form a complete loop in every locale,
  including rendered `href` verification at every boundary.
- No new dependency may be added without explicit approval.

## Confirmed domain boundary

A Project is a first-class content owner.

- Existing CALL-E articles, series documents, and the interactive architecture
  demo will be migrated into the CALL-E Project.
- Migrated content receives Project-owned canonical locations rather than
  remaining Blog or Hub content grouped by a Project view.
- Future Blog posts and Demos may be associated with a Project without becoming
  Project-owned content.
- Association does not transfer ownership and does not make the associated
  content part of the Project's canonical reading path by default.

See [ADR-0001](../adr/0001-project-as-content-owner.md).

## Confirmed information architecture

A Project combines stable documentation with a chronological Updates stream,
with stable documentation as the primary reader experience.

- A visitor entering the CALL-E Project should first learn the system structure.
- The Project's main hierarchy organizes canonical, Project-owned material by
  subject and intended reading order rather than publication date.
- Updates are a secondary chronological surface for recent progress and related
  publications.
- Future associated Blog posts and Demos appear in Updates by default.
- Association does not promote an external publication into the stable
  documentation hierarchy.

See [ADR-0002](../adr/0002-project-docs-primary-updates-secondary.md).

## Confirmed CALL-E landing-page policy

`/projects/call-e` is both the Project entry point and the position-0 CALL-E
system overview.

- The existing CALL-E overview is not migrated verbatim.
- The replacement must be revalidated against the current source under
  `~/Documents/prod-repo/s-eleven-mono/services/seleven-mcp`.
- The replacement must be substantially shorter than the current overview.
- The landing page owns the Project introduction, stable documentation map, an
  Updates summary, and the bottom pager to the first published child.
- A separate `/projects/call-e/overview` page will not be created.
- The old `/blog/call-e-overview` URL will be retired without a redirect.
- The replacement targets approximately 1,500–2,000 Chinese characters and a
  5–7 minute read, with no more than six top-level sections and one main system
  flow diagram.
- Desktop Agent, Bridge, browser takeover, exhaustive directory maps, technology
  stack inventories, and lengthy runtime-generation comparisons are excluded.

Source inspection on 2026-07-28 found the monorepo at commit `b36ac02f`. The old
overview declares commit `aa7af64` and spends significant space on the separate
desktop Agent product line, Bridge, browser takeover, repository-wide directory
maps, and multiple runtime generations. Those topics are not part of the
Project landing page's primary job of teaching the current CALL-E system.

See [ADR-0003](../adr/0003-call-e-landing-is-source-verified-overview.md).

## Confirmed CALL-E documentation tree

The full existing CALL-E corpus migrates into four stable documentation
sections:

1. Architecture
   - Technical architecture and framework trade-offs
   - Agentic Goal architecture
2. Runtime Traces
   - `commit_goal`
   - `GoalIterationRunner`
   - `RunSpec → Run → VoiceRunExecutor`
3. Engineering
   - Agentic latency optimization
   - Agentic Runtime six-week development plan
4. Explore
   - Agentic source interactive map

The global reading path is:

`Project overview → technical architecture → Agentic Goal architecture →
commit_goal → GoalIterationRunner → Voice Run execution → latency optimization
→ development plan → source interactive map`

The current Blog Series becomes the Project-native Runtime Traces section. The
overview and every adjacent item use the same bottom-pager model, with no empty
next control on the final item.

See [ADR-0004](../adr/0004-call-e-documentation-tree.md).

## Confirmed URL shape

Project-item canonical URLs are flat beneath the Project:

```text
/projects/call-e
/projects/call-e/technical-architecture
/projects/call-e/agentic-goal-architecture
/projects/call-e/commit-goal
/projects/call-e/goal-iteration-runner
/projects/call-e/voice-run-execution
/projects/call-e/latency-optimization
/projects/call-e/development-plan
/projects/call-e/source-atlas
/projects/call-e/updates
```

Section names are editorial metadata and are not encoded in canonical URLs.
Moving an item between Architecture, Runtime Traces, Engineering, or Explore
does not change its address.

Chinese pages use the same shape under `/zh/projects/call-e`.

See [ADR-0005](../adr/0005-project-item-urls-are-flat.md).

## Confirmed migration compatibility policy

All former CALL-E Blog, Blog Series, and static Demo URLs are retired without
redirects. They return the site's normal not-found response after migration.

- Migrated entries are removed from Blog lists, tag counts, RSS, and old sitemap
  entries.
- Only Project-owned canonical URLs appear in the sitemap.
- No compatibility aliases or duplicate route owners are retained.

See [ADR-0006](../adr/0006-retire-old-call-e-urls-without-redirects.md).

## Confirmed locale policy

Projects use strict English/Chinese publication parity.

- Every Project, section label, Project item, and Project-owned interactive
  experience must have both locale variants.
- Both locales use the same slugs, section membership, reading order, and
  publication state.
- Missing translations are build errors; content never falls back to another
  language.
- Pagers, breadcrumbs, and Project navigation remain inside the active locale.
- Both CALL-E overview variants are rewritten and source-verified.
- The current Chinese-only body of the Agentic source map receives a complete
  English interface and content variant during migration.

See [ADR-0007](../adr/0007-project-locales-require-strict-parity.md).

## Confirmed global discovery

Projects is a top-level public destination.

- Primary navigation order is `Home · Blog · Hub · Projects`.
- Localized index routes are `/projects` and `/zh/projects`.
- The index lists published Projects with name, summary, status, last-updated
  date, and entry link.
- The index does not duplicate a Project's documentation tree.
- Blog and Hub remain independent top-level channels.
- CALL-E is the only Project at initial launch.

See [ADR-0008](../adr/0008-projects-is-the-final-primary-nav-item.md).

## Confirmed Project lifecycle

Projects use exactly three lifecycle states:

- `draft`: excluded from public routes, Project indexes, sitemaps, and Updates;
- `active`: publicly available and presented as actively maintained;
- `archived`: still publicly readable and listed, with an archived status that
  does not imply ongoing maintenance.

CALL-E launches as `active`. Additional states require a later demonstrated
behavioral or presentation need.

See [ADR-0009](../adr/0009-project-lifecycle-has-three-states.md).

## Confirmed ownership cardinality

- Every Project item has exactly one owner Project.
- A Project item cannot be owned by multiple Projects.
- Independent Blog posts and Demos may associate with zero, one, or multiple
  Projects.
- Associated content retains its Channel-owned canonical URL and may appear in
  each associated Project's Updates stream.
- Content cannot be both owned by and externally associated with the same
  Project.

See [ADR-0010](../adr/0010-project-ownership-is-singular-association-is-many-to-many.md).

## Confirmed Updates semantics

An Updates entry has exactly two possible origins:

1. an explicitly authored Project Update; or
2. a newly published Blog post or Demo associated with the Project.

Stable-document edits, section or reading-order changes, Git commits, and
Project `lastUpdated` changes do not create Updates automatically.

Updates sort by explicit publication date descending and display their origin as
Project Update, Blog, or Demo.

See [ADR-0011](../adr/0011-project-updates-are-explicit-publication-events.md).

## Confirmed content storage model

Project structure and localized prose are stored separately:

```text
content/
├─ projects.ts
├─ projects/call-e/
│  ├─ index.md
│  ├─ items/*.md
│  └─ updates/*.md
└─ translations/en/projects/call-e/
   ├─ index.md
   ├─ items/*.md
   └─ updates/*.md
```

- `content/projects.ts` owns non-localized structure: slugs, lifecycle, sections,
  item types, and reading order.
- Markdown frontmatter owns localized titles, summaries, publication dates, and
  prose.
- Chinese is the canonical content tree; English mirrors every file exactly.
- Blog frontmatter uses `projects: [call-e]` for associations.
- configured Demos use `projectSlugs`.
- The localized source atlas is stored under
  `public/projects/call-e/source-atlas/{zh,en}/index.html` and served through its
  Project-owned route.
- No new dependency is introduced.

See [ADR-0012](../adr/0012-projects-use-a-structural-manifest-and-localized-content-trees.md).

## Confirmed migration editorial policy

Every migrated textual item is revalidated against the current
`services/seleven-mcp` source and edited; migration is not a file move.

- The Project overview is rewritten and capped by the concise landing-page
  budget.
- Technical architecture and Agentic Goal architecture remove duplicated
  background, obsolete claims, and avoidable implementation detail.
- The three Runtime Traces retain source-level depth, but all symbols,
  transactions, state transitions, and call paths are rechecked.
- Latency optimization retains only techniques that still match the current
  implementation.
- The six-week development plan is reconciled with current code and clearly
  distinguishes completed, obsolete, and remaining work.
- English and Chinese variants are updated together.
- Source provenance identifies the reviewed commit, while transient line numbers
  are avoided.

See [ADR-0013](../adr/0013-all-migrated-call-e-docs-are-source-revalidated.md).

## Confirmed last-updated calculation

The Project index's `lastUpdated` value is derived rather than duplicated in the
manifest.

- Every Project overview and stable document has a required structural
  `updated: YYYY-MM-DD` value.
- Explicit Project Updates contribute their publication `date`.
- `lastUpdated` is the maximum owned-document `updated` or explicit-Update
  `date`.
- Associated Blog and Demo dates are excluded because association does not
  represent Project maintenance.
- Dates are shared structural metadata across locales; translations cannot
  diverge.
- Invalid or missing required dates fail validation.

See [ADR-0014](../adr/0014-project-last-updated-is-derived-from-owned-content.md).

## Confirmed Project-item publication

Project items use `draft | published`.

- Draft items still require complete English/Chinese file parity.
- Draft items have no public routes and are excluded from the Project directory,
  sitemap, Updates, and pager.
- The reading path is computed only from published items and remains contiguous.
- An item can become published only when both locale variants are complete.
- An active Project must contain at least one published item.
- Every migrated CALL-E item launches as published.

See [ADR-0015](../adr/0015-project-items-publish-in-both-locales-atomically.md).

## Confirmed interactive-item shell

The Source Atlas remains inside the Project reading experience.

- `/projects/call-e/source-atlas` is the canonical localized page.
- It displays Project breadcrumb and Explore section context, localized title,
  summary, and instructions.
- The localized interactive asset is embedded responsively.
- A full-screen-open action is available.
- The final bottom pager links only to `development-plan`; it renders no empty
  next control.
- Underlying public HTML assets are implementation details, excluded from the
  sitemap and canonical metadata.

See [ADR-0016](../adr/0016-interactive-items-retain-the-project-shell.md).

## Confirmed item-page navigation

Project item pages expose both hierarchical and linear navigation.

- Desktop layouts show a left Project documentation tree grouped by section and
  marking the active item.
- The existing in-document heading navigation remains available.
- Narrow and mobile layouts collapse the Project tree into a `Project contents`
  control above the article.
- Breadcrumbs expose `Projects / Project / Section / Current item`.
- Bottom pagers provide the canonical linear reading path.
- Draft items are absent from every navigation surface.

See [ADR-0017](../adr/0017-project-items-expose-tree-and-pager-navigation.md).

## Confirmed Updates presentation

- Explicit Project Updates are concise entries rendered inline on the Project's
  `/updates` page.
- They have stable page-fragment anchors but no standalone detail routes.
- The Project landing page shows the three newest Update summaries and links to
  the full timeline.
- Associated Blog and Demo entries render as labeled links to their Channel
  canonical URLs.
- Long-form progress writing belongs in Blog and is associated with the Project.
- The initial timeline is unpaginated and grouped by year.

See [ADR-0018](../adr/0018-project-updates-are-inline-timeline-records.md).

## Confirmed RSS boundary

- The existing `/rss.xml` remains Blog-only.
- Stable Project documentation is excluded.
- Explicit Project Updates are excluded.
- Associated Blog posts appear once in their Blog identity.
- Associated Demos are excluded.
- A future Project-specific feed requires a separate decision.

See [ADR-0019](../adr/0019-global-rss-remains-blog-only.md).

## Confirmed source-provenance boundary

- The local `s-eleven-mono` checkout is an authoring-time audit source only.
- Derek Hub builds do not read, symlink, or fetch the business source
  repository.
- Reviewed Markdown, diagrams, and localized Atlas assets are committed into
  Derek Hub.
- Each Project item stores a `reviewedRevision`; the initial audit targets
  `b36ac02f`.
- Pages display the revision as provenance without linking to a private
  repository.
- A later source refresh updates content, `updated`, and `reviewedRevision`
  together.

See [ADR-0020](../adr/0020-project-docs-are-published-as-source-audited-snapshots.md).

## Implementation defaults

- Project indexes order active before archived, then `lastUpdated` descending,
  then slug.
- Source revision provenance appears near the article footer so the opening
  remains focused on reader orientation.

## Discovery outcome

The product boundary, content ownership, navigation, locale, migration, Updates,
publication, source provenance, and validation policies are resolved. See:

- [Projects Feature PRD](PRD.md)
- [Projects Feature Architecture](ARCHITECTURE.md)
- [Projects Feature Implementation Plan](IMPLEMENTATION-PLAN.md)
- [Projects Domain Glossary](GLOSSARY.md)
- accepted ADRs under [`docs/adr/`](../adr/)
