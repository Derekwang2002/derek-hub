# ADR-0018: Project Updates Are Inline Timeline Records

Status: Accepted

Date: 2026-07-28

## Context

Explicit Project Updates could become full routed articles, but Blog already
owns long-form chronological writing. A second article system would blur Channel
and Project responsibilities.

## Decision

- Explicit Project Updates are concise records rendered inline on
  `/projects/<project>/updates`.
- Each record has a stable fragment anchor but no detail route.
- The Project landing page shows the three newest summaries.
- Associated Blog and Demo entries are labeled links to their existing canonical
  URLs.
- Long-form progress writing is published in Blog and associated with a Project.
- The initial Updates page is unpaginated and groups entries by year.

## Consequences

- Project Update Markdown must remain concise.
- Update slugs need uniqueness only for stable fragment identifiers.
- There is no static-parameter or metadata surface for individual Update pages.
- A future pagination threshold requires a separate decision.

