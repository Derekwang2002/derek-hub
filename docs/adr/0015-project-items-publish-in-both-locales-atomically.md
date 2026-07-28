# ADR-0015: Project Items Publish in Both Locales Atomically

Status: Accepted

Date: 2026-07-28

## Context

Authors need to prepare future Project items without exposing incomplete routes.
At the same time, Project navigation and locale switching require identical
published item sets.

## Decision

Project items use `draft | published`.

- Draft items require complete English/Chinese file parity.
- Draft items have no public routes.
- Draft items are excluded from the Project directory, sitemap, Updates, and
  pager.
- The reading path is computed only from published items.
- Publishing requires both locale variants to be complete.
- An active Project has at least one published item.
- All migrated CALL-E items launch as published.

## Consequences

- Item publication is a structural manifest change, not a locale-specific flag.
- Inserting a draft between published items does not change public pager links.
- Publishing an item recomputes the full localized pager chain.
- Validation rejects an active Project with no published content or mismatched
  locale files.

