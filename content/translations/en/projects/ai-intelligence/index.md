---
title: "MATRIX · AI Intelligence"
summary: "An evolving AI intelligence product with traceable evidence: understand important changes in minutes, follow projects, and use evidence to assess trends."
---

MATRIX is the reading product for AI Intelligence Radar. An AI coding agent processes public primary sources into **Events -> Signals -> Trends -> Decisions**. A read-only site helps readers understand changes quickly, follow projects over time, and inspect the external evidence.

The code and knowledge base live in the [GitHub repository](https://github.com/Derekwang2002/ai-intelligence); the public site entry is [GitHub Pages](https://derekwang2002.github.io/ai-intelligence/). This overview reflects the local v2 design and implementation on 2026-09-27, not a claim that the live site has been updated. The earlier mechanism article retains its historical account of revision `00abc421`.

## 1. The product problem

Readers should not have to browse the same noise across platforms or accept a summary without traceable sources. The homepage offers a finite briefing; event pages connect facts to originals; projects, trends, and research topics connect individual updates to an ongoing judgment.

The main destinations are Today, Events, Projects, Insights, and Following. The briefing archive and source coverage sit in secondary navigation. Today, the last seven days, and since last completion support different reading rhythms. Follows, bookmarks, and read state are separate and stored in the current browser.

## 2. Six lasting principles

| Principle | Meaning |
| --- | --- |
| Signal > Noise | Prefer fewer useful items to low-quality volume |
| Primary Source > Secondary Reporting | Prefer original materials and distinguish announcements from independent verification |
| Engineering Value > Hype | Focus on architecture, cost, latency, reliability, and developer workflows |
| Impact > Popularity | Discussion and repost counts cannot substitute for real impact |
| Incremental Scan > Repeated Full Scan | Process from the successful checkpoint and deduplicate retries |
| Historical Evidence > Single-event Speculation | Trends require independent evidence across dates and organizations |

## 3. Maintain the product and production process together

Events, sources, evidence, projects, trends, topics, and stable change records are connected. Each scan consumes due reviews, produces bilingual content and a briefing, validates persistence, then atomically advances the checkpoint last. Ordinary edits and reviews without new information do not refresh unread state or radar activity.

JSON/Markdown remains the single source of truth. Astro generates pages and indexes at build time; GitHub Pages serves static reading. There are no accounts, databases, live model calls, or notifications. Historical migration preserves permanent URLs without inventing past changes.

## 4. Final interface direction

The site uses layered liquid glass and a compact homepage workspace with an update feed and research rail. Light mode uses warm white and silver gray; dark mode uses graphite and smoked glass. Deep blue backgrounds and blue-purple glows have been removed from the local design. Blue remains a restrained interaction accent.

Navigation, controls, lists, research details, and archives share material rules. Mobile retains the full action path, while calendars and history expand on demand. Shared fold motion respects reduced-motion preferences. Transparency preferences and browsers without blur receive solid fallbacks.

## 5. Reading order

1. [Incremental Scan, Checkpoint, and Trend Judgment](/projects/ai-intelligence/incremental-radar): the original operating foundation.
2. [MATRIX: From Material Changes to Ongoing Judgment](/projects/ai-intelligence/product-and-intelligence-design): current reading paths, evidence contracts, and production loop.
3. [Neutral Liquid Glass and Product Interface Guidelines](/projects/ai-intelligence/glass-interface-design): final visual decisions, theme screenshots, components, and interaction rules.

Project changes appear in [Updates](/projects/ai-intelligence/updates). Derek Hub preserves explanations and design decisions; the source repository continues to own the changing intelligence.
