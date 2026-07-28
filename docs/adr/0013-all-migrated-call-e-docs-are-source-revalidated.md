# ADR-0013: All Migrated CALL-E Documents Are Source-Revalidated

Status: Accepted

Date: 2026-07-28

## Context

The existing CALL-E corpus describes an earlier source snapshot. Full migration
could mean moving those files unchanged, or preserving their subject coverage
while updating the content to reflect the current implementation.

## Decision

Every migrated textual item is revalidated against the current
`~/Documents/prod-repo/s-eleven-mono/services/seleven-mcp` source and edited.

- The Project overview is rewritten within its concise editorial budget.
- Technical architecture and Agentic Goal architecture are substantially
  simplified and deduplicated.
- Runtime Traces retain necessary source-level depth while rechecking symbols,
  transactions, state transitions, and call paths.
- Latency optimization retains only currently applicable techniques.
- The six-week development plan is reconciled with implementation reality and
  distinguishes completed, obsolete, and remaining work.
- English and Chinese are updated together.
- Reviewed source commit provenance is recorded; transient line-number citations
  are avoided.

## Consequences

- Migration is an editorial and source-audit project, not a mechanical path
  change.
- Content review must inspect implementation and relevant behavior tests.
- Existing internal links and diagrams must be regenerated against the new
  Project routes and current model.
- Deep trace documents may remain longer than overview material where detail is
  necessary for correctness.
- Source changes after the recorded review commit require an explicit follow-up,
  not silent claims of perpetual freshness.

