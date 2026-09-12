---
title: "AI Intelligence Radar"
summary: "A local, incremental AI-intelligence knowledge base driven by an AI agent: it turns scattered public information into Events, Signals, Trends, and Decisions that accumulate into long-term technical decision support."
---

AI Intelligence Radar is not an AI news aggregator. It is driven periodically by an AI coding agent and tracks important changes across foundation models, agents, AI engineering, the open-source ecosystem, research, infrastructure, and developer tools, turning primary sources such as official blogs, release notes, GitHub, Hugging Face, and papers into structured events, scores, daily reports, and trends. The code and all data live in the [GitHub repository](https://github.com/Derekwang2002/ai-intelligence); the read-only site is built with Astro and published on [GitHub Pages](https://derekwang2002.github.io/ai-intelligence/).

This page is based on the README and repository layout of the `main` branch at revision `00abc421`.

## 1. One processing chain

```text
public primary sources
  -> Events (structured events with six-dimension scores and radar recommendations)
  -> Signals (accumulated through the cross-run deduplication index)
  -> Trends (lifecycle-managed trend judgment)
  -> Decisions (ADOPT / TRIAL / WATCH / IGNORE)
```

A single news item does not make a trend. A trend requires multiple independent signals: persistence over time, participation by multiple organizations, technical convergence, real adoption signals, or engineering impact that has already happened. When evidence is insufficient, the report explicitly says that no sufficiently supported new trend was found in the period.

## 2. Six core principles

| Principle | Meaning |
|---|---|
| Signal > Noise | Rather miss average news than produce low-quality content |
| Primary Source > Secondary Reporting | Prefer official blogs, release notes, GitHub, Hugging Face, and original papers |
| Engineering Value > Hype | Focus on real impact on architecture, cost, latency, reliability, and dev workflows |
| Impact > Popularity | Repost counts and discussion heat carry no value by themselves |
| Incremental Scan > Repeated Full Scan | Each run processes only new information |
| Historical Evidence > Single-event Speculation | Trends need independent evidence across dates and organizations |

## 3. Knowledge base layout

```text
ai-intelligence/
├── AGENTS.md          # agent execution rules (incremental scan, dedup, scoring, persistence, checkpoint)
├── TASK.md            # instructions for one incremental scan run
├── state.json         # run state and checkpoint (last_successful_run_at)
├── config/radar.yaml  # time window, source tiers, focus areas, scoring dimensions, trend rules
├── events/            # structured events, filed by actual publication date
├── daily/             # Chinese daily reports (accumulated per day, merged across runs)
├── trends/            # trend snapshots and current.md (lifecycle states of tracked trends)
├── index/events.json  # cross-run event index (dedup + trend analysis)
├── logs/              # failure logs and recovery information
└── site/              # read-only static site (Astro): radar / timeline / trends / daily
```

## 4. How it runs

The project is designed to be executed by an AI coding agent: the agent reads `TASK.md`, follows the rules in `AGENTS.md` and `config/radar.yaml` to run one incremental scan, and produces events, the daily report, and trend updates. Only after every step succeeds and passes validation does the checkpoint in `state.json` advance. Combined with a cron-style schedule, the knowledge base accumulates continuously. All tunables live in `config/radar.yaml`: time window and overlap, source tiers (Tier 1 official sources down to Tier 4 community signals), focus lists, scoring dimensions, and quality gates.

## 5. How to keep reading

The mechanism details are expanded in [Incremental Scan, Checkpoint, and Trend Judgment](/projects/ai-intelligence/incremental-radar): how the scan window is derived, how failures recover, how events are deduplicated and scored, and how trends gain a lifecycle. Project news lives under [Updates](/projects/ai-intelligence/updates).
