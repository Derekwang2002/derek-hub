# Projects Feature Implementation Plan

Status: Ready for implementation

Date: 2026-07-28

## Phase 1: Project domain and validation

### Work

- Add `content/projects.ts`.
- Add Project, section, item, lifecycle, association, and Update types.
- Implement Project loading and strict bilingual mirror validation.
- Add validators for slugs, reserved routes, dates, states, ownership,
  associations, interactive assets, and source revisions.
- Derive published reading paths and `lastUpdated`.

### Acceptance

- Invalid manifests and mismatched locales fail with actionable errors.
- Draft Projects/items cannot reach public loader results.
- Overview is included as virtual pager position 0.
- No new dependency is added.

## Phase 2: Route and component skeleton

### Work

- Add English and Chinese Projects index routes.
- Add Project landing, Updates, and item routes.
- Add breadcrumbs, Project tree, mobile contents, pager, status, Update badges,
  and revision metadata.
- Extend primary navigation with Projects as the final item.
- Reuse the existing Markdown and heading-navigation stack.

### Acceptance

- Empty/sample Project fixtures render statically in both locales.
- Mobile and desktop navigation are keyboard accessible.
- Project tree and pager consume one loader-derived sequence.

## Phase 3: CALL-E source audit and content migration

### Work

- Review current `seleven-mcp` source and relevant behavior tests at
  `b36ac02f`.
- Rewrite the CALL-E overview to its approved content budget.
- Revalidate, deduplicate, and edit both architecture articles.
- Revalidate all three Runtime Traces.
- Update latency guidance.
- Reconcile the development plan with current implementation status.
- Produce matching English content.
- Rewrite every internal link to Project routes.

### Acceptance

- All claims correspond to current source or are clearly qualified.
- All eight textual locale pairs pass parity and content validation.
- Overview meets the 5–7 minute and six-section budget.
- Every item records `updated` and `reviewedRevision`.

## Phase 4: Source Atlas migration

### Work

- Move the Atlas into localized Project-owned public assets.
- Refresh its architecture data against current source.
- Create a complete English interface and substantive content variant.
- Add the Project interactive shell, responsive embed, and full-screen action.
- Apply the minimum functional iframe sandbox.

### Acceptance

- Chinese and English Atlas variants are functionally equivalent.
- The canonical Project route preserves breadcrumb, tree, locale, and pager.
- The final pager contains the expected previous link and no next control.
- Raw asset URLs are absent from sitemap and canonical metadata.

## Phase 5: Updates and external associations

### Work

- Add mirrored explicit Project Update loading.
- Extend Blog frontmatter parsing with `projects`.
- Extend Demo resource metadata with `projectSlugs`.
- Aggregate and label Project, Blog, and Demo Update entries.
- Render the latest three on the landing page and the full year-grouped timeline.

### Acceptance

- Ownership/association conflicts fail validation.
- Associated Blog/Demo keeps its original canonical URL.
- Blog entries are not duplicated in RSS.
- External association dates do not alter Project `lastUpdated`.

## Phase 6: Retire legacy CALL-E ownership

### Work

- Remove migrated Blog source and translation files.
- Remove CALL-E Blog Series sources and definition.
- Remove the old Atlas resource and public directory.
- Remove obsolete series-specific code only if no consumer remains.
- Audit repository-wide references to every old route.

### Acceptance

- CALL-E no longer appears in Blog lists, tags, RSS, or old sitemap paths.
- Old Blog, Series, localized, and Demo routes return not found.
- No redirects or aliases remain.
- No internal link targets an old route.

## Phase 7: SEO, sitemap, and complete-loop verification

### Work

- Add canonical, alternate-language, and Open Graph metadata.
- Add Project routes to sitemap.
- Implement the complete bilingual rendered pager matrix.
- Test Project-tree links, locale switching, mobile navigation, draft exclusion,
  and active/archived indexes.

### Acceptance

- Every overview/first/middle/final boundary has the exact rendered `href`.
- English paths never leak into Chinese navigation or vice versa.
- Only published Project routes appear in sitemap.
- RSS remains Blog-only.

## Phase 8: Quality gates

Run:

```text
npm run lint
npm run test:series
npm run test:board
npm run typecheck
npm run build
```

Add a dedicated Project test command if the new test suite is not naturally
included by an existing runner.

Inspect representative production-rendered HTML for:

- `/projects/call-e`;
- first, middle, and final item pages;
- `/zh/projects/call-e`;
- first, middle, and final Chinese item pages;
- exact pager `href` values;
- canonical and alternate-language links.

## Recommended delivery slices

1. Domain loader, validation, and route skeleton.
2. CALL-E Markdown migration and navigation.
3. Source Atlas localization and embedding.
4. Associations, Updates, retirement, SEO, and final verification.

Each slice should remain buildable and should not expose half-migrated duplicate
ownership in production. Keep the new Project draft until the complete bilingual
migration and legacy retirement can land atomically.

