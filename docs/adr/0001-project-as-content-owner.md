# ADR-0001: Project Is a First-Class Content Owner

Status: Accepted

Date: 2026-07-28

## Context

CALL-E material is distributed across Blog posts, a nested Blog series, and an
interactive Demo. The current timeline and tag navigation can identify related
articles but cannot express one authoritative body of work, its internal
structure, or its intended reading path.

The Projects feature could have been implemented as a saved filter over existing
channels, as a curated cross-channel reading path, or as a new content owner.

## Decision

Project will be a first-class content owner.

- All existing CALL-E material will migrate to Project-owned canonical
  locations.
- The CALL-E Project will own its overview, hierarchy, ordering, and internal
  navigation.
- Future Blog posts and Demos may declare a non-owning association with the
  CALL-E Project while retaining their original content type and canonical URL.
- Association alone does not place an item in the Project's canonical reading
  path.

## Consequences

### Positive

- CALL-E gains one authoritative entry point and coherent information
  architecture.
- Project navigation no longer depends on Blog chronology or tags.
- Project-owned documents can use purpose-built hierarchy and reading order.
- Future commentary and experiments can reference CALL-E without expanding its
  canonical documentation automatically.

### Costs and risks

- Existing Blog, series, and Demo URLs need an explicit compatibility policy;
  ADR-0006 resolves this by retiring them without redirects.
- Blog feeds, tags, sitemap entries, and locale routes must stop treating
  migrated documents as Blog posts.
- The current Blog Series model either needs migration into the Project domain
  or replacement by a Project-native hierarchy.
- Ownership and association must be validated so one publication cannot
  accidentally appear in both roles.
- Parent/child navigation must be verified in both locales using rendered
  `href` values at every boundary.

## Rejected alternatives

### Project as a tag-like grouping

Rejected because it leaves content ownership and reading order fragmented across
existing channels.

### Project as a curated view only

Rejected because the existing CALL-E corpus should move fully into the Project
rather than retain Blog or Demo as its primary identity.
