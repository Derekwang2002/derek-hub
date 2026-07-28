# ADR-0005: Project-Item Canonical URLs Are Flat

Status: Accepted

Date: 2026-07-28

## Context

CALL-E stable documentation is displayed in named sections, but those section
assignments may evolve as the Project grows. Encoding a section such as
`architecture` or `runtime-traces` into every canonical URL would couple durable
addresses to editable information architecture.

## Decision

Project items use flat canonical URLs directly below the Project slug.

Examples:

- `/projects/call-e/technical-architecture`
- `/projects/call-e/commit-goal`
- `/projects/call-e/source-atlas`

Section names remain metadata used for navigation and presentation. Chinese
routes mirror the same shape under `/zh/projects/call-e`.

The reserved Project-level Updates route is `/projects/call-e/updates`, with its
Chinese counterpart at `/zh/projects/call-e/updates`.

## Consequences

- A document may move between sections without changing its canonical URL.
- Item slugs must be unique within a Project.
- Reserved Project child slugs, including `updates`, must not be accepted as
  item slugs.
- The loader must validate duplicate Project slugs, duplicate item slugs, and
  collisions with reserved routes.
- Section hierarchy remains visible in breadcrumbs, navigation, and the Project
  landing page rather than in the URL path.

