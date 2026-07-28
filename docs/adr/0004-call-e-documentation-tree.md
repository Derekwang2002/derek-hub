# ADR-0004: CALL-E Uses a Sectioned Documentation Tree

Status: Accepted

Date: 2026-07-28

## Context

The existing CALL-E corpus contains five Blog posts, three child documents in a
Blog Series, and one interactive source map. A flat chronological list would
preserve publication order but would not teach the system structure.

## Decision

The migrated CALL-E Project will use this stable documentation tree:

1. Architecture
   - Technical architecture and framework trade-offs
   - Agentic Goal architecture
2. Runtime Traces
   - `commit_goal`
   - `GoalIterationRunner`
   - `RunSpec → Run → VoiceRunExecutor`
3. Engineering
   - Agentic latency optimization
   - Agentic Runtime six-week development plan
4. Explore
   - Agentic source interactive map

The global reading path is:

`Project overview → technical architecture → Agentic Goal architecture →
commit_goal → GoalIterationRunner → Voice Run execution → latency optimization
→ development plan → source interactive map`

The existing Agentic Goal Blog Series is replaced by the Project-native Runtime
Traces section.

## Consequences

- Project sections express subject hierarchy; the pager expresses one
  cross-section reading path.
- The Project overview is position 0 and must link to technical architecture
  through the bottom pager.
- Agentic Goal architecture must link backward to technical architecture and
  forward to `commit_goal`.
- Every middle document must expose both adjacent links.
- The source interactive map is final and exposes only its previous link, with
  no empty next control.
- The same tree, order, labels, and navigation boundaries apply in English and
  Chinese.
- Rendered HTML tests must verify actual localized `href` values at every
  boundary.

