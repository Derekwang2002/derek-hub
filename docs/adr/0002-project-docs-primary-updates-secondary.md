# ADR-0002: Stable Documentation Is Primary and Updates Are Secondary

Status: Accepted

Date: 2026-07-28

## Context

CALL-E content serves two different reader needs:

- understanding the current system, its architecture, and its runtime; and
- following development progress, experiments, and newly published material.

A purely thematic portal hides project evolution, while a purely chronological
project journal makes readers reconstruct the system model from posts published
at different times.

## Decision

Projects will provide both stable documentation and an Updates stream.

- Stable documentation is the primary Project experience.
- The CALL-E Project entry point must first teach the system structure.
- Stable documentation is organized by subject and intended reading order.
- Updates form a secondary chronological surface.
- Future associated Blog posts and Demos appear in Updates by default.
- An association does not automatically add an external publication to stable
  documentation.

## Consequences

### Positive

- New readers get a coherent, durable path through CALL-E.
- Returning readers can follow recent work without disturbing the canonical
  documentation hierarchy.
- Blog and Demo associations have a clear presentation surface.

### Costs and risks

- Project pages need to distinguish ownership from association visually and in
  metadata.
- The data model must support both editorial order and chronological order.
- Sitemap, metadata, and locale behavior must cover stable documentation and
  Updates separately.
- The Project landing page still needs a precise relationship to its overview
  document and first child.

## Rejected alternatives

### Documentation portal only

Rejected because it provides no first-class place for ongoing development and
associated publications.

### Development timeline only

Rejected because the primary goal is to teach CALL-E's system structure rather
than make readers reconstruct it chronologically.

