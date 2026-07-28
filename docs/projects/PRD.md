# Projects Feature PRD

Status: Approved for implementation planning

Date: 2026-07-28

## 1. Goal

Add Projects as a first-class public content owner so a large, long-running body
of work can present stable documentation, a canonical reading path, interactive
material, and a secondary Updates timeline in one coherent place.

CALL-E is the first Project. Its existing material will leave Blog, Blog Series,
and Hub/Demo ownership and move completely into Project-owned routes.

## 2. Reader outcome

A new visitor entering CALL-E should:

1. understand the current system structure within 5–7 minutes;
2. see the full documentation tree and know where to continue;
3. move through every document in one verified reading path;
4. jump non-linearly through the persistent Project tree;
5. distinguish stable documentation from recent Updates; and
6. see which source revision supports technical claims.

## 3. Product principles

- Project owns canonical documentation; it is not a tag or saved filter.
- Stable documentation is primary; Updates are secondary.
- Structure is editorial and subject-oriented, not chronological.
- Long-form chronological writing remains Blog content.
- Project ownership is singular; external association is many-to-many.
- Public content stays repository-backed, static-first, and self-contained.
- English and Chinese publish atomically with strict structural parity.

## 4. Public routes

### English

```text
/projects
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

### Chinese

Chinese mirrors every route above under `/zh`.

Section names do not appear in canonical URLs. Sections may be reorganized
without changing item addresses.

## 5. Navigation

Primary navigation is:

```text
Home · Blog · Hub · Projects
```

Project pages provide:

- breadcrumbs;
- a sectioned Project documentation tree;
- active-item state;
- existing in-page heading navigation;
- a bottom previous/next pager;
- a collapsed `Project contents` control on narrow screens.

The Project overview is position 0 in the pager, not a separate child route.

## 6. CALL-E documentation tree

### Architecture

- Technical architecture and framework trade-offs
- Agentic Goal architecture

### Runtime Traces

- `commit_goal`
- `GoalIterationRunner`
- `RunSpec → Run → VoiceRunExecutor`

### Engineering

- Agentic latency optimization
- Agentic Runtime development plan

### Explore

- Agentic source interactive map

## 7. Canonical reading path

```text
CALL-E overview
→ technical architecture
→ Agentic Goal architecture
→ commit_goal
→ GoalIterationRunner
→ Voice Run execution
→ latency optimization
→ development plan
→ source interactive map
```

Required boundaries:

| Position | Previous | Next |
| --- | --- | --- |
| Project overview | none | technical architecture |
| Technical architecture | Project overview | Agentic Goal architecture |
| Agentic Goal architecture | technical architecture | `commit_goal` |
| `commit_goal` | Agentic Goal architecture | `GoalIterationRunner` |
| `GoalIterationRunner` | `commit_goal` | Voice Run execution |
| Voice Run execution | `GoalIterationRunner` | latency optimization |
| Latency optimization | Voice Run execution | development plan |
| Development plan | latency optimization | source interactive map |
| Source interactive map | development plan | none |

The same matrix applies under `/projects/...` and `/zh/projects/...`. Acceptance
depends on rendered HTML `href` values, not loader objects alone.

## 8. CALL-E overview editorial contract

`/projects/call-e` is both the Project landing page and the system overview.

- Approximately 1,500–2,000 Chinese characters.
- Target reading time: 5–7 minutes.
- No more than six top-level sections.
- One end-to-end system flow diagram.
- Orient around Session, Goal, RunSpec, Run, and Report.
- Explain the boundaries of API, Agentic Runtime, Voice Runtime, and Platform
  Adapter.
- End with the documentation map, three newest Updates, and first-child pager.

Exclude desktop Agent, Bridge, browser takeover, exhaustive directory trees,
technology-stack inventories, and long runtime-generation comparisons.

## 9. Source review

All eight migrated textual items are reviewed against the current
`~/Documents/prod-repo/s-eleven-mono/services/seleven-mcp` implementation.
Initial review targets revision `b36ac02f`.

- Overview and architecture material are substantially shortened.
- Runtime Traces retain detail required for source correctness.
- Latency guidance retains only currently applicable techniques.
- The development plan distinguishes completed, obsolete, and remaining work.
- English and Chinese are revised together.
- Each source-backed item displays its reviewed revision near the article footer.

The source checkout is authoring input only. Derek Hub build and runtime never
read, fetch, or link to it.

## 10. Updates

Updates combine:

- concise explicitly authored Project Update records; and
- newly published associated Blog or Demo content.

Stable-document edits, ordering changes, Git commits, and `lastUpdated` changes
do not create Updates.

The Project landing page shows three newest summaries. The full page is
unpaginated initially, grouped by year, and labels entries as Project Update,
Blog, or Demo.

Explicit Updates render inline with stable fragment identifiers and have no
detail routes. Long-form progress belongs in Blog.

## 11. Lifecycle and publication

Project states:

- `draft`
- `active`
- `archived`

Project-item states:

- `draft`
- `published`

CALL-E launches active with all migrated items published. Drafts have no public
routes and appear in no navigation, sitemap, Updates, or pager.

English and Chinese publish atomically. Missing mirrors fail validation.

## 12. Projects index

`/projects` and `/zh/projects` show:

- localized name and summary;
- lifecycle status;
- derived last-updated date;
- entry link.

Active Projects appear before archived Projects. Within one state, sort by
`lastUpdated` descending and then slug for a deterministic tie-break.

`lastUpdated` is derived from owned-document `updated` dates and explicit
Project-Update dates. Associated Blog and Demo dates do not contribute.

## 13. Source Atlas

The source map remains inside the Project shell at
`/projects/call-e/source-atlas`.

- Localized title, summary, and instructions.
- Responsive interactive embed.
- Full-screen-open action.
- Matching English and Chinese substantive content.
- Final previous-only pager.

Underlying localized HTML is an implementation asset and is not canonical or
included in the sitemap.

## 14. Migration and retirement

All current CALL-E Blog posts, Blog Series documents, and the existing static
Demo are removed from their old owners.

- Old routes receive no redirects and return normal not-found responses.
- Migrated entries disappear from Blog lists, tags, RSS, and old sitemap paths.
- Internal links are rewritten to Project routes.
- Only Project-owned canonical routes enter the sitemap.
- `/rss.xml` remains Blog-only.

## 15. Accessibility and responsive behavior

- Navigation landmarks have distinct accessible labels.
- Current Project item uses `aria-current="page"`.
- Mobile Project contents are keyboard operable.
- Breadcrumbs preserve logical hierarchy.
- Pager links have descriptive previous/next labels.
- The interactive embed has a localized accessible title.
- Project navigation collapses before readable article width is compromised.

## 16. Definition of done

- Every public route renders in both locales.
- Every pager boundary has the exact expected rendered `href`.
- Drafts cannot leak into any public surface.
- Locale switching preserves Project and item slugs.
- Source Atlas works embedded and full screen in both locales.
- Representative old routes return not found.
- Migrated content is absent from Blog, tags, RSS, and legacy sitemap entries.
- Project routes have canonical, alternate-language, and Open Graph metadata.
- Lint, typecheck, Project tests, existing Series tests, and production build
  pass.

