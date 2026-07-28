# ADR-0007: Project Locales Require Strict Publication Parity

Status: Accepted

Date: 2026-07-28

## Context

The site supports English and Chinese. The existing CALL-E prose has mirrored
translations, while the interactive Agentic source map currently exposes a
Chinese body even when its surrounding resource metadata is localized.

Project navigation forms an ordered parent/child structure. Partial locale
publication would create missing children, broken language switching, or pager
paths that cross languages.

## Decision

Project publication requires strict English/Chinese parity.

- Every Project and Project item must have both locale variants.
- Section labels, item slugs, section membership, reading order, and publication
  state are identical across locales.
- Missing translations fail validation and the build.
- There is no cross-locale content fallback.
- Pagers, breadcrumbs, and Project links remain in the active locale.
- Project-owned interactive experiences must localize their full interface and
  substantive content, not only their surrounding metadata.

## Consequences

- The Agentic source map requires a full English variant during migration.
- A new item cannot publish in one locale before the other is ready.
- The content loader must validate file parity and shared structural metadata.
- Rendered navigation tests must cover both locale route families at every
  boundary.
- Locale switching can map directly between identical Project and item slugs.

