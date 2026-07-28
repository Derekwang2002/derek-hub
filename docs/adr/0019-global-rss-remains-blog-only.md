# ADR-0019: Global RSS Remains Blog-Only

Status: Accepted

Date: 2026-07-28

## Context

Stable documentation, explicit Project Updates, and associated Channel content
have different publication semantics. Adding all of them to the existing feed
would turn a Blog feed into a mixed change stream and could duplicate associated
Blog entries.

## Decision

- `/rss.xml` remains Blog-only.
- Stable Project documentation is excluded.
- Explicit Project Updates are excluded.
- An associated Blog appears exactly once as a Blog entry.
- Associated Demos are excluded.
- Project-specific feeds are deferred.

## Consequences

- Migrated CALL-E Blog posts disappear from RSS when they become Project items.
- Project readers use the Updates page rather than RSS in the first release.
- A future `/projects/<project>/rss.xml` requires a new decision and feed
  contract.

