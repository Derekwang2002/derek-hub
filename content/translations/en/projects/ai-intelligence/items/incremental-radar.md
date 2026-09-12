---
title: "Incremental Scan, Checkpoint, and Trend Judgment"
summary: "The Radar's operating mechanics: how the scan window is derived from the checkpoint, how failures recover, how events are deduplicated and scored, and how trends gain a full lifecycle."
---

The Radar's value lies not in any single run but in long-term incremental accumulation. This page summarizes the operating mechanics from `AGENTS.md`, `TASK.md`, and `config/radar.yaml` at revision `00abc421`.

## 1. Scan window

Each run first records `current_run_started_at`, then reads `last_successful_run_at` from `state.json`; the scan window is the interval between the two. The first run looks back 24 hours by default (adjustable via `time_window.initial_lookback_hours`). Retrieval may step back by a small overlap buffer (3 hours by default) to absorb indexing latency and timezone boundaries, but content inside the overlap must be deduplicated and is never written twice.

## 2. Checkpoint and failure recovery

`last_successful_run_at` advances only after retrieval, validation, deduplication, analysis, event storage, the daily report, trends, and the index all succeed and pass validation. It advances to the run's **start time**, not its finish time, so information published while the run is executing is never permanently missed. If any step fails, the checkpoint stays put, the failing stage is recorded under `logs/`, and the next run rescans from the last successful checkpoint.

## 3. Deduplication and event updates

Candidate events are deduplicated through `event_fingerprint`, canonical URL, title, organization, release name, and similar fields. When multiple outlets report the same event, only one event entity is kept: the primary source becomes `primary_source`, and media coverage is filed under `secondary_sources`. When a later run finds significant new information about the same event, the original event is updated instead of creating a duplicate.

## 4. Six-dimension scoring and radar recommendations

Each event carries a structured summary, sources, `why_it_matters`, technical details, and six 1-5 scores:

| Dimension | Meaning |
|---|---|
| Technical Impact | Degree of technical innovation; 5 = may change technical roadmaps |
| Engineering Value | Practical engineering value; 5 = can significantly change how software is built |
| Adoption Signal | Real adoption signal; 5 = fast, genuine adoption |
| Maturity | 1 = research demo, 5 = widely adopted |
| Verification Cost | 5 = high cost to verify |
| Risk | License / security / lock-in / stability risk |

Every important technology also carries a tech-radar recommendation: ADOPT, TRIAL, WATCH, or IGNORE.

## 5. Trend lifecycle

Trends have a full lifecycle: `candidate -> emerging -> strengthening -> established`, or `weakening / invalidated`, maintained in `trends/current.md`. Judgment is based on accumulated independent signals: persistence over time, participation by multiple organizations, technical convergence, real adoption signals, or engineering impact that has already happened.

## 6. Focus areas

Foundation models; AI agents (frameworks, tool calling, MCP, memory, sandboxes, long-running agents); AI engineering (RAG, context engineering, evaluation, model serving); open source (projects with real growth signals); research (papers with code and benchmarks); infrastructure; developer tools; and business/policy events only when they could actually change the technical ecosystem.
