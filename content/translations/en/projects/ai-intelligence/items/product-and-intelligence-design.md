---
title: "MATRIX: From Material Changes to Ongoing Judgment"
summary: "Product goals, five navigation destinations, incremental reading, evidence, and the production loop that let readers follow AI without browsing every platform."
---

MATRIX serves three connected needs: **understand important changes in minutes, keep following projects, and use evidence to form a judgment about trends.** Content volume is not the success measure. Readers should be able to explain what changed, why it matters, where the evidence is, and what to do next.

This document records the local v2 implementation and confirmed product decisions as of 2026-09-27. It does not claim that this version is deployed. The [AI Intelligence repository](https://github.com/Derekwang2002/ai-intelligence) owns the code and knowledge base; Derek Hub preserves the design explanation rather than duplicating the changing intelligence data.

## 1. Organize features around a reading journey

| Destination | Reader's task | Constraint |
| --- | --- | --- |
| Today | Understand important changes quickly | At most five essentials, each with a selection reason; no filler |
| Events | Find a specific fact or release | Search, categories, verified announcements, frontier watch, permanent URLs |
| Projects | Follow one product or technology over time | Current judgment, changes, availability, scenarios, timeline, sources, open questions |
| Insights | Understand judgments built from evidence | Trends, technical radar, and research topics |
| Following | Return to a personal work context | Follow projects, trends, topics, and scenarios while retaining major global changes |

The briefing archive is reached from Today; source coverage is reached from the as-of timestamp and footer. Search spans events, projects, trends, and topics. The homepage centers on an update feed, with coverage, ongoing research, and scenario links in a desktop rail. Mobile stacks them in reading order.

**The core briefing must have an endpoint.** Readers can explicitly mark it read and reach more material through pagination or expansion. Infinite scrolling would undermine the briefing's purpose.

## 2. Track changes, not just articles

An event can change across several runs without becoming several entities. Updates in the selected range are merged, with history available on expansion. New events, major updates, and corrected judgments have distinct labels. Formatting, translation, migration, and routine reviews do not create news.

Today, the last seven days, and since last completion support different reading rhythms. Discovery time determines the reading date; actual occurrence time is stored separately. If an official Friday fix is discovered on Sunday, it must remain associated with its actual occurrence date without disappearing because the reader completed Saturday's briefing. Read state therefore stores stable change IDs, not just a timestamp watermark.

Opening a page does not mark it read. Bookmarks, follows, and read state are independent. Completion confirms only the currently visible reading content. As-of times use Asia/Shanghai and show CST. A day without changes gets an empty state, not old material relabeled as live news.

## 3. Evidence belongs inside the content

An event starts with a factual sentence, significance, availability, and primary external links. Detailed parameters and six-dimensional scores sit deeper in the page. Links have readable titles and material types. Resources can be grouped by announcement, use, self-hosting, verification, and limitations; missing resources are not invented to fill a layout.

An official announcement establishes what a vendor released or claimed. It does not independently validate performance or adoption. Additional sources can also be official documentation or code, so they must not all be labeled secondary reporting. Reposts do not count as independent verification.

Frontier watch admits public research and experiments while identifying the artifact, confirmed facts, unverified claims, and next observation condition. Engineering picks require an engineering-value rationale. A claim of low attention additionally requires verifiable attention evidence.

## 4. Judgments must persist and remain revisable

Projects retain a current judgment and the event supporting it. Trends distinguish lifecycle, confidence, and recent activity; silence does not automatically mean decline. Trend and topic evidence identifies support, counterevidence, and background. Missing counterevidence records do not prove that none exists.

Recommendation changes and corrections preserve the previous judgment, new judgment, reason, and evidence. Past states must not be reconstructed by guessing from a current snapshot. Research topics maintain an answer, boundaries, open questions, and review triggers. The initial questions are:

- Can open-weight models handle coding-agent workflows?
- What is missing before long-running agents operate reliably?
- What conditions and limitations shape enterprise MCP adoption?

The four scenarios are building agents, model selection, local deployment, and frontier research. Structured relationships drive ranking and explanations without hiding major global changes. ADOPT, TRIAL, and WATCH must identify the audience, trial conditions, and limitations.

## 5. A file knowledge base and read-only site

The stack remains Astro, GitHub Pages, and JSON/Markdown. Projects, sources, topics, briefings, and review tasks live separately; events retain their own evidence and changes to avoid maintaining facts in multiple places. Build-time preparation creates page data, relationship indexes, and a search index. Browsers do not download the entire knowledge base.

Reading pages are static HTML. Search, filtering, and personal state use client scripts. There are no accounts, databases, live model calls, or notification services. Local preferences support import, export, and reset, with no automatic cross-device synchronization. Unavailable or corrupt storage must leave core reading usable and explain that personal state was not saved.

## 6. The production loop sustains the product

Each run checks sources, filters and deduplicates candidates, associates evidence, updates events and projects, consumes due reviews, revisits trends and topics, generates bilingual reports and a briefing, then validates persistence. Fixed feeds and APIs provide stable entry points; broader search handles discovery and gaps.

Previews, pending weights, and claims awaiting independent verification enter a review queue. Official promised dates take priority; otherwise reviews default to seven and thirty days after release. Weekly checks target important gaps from the preceding thirty days. Unchecked, failed, and unchanged sources are distinct; a successful page request does not establish factual verification.

Only after every required stage succeeds does `finalize-run.mjs` atomically advance the checkpoint as the last knowledge-base write. Failures preserve the previous successful window. Migration and builds do not advance it. `last_updated_at` records material change; `last_reviewed_at` records review, preventing routine checks from refreshing unread state or radar activity.

## 7. Questions for future changes

- Can the homepage be read in minutes, with clear outcomes for its controls?
- Can a reader follow a judgment to an event and then to the external original?
- Do retries, delayed discoveries, and migrations avoid duplicates and missed changes?
- Can mobile and English readers complete the same tasks?
- Are failed coverage, unknown coverage, and no new information distinguishable?

Implementation entry points in the source repository are `docs/intelligence-v2.md`, section 20 of `AGENTS.md`, `site/src/lib/intelligence.ts`, `site/src/lib/reader.ts`, and `scripts/finalize-run.mjs`. Continue with [Neutral Liquid Glass and Product Interface Guidelines](/projects/ai-intelligence/glass-interface-design).
