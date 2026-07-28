# Projects Feature Architecture

Status: Proposed implementation

Date: 2026-07-28

## 1. Ownership model

Projects introduces two distinct relationships:

```text
Project 1 ─── owns ─── * ProjectItem

Project * ─── associated with ─── * BlogPost / Demo
```

A publication cannot be both owned by and externally associated with the same
Project.

## 2. Structural manifest

`content/projects.ts` is the single non-localized structure source.

Illustrative types:

```ts
type ProjectStatus = "draft" | "active" | "archived";
type ProjectItemStatus = "draft" | "published";
type ProjectItemKind = "document" | "interactive";

type ProjectSectionDefinition = {
  slug: string;
  label: { en: string; zh: string };
};

type ProjectItemDefinition = {
  slug: string;
  sectionSlug: string;
  kind: ProjectItemKind;
  status: ProjectItemStatus;
  updated: string;
  reviewedRevision?: string;
  assetPath?: { en: string; zh: string };
};

type ProjectDefinition = {
  slug: string;
  status: ProjectStatus;
  overview: {
    updated: string;
    reviewedRevision?: string;
  };
  sections: ProjectSectionDefinition[];
  items: ProjectItemDefinition[];
};
```

Array order is canonical reading order. Section membership controls grouping,
not URL shape.

Localized labels may live in the manifest because they are short structural UI
labels that must exist atomically. Localized narrative metadata remains in
Markdown.

## 3. Filesystem

```text
content/
├─ projects.ts
├─ projects/call-e/
│  ├─ index.md
│  ├─ items/
│  │  ├─ technical-architecture.md
│  │  ├─ agentic-goal-architecture.md
│  │  ├─ commit-goal.md
│  │  ├─ goal-iteration-runner.md
│  │  ├─ voice-run-execution.md
│  │  ├─ latency-optimization.md
│  │  ├─ development-plan.md
│  │  └─ source-atlas.md
│  └─ updates/
│     └─ YYYY-MM-DD-update-slug.md
└─ translations/en/projects/call-e/
   ├─ index.md
   ├─ items/
   │  └─ exact mirrors
   └─ updates/
      └─ exact mirrors

public/projects/call-e/source-atlas/
├─ zh/index.html
└─ en/index.html
```

The Source Atlas is declared as an interactive manifest item. Its mirrored
`source-atlas.md` descriptors provide localized page title, summary, and
instructions; the HTML assets provide the embedded experience. This keeps all
reader-facing page metadata inside the same validated localized content trees.

## 4. Loader responsibilities

Add a Project data layer, likely `lib/projects.ts`, with functions equivalent to:

```ts
getAllProjects(locale)
getProjectBySlug(projectSlug, locale)
getProjectItem(projectSlug, itemSlug, locale)
getProjectUpdates(projectSlug, locale)
getProjectNavigation(projectSlug, itemSlug, locale)
```

Validation runs before route generation:

- unique Project slugs;
- allowed Project and item states;
- unique section slugs;
- unique item slugs within a Project;
- no collision with reserved child slugs such as `updates`;
- every item references an existing section;
- active Project has at least one published item;
- exact Chinese/English file parity;
- required title, summary, and non-empty body;
- valid `updated`, Update `date`, and filename date;
- required `reviewedRevision` for source-backed items;
- interactive assets exist for both locales;
- no duplicate ownership;
- associations reference known non-draft Projects;
- no ownership/association conflict.

Draft filtering occurs before generating routes, navigation, sitemap entries, or
derived dates.

## 5. Locale model

Chinese content is canonical:

```text
content/projects/<project>/...
```

English mirrors it:

```text
content/translations/en/projects/<project>/...
```

The loader never falls back across locales. Missing or orphan mirrors are hard
errors. Structural dates, status, order, item kind, and revision come from the
manifest and cannot diverge by language.

## 6. Routes

Suggested App Router structure:

```text
src/app/projects/page.tsx
src/app/projects/[project]/page.tsx
src/app/projects/[project]/updates/page.tsx
src/app/projects/[project]/[item]/page.tsx

src/app/zh/projects/page.tsx
src/app/zh/projects/[project]/page.tsx
src/app/zh/projects/[project]/updates/page.tsx
src/app/zh/projects/[project]/[item]/page.tsx
```

`[item]` dispatches by manifest item kind:

- `document` renders Markdown;
- `interactive` renders the Project shell and localized embedded asset.

All routes are statically generated. Draft Projects and items produce no static
parameters.

## 7. Navigation derivation

The published manifest item array is the only source for:

- landing-page documentation tree;
- persistent Project sidebar;
- mobile Project contents;
- pager previous/next values;
- sitemap item routes.

The overview is a virtual position-0 node:

```text
[overview, ...publishedItems]
```

This guarantees that overview → first item and first item → overview are derived
from the same sequence as every other boundary.

## 8. Page components

Likely components:

```text
ProjectIndex
ProjectLandingPage
ProjectItemPage
ProjectInteractivePage
ProjectBreadcrumbs
ProjectNavigationTree
ProjectMobileContents
ProjectPager
ProjectUpdates
ProjectUpdateBadge
ProjectRevisionMeta
```

Reuse the Markdown renderer, heading extraction, reading rail, locale toggle,
site chrome, and typography styles. Do not fork Markdown behavior.

Desktop prose layout may use:

```text
Project tree | readable article | in-page headings
```

Collapse the Project tree before shrinking the article below its current
readability target.

## 9. Updates aggregation

The Updates loader merges:

1. mirrored explicit Project Update Markdown;
2. published Blog posts whose `projects` contains the Project slug;
3. published configured Demos whose `projectSlugs` contains the Project slug.

Normalize them to a discriminated view model:

```ts
type ProjectUpdateEntry =
  | { type: "project"; date: string; slug: string; title: string; summary: string; content: string }
  | { type: "blog"; date: string; title: string; summary: string; href: string }
  | { type: "demo"; date: string; title: string; summary: string; href: string };
```

Sort by date descending, then by type and stable identity for deterministic ties.
The Project landing page takes the first three.

## 10. Associations

Extend Blog frontmatter:

```yaml
projects:
  - call-e
```

Extend configured Demo metadata:

```ts
projectSlugs: ["call-e"]
```

Associations do not change canonical URLs, sitemap ownership, tags, RSS identity,
or navigation. They only contribute to associated Project Updates and may add a
small “Related project” link on the owning Channel page.

## 11. Source Atlas

The Project item page chooses its asset by locale and embeds it in a responsive
sandboxed iframe. The exact sandbox capability list must be the minimum required
by the Atlas behavior.

The full-screen action opens a Project-controlled presentation route or the
localized asset in a way that does not create a second canonical URL. Set
`noindex` or omit sitemap discovery for asset URLs as appropriate.

## 12. SEO and feeds

- Add Project index, landing, published item, and Updates routes to sitemap.
- Exclude drafts and underlying Atlas assets.
- Add localized canonical and alternate-language metadata.
- Use Project/item title and summary for Open Graph metadata.
- Keep `/rss.xml` unchanged except that migrated Blog items disappear.
- Do not create Project RSS in v1.

## 13. Migration behavior

Remove migrated CALL-E declarations and files from:

- `content/posts/`;
- `content/translations/en/posts/`;
- `content/post-series/calle-agentic-goal/`;
- `content/translations/en/post-series/calle-agentic-goal/`;
- `lib/post-series.ts` definitions;
- existing Hub resource metadata for the static Atlas;
- `public/calle-agentic-architecture/`.

Remove or generalize the old series-only components only after verifying whether
any non-CALL-E consumer remains.

No redirect rules are added. Internal links across all remaining Markdown and
source files must be rewritten before old routes disappear.

## 14. Test architecture

Unit tests:

- manifest validation;
- locale mirror parity;
- reserved and duplicate slugs;
- ownership and association constraints;
- draft filtering;
- last-updated derivation;
- Updates aggregation and ordering;
- route generation.

Rendered navigation tests:

- every row of the bilingual pager matrix;
- actual `href` values;
- overview and final boundary behavior;
- active Project-tree link;
- mobile contents target paths.

Integration/build checks:

- Project pages appear in sitemap;
- migrated paths do not;
- Blog, tags, and RSS exclude migrated content;
- representative old paths return not found;
- Atlas localized embed selection;
- lint, typecheck, existing tests, and production build.
