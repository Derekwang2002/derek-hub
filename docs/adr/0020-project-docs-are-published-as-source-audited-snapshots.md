# ADR-0020: Project Documents Are Published as Source-Audited Snapshots

Status: Accepted

Date: 2026-07-28

## Context

CALL-E documentation is validated against a local private business-source
checkout. That checkout is not available in Vercel and must not become an
implicit runtime or build dependency for the public site.

## Decision

- `~/Documents/prod-repo/s-eleven-mono` is used only during authoring and review.
- Derek Hub does not read, symlink, or fetch the business repository during
  build or runtime.
- Reviewed prose, diagrams, and localized interactive assets are committed into
  Derek Hub.
- Every Project item records `reviewedRevision`.
- Initial CALL-E migration targets revision `b36ac02f`.
- Pages display revision provenance without linking to a private commit.
- Refreshing an item updates its content, `updated`, and `reviewedRevision`
  together.

## Consequences

- Production builds remain reproducible from the Derek Hub repository alone.
- Documentation represents an explicit source snapshot, not automatically live
  source truth.
- Different items may carry different reviewed revisions after future targeted
  refreshes.
- Validation requires a non-empty revision for source-backed items but does not
  attempt to resolve it during build.

