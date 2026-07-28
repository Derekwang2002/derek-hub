# ADR-0006: Retire Old CALL-E URLs Without Redirects

Status: Accepted

Date: 2026-07-28

## Context

Full migration gives the existing CALL-E corpus a new owner, hierarchy, and
canonical URL space. Compatibility redirects could preserve old inbound links,
but would also retain knowledge of every former Blog, Series, and static Demo
route.

## Decision

All former CALL-E URLs are retired without redirects.

- Old Blog post routes return the normal not-found response.
- Old Blog Series routes return the normal not-found response.
- The old static Agentic architecture Demo route is removed and returns the
  normal not-found response.
- Migrated documents are removed from Blog lists, tags, RSS, and old sitemap
  entries.
- Only the Project-owned routes are canonical and included in the sitemap.

The same retirement policy applies to both English and Chinese URL spaces.

## Consequences

- Existing bookmarks and inbound links break intentionally.
- No redirect table or compatibility aliases need to be maintained.
- Internal Markdown links must be rewritten before the old routes are removed.
- Tests must verify that representative old Blog, Series, localized, and Demo
  routes no longer resolve.
- Search engines discover the new Project URLs through the sitemap and internal
  navigation rather than redirects.

