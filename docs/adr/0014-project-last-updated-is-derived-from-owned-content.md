# ADR-0014: Project Last Updated Is Derived From Owned Content

Status: Accepted

Date: 2026-07-28

## Context

The Projects index needs a trustworthy last-updated date. A manually duplicated
Project-level date can drift from the documents and Updates it summarizes.
External associated content may be newly published without representing a
change to the Project itself.

## Decision

- Every Project overview and stable document has a required structural
  `updated: YYYY-MM-DD` value.
- Explicit Project Updates contribute their publication `date`.
- Project `lastUpdated` is the maximum owned-document `updated` or explicit
  Project-Update `date`.
- Associated Blog and Demo dates are excluded.
- Structural dates are shared across locale variants.
- Invalid or missing dates fail validation.

## Consequences

- `projects.ts` does not duplicate a Project-level `lastUpdated`.
- Editing owned documentation requires updating its structural date.
- Publishing an explicit Project Update advances `lastUpdated`.
- Publishing only an associated Blog or Demo adds an Updates entry but does not
  imply the Project documentation was maintained.
- Project indexes can sort or display a deterministic derived value.

