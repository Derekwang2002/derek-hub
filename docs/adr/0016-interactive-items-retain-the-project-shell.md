# ADR-0016: Interactive Items Retain the Project Shell

Status: Accepted

Date: 2026-07-28

## Context

The Source Atlas is the final item in CALL-E's canonical reading path. Sending a
reader directly to a standalone static HTML page would remove Project context,
locale navigation, and the required previous-page boundary.

## Decision

- `/projects/call-e/source-atlas` is the canonical page.
- The page retains Project breadcrumb, section context, localized title,
  summary, instructions, and bottom pager.
- It embeds the matching localized interactive HTML asset responsively.
- It offers a full-screen-open action.
- The underlying public HTML files are implementation resources rather than
  canonical pages and are omitted from the sitemap.
- The final pager contains only the previous link to `development-plan`.

## Consequences

- Interactive and Markdown items share one Project navigation contract.
- The page shell must accommodate a wider embedded experience than prose pages.
- Full-screen mode must preserve the active locale.
- Rendered tests must verify the final previous `href` and absence of an empty
  next control in both locales.

