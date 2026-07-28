# Projects Domain Glossary

Status: Draft

Terms below are provisional until the discovery questions resolve their exact
boundaries.

## Project

A first-class public content owner for a long-running body of work, such as
CALL-E. It owns its identity, canonical overview, internal structure, and
Project content.

## Project overview

The position-0 entry for a Project: the page that explains the work, establishes
reader context, and leads to the first published child through the same
navigation model used by child pages. For CALL-E, this is `/projects/call-e`;
there is no separate overview child.

## Project item

A content unit owned by a Project and published at a Project-owned canonical
location. The existing CALL-E articles, series documents, and interactive demo
will become Project items during migration.

## Project association

A non-owning relationship from independently published content, such as a future
Blog post or Demo, to a Project. Associated content keeps its own canonical
location and is not automatically part of the Project's reading path.

Association and ownership are mutually exclusive roles for the same publication:
content is either a Project item or an external item associated with the Project.

## Reading path

An editorial sequence through Project items. A reading path is distinct from
chronological publication order and must define navigation at both boundaries
and between every adjacent item.

## Stable documentation

The primary, subject-oriented body of Project-owned content. It teaches the
current system model and is ordered for comprehension rather than recency.

## Update

A chronological entry about Project progress or surrounding work. An Update may
be Project-owned or may reference an associated Blog post or Demo. Updates are a
secondary discovery surface and do not redefine the stable documentation
hierarchy.

## Channel

An existing site-wide publishing surface, currently Blog or Hub. A channel
answers where independently published content is discoverable across the site.
A Project is an owner rather than a Channel filter. Future Channel content may
carry a Project association.

## Series

An ordered parent/child group within the Blog. The existing CALL-E Agentic Goal
series has one overview post followed by numbered source-tracing documents. The
migration replaces it with the Project-native Runtime Traces section and the
global Project reading path.

## Project section

A named grouping in the stable documentation hierarchy, such as Overview,
Architecture, Runtime, Execution, Plans, or Demos.

## Project status

The lifecycle of the Project itself: `draft`, `active`, or `archived`.

## Project-item status

The publication state of one owned item: `draft` or `published`. Publication is
atomic across English and Chinese.

## Reviewed revision

The source revision against which a Project item's technical claims were last
audited. It records snapshot provenance and does not create a build dependency
on the source repository.

## Last updated

A derived Project date: the newest owned-document `updated` date or explicit
Project-Update publication date. External associated content does not contribute.

## Interactive item

A Project-owned non-prose experience rendered inside the Project shell. The
Source Atlas is the first interactive item.
