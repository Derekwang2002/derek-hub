---
title: "CALL-E Agentic Runtime Status and Next Steps"
summary: "Reconcile the original six-week plan with revision b36ac02f and separate delivered foundations, changed directions, and remaining engineering work."
---

The original six-week plan described CALL-E's move from a phone tool to a durable Agentic Runtime. Revision `b36ac02f` has passed several milestones and changed parts of the implementation path. This page no longer presents the old schedule as a future commitment; it turns it into a current status and next-step review.

## Status overview

| Original phase | Current status | Meaning |
|---|---|---|
| W1 Runtime Foundation | Delivered | Goal, Event, Session, Workspace, MainAgent, and continuing iterations exist |
| W2 Outbound One-shot Wrapper | Replaced | Native RunSpec/Run/VoiceRunExecutor is now the target architecture |
| W3 Retrieval + Strategy | Partial | Workspace input, uploads, and immutable RunSpec exist; general retrieval and strategy learning remain incomplete |
| W4 Simulation + Inbound | Runnable loop delivered | SimulationRunner, inbound candidate, approval, and hotline binding exist |
| W5 Report + HITL | Partial | Versioned Report and evidence exist; a general ChangeProposal/strategy-approval loop remains |
| W6 E2E Hardening | Ongoing | Behavior tests, tracing, and permission boundaries have broad coverage; release governance remains continuous work |

## 1. Delivered: durable Goal Runtime

The current implementation includes:

- MainAgent producing `GoalBrief` through outbound/inbound planner skills;
- durable Goal, Goal Event, and Dispatch cursor models;
- iteration claim, lease, incremental event consumption, and recovery;
- controlled Workspace, uploads, and evidence references;
- durable Session Events, realtime fan-out, and a client read model;
- outbound/inbound GoalAgent specialization and context delivery.

The original “Operation State” has therefore become the more precise Goal, Run, and Report domain. One generic Operation JSON no longer acts as the complete truth.

## 2. Replaced: one-shot wrapper to native Run

The old plan wrapped `plan_call / run_call / get_call_run` in an Agent lifecycle. The current main path is:

```text
GoalAgent
  → create_run_spec
  → submit_voice_run
  → CalleRunRegistry
  → VoiceRunExecutor
  → Run Event / Evidence
```

This is not only a rename. RunSpec freezes an execution definition, Run/RunGroup represents real attempts, and terminal events wake the Goal again. The old one-shot capability may remain an independent product path, but it no longer defines the Agentic Runtime domain.

## 3. Delivered: Simulation and the Inbound launch gate

`SimulationRunner` now supports bounded text rehearsal:

- freeze candidate RunSpec, persona, ScenarioSuite, and ground truth;
- give trials stable identity and preserve evidence;
- use a judge to produce risk, coverage, blockers, and suggestions;
- commit a canonical SimulationReport;
- publish terminal state to Goal and Session Events.

Inbound onboarding adds candidate checks, human approval, number selection, and hotline binding. Real number binding should not bypass simulation and authority boundaries.

## 4. Delivered: versioned Reports

GoalAgent writes report artifacts to the Workspace, and `commit_report` validates:

- artifacts belong to the current Goal's allowed directory;
- required Markdown exists;
- optional JSON satisfies its selected schema;
- subject identity, version, and lineage remain consistent;
- evidence references are traceable.

A Report commit creates a durable record and Goal Event, then returns to the user Session through context delivery. This satisfies the original requirement that a report not be only chat prose.

## 5. Partial: Retrieval and strategy

Uploads, Workspace references, RunSpec input references, and planner skills provide controlled input paths. The following should not yet be described as complete:

- a general, evaluated retrieval pipeline;
- stable historical-case and playbook retrieval contracts;
- strategy-effect comparison across multiple Runs;
- a complete reusable Voice Artifact lifecycle;
- governed automatic Strategy Version creation.

The next step is to define retrieval evidence, version identity, and offline evaluation before adding automation. Unrecorded model context must not silently become a production prompt.

## 6. Remaining: ChangeProposal and governance

The code has user confirmation, inbound approval, state constraints, and audit Events, but the general strategy-change loop from the original W5 remains incomplete:

```text
Report finding
  → ChangeProposal
  → human approve / reject / edit
  → new Strategy or RunSpec lineage
  → measured rollout
```

This capability needs its own identity, diff, evidence references, approval state, and rollback semantics. Directly editing the active prompt is not an equivalent substitute.

## 7. Current priorities

1. **Complete segmented latency metrics.** Locate the real bottleneck across Bot preparation, Calling creation, connection, and first audio.
2. **Reuse deployable Voice Artifacts.** Let stable RunSpecs bind ready versions instead of paying cold-start cost for every Run.
3. **Add strategy and retrieval evaluation.** Make retrieval, simulation, and Run outcomes comparable.
4. **Build ChangeProposal.** Put high-impact strategy changes behind explicit human governance.
5. **Keep strengthening E2E behavior.** Cover recovery, duplicate delivery, external timeout, permissions, inbound launch, and Report delivery.

This status should move with source audits rather than promising another fixed six-week calendar. The [Source Atlas](/projects/call-e/source-atlas) locates these capabilities in the current module tree.

