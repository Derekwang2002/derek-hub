# ADR-0010: Project Ownership Is Singular and Association Is Many-to-Many

Status: Accepted

Date: 2026-07-28

## Context

Project-owned documentation needs one authoritative hierarchy, reading path, and
canonical namespace. Independently published Blog posts or Demos may discuss or
compare several Projects without surrendering their Channel identity.

## Decision

- Every Project item has exactly one owner Project.
- A Project item cannot be owned by multiple Projects.
- Independent Blog posts and Demos may associate with zero, one, or multiple
  Projects.
- Associated content keeps its original canonical URL.
- Associated content may appear in every associated Project's Updates stream.
- The same publication cannot be both owned by and externally associated with
  one Project.

## Consequences

- Project item identity can be validated within one owner namespace.
- Blog and Demo models need an optional list of Project slugs.
- Association validation must reject unknown or draft Project slugs.
- Updates rendering must label external content by its Channel type.
- Ownership and association conflicts fail validation rather than producing
  duplicate entries.

