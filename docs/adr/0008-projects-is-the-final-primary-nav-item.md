# ADR-0008: Projects Is the Final Primary Navigation Item

Status: Accepted

Date: 2026-07-28

## Context

Project is a first-class content owner and needs an entry independent of Blog
and Hub. The site currently exposes `Home · Blog · Hub` in primary navigation.

## Decision

- Add Projects as a top-level destination.
- Primary navigation order is `Home · Blog · Hub · Projects`.
- Project index routes are `/projects` and `/zh/projects`.
- The index lists published Projects with name, summary, status, last-updated
  date, and entry link.
- The index does not duplicate the internal documentation tree.
- Blog and Hub remain independent top-level channels.
- CALL-E is the only Project at initial launch.

## Consequences

- Both locale navigations and responsive navigation states need the new final
  item.
- Active-link behavior must recognize the Project index and descendants.
- The Project index needs localized metadata and sitemap entries.
- Adding future Projects requires data changes rather than new navigation items.

