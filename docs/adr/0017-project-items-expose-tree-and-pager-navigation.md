# ADR-0017: Project Items Expose Tree and Pager Navigation

Status: Accepted

Date: 2026-07-28

## Context

The Projects feature exists to make a large body of related material coherent.
A landing-page directory alone stops helping once a reader enters a deep
Runtime Trace. A pager provides reading order but does not expose the surrounding
hierarchy or support direct non-linear movement.

## Decision

- Desktop Project-item layouts show a persistent left documentation tree grouped
  by section and marking the active item.
- Existing in-document heading navigation remains available.
- Narrow and mobile layouts collapse the Project tree into a
  `Project contents` control above the article.
- Breadcrumbs show Project, section, and current item context.
- Bottom pagers provide the global linear reading path.
- Draft items appear in none of these surfaces.

## Consequences

- Prose pages may use a three-region desktop layout: Project tree, article, and
  in-page heading navigation.
- Responsive breakpoints must collapse navigation before reducing readable
  article width.
- The Project tree and pager consume the same validated published-item model.
- Accessibility tests need current-page state, labeled navigation landmarks,
  keyboard operation, and logical mobile reading order.

