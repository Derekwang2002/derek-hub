# ADR-0003: CALL-E Landing Page Is the Source-Verified Overview

Status: Accepted

Date: 2026-07-28

## Context

The current `CALL-E 全景` article is a long repository-wide map based on commit
`aa7af64`. It covers CALL-E alongside the separate desktop Agent, Bridge,
browser takeover, repository directories, and several runtime generations.

The new Project landing page must teach the current CALL-E system first. The
authoritative implementation is now
`~/Documents/prod-repo/s-eleven-mono/services/seleven-mcp`; inspection during
discovery found monorepo commit `b36ac02f`.

Creating both a Project landing page and a separate overview document would
duplicate their responsibilities and make the position-0 navigation ambiguous.

## Decision

- `/projects/call-e` is both the Project entry point and its position-0 system
  overview.
- The old overview will be replaced, not copied.
- The replacement will be verified against the current `seleven-mcp` source and
  substantially shortened.
- A separate `/projects/call-e/overview` route will not exist.
- The landing page will include the Project introduction, documentation map,
  Updates summary, and a bottom pager to the first published child.
- The old `/blog/call-e-overview` route will be retired without a redirect, as
  decided by ADR-0006.

The concise overview has the following editorial budget:

- approximately 1,500–2,000 Chinese characters, targeting a 5–7 minute read;
- no more than six top-level sections;
- one end-to-end system flow diagram;
- only the core concepts needed for orientation: Session, Goal, RunSpec, Run,
  and Report;
- a concise boundary map for API, Agentic Runtime, Voice Runtime, and Platform
  Adapter;
- a closing documentation map, Updates summary, and first-child pager.

Desktop Agent, Bridge, browser takeover, exhaustive directory trees, technology
stack inventories, and lengthy old-versus-new runtime comparisons are excluded.

## Consequences

- The landing page must balance readable narrative with navigation; it cannot
  become another exhaustive architecture article.
- Source commit provenance should be recorded without making transient line
  numbers part of the explanation.
- Desktop Agent and repository-wide architecture material will be removed unless
  a short boundary note is essential to prevent confusion.
- Both locale variants must expose the same overview-to-first-child pager and
  verified rendered `href`.
- Detailed implementation material belongs in child documents rather than on
  the landing page.
