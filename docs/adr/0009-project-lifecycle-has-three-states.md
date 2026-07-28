# ADR-0009: Project Lifecycle Has Three States

Status: Accepted

Date: 2026-07-28

## Context

Projects need an unpublished authoring state, a normal public state, and a way
to preserve completed or no-longer-maintained work. Adding nuanced states before
they cause distinct behavior would make filtering, labels, and validation more
complex without a current use case.

## Decision

Project lifecycle is `draft | active | archived`.

- `draft` Projects have no public routes and are excluded from Project indexes,
  sitemaps, and Updates.
- `active` Projects are public and presented as actively maintained.
- `archived` Projects remain public and listed with an archived label, without
  implying ongoing maintenance.
- CALL-E launches as `active`.

## Consequences

- The loader validates the state enum.
- Static parameter generation and the sitemap exclude drafts.
- Project indexes include active and archived Projects and expose status.
- Archived Project pages remain fully navigable.
- New states require a later decision backed by distinct product behavior.

