# ADR-0011: Project Updates Are Explicit Publication Events

Status: Accepted

Date: 2026-07-28

## Context

The Project Updates stream should communicate meaningful progress without
becoming a noisy file-change or Git history view. It must also include future
Blog posts and Demos associated with a Project.

## Decision

Updates have two origins:

1. an explicitly authored Project Update; or
2. a newly published associated Blog post or Demo.

The following do not create an Update:

- editing stable documentation;
- moving or reordering documentation;
- Git commits;
- changing Project `lastUpdated`.

Updates sort by explicit publication date descending and label their origin as
Project Update, Blog, or Demo.

## Consequences

- Project Updates need their own authorable, localized records.
- Blog and Demo publication metadata feeds associated entries into the stream.
- Stable documentation can evolve without flooding Updates.
- Sorting must have a deterministic tie-breaker for equal dates.
- Draft or unpublished source content never appears in Updates.

