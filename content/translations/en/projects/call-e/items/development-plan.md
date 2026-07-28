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

### The complete W5 outcome

W5 is not complete when the system merely produces a report with recommendations. It requires this governed chain:

```text
multi-call evidence
  → criteria-backed strategy analysis
  → committed analysis report
  → structured ChangeProposal
  → human approve / reject / edit
  → candidate RunSpec
  → Simulation
  → Runtime-enforced approval validation
  → activate a new version
  → complete audit lineage
```

T9 analyzes multiple calls from one Goal, RunGroup, or time window and produces a result summary, failure patterns,
strategy-effect observations, and recommendations. Every recommendation must point to concrete evidence references.
T10 turns an accepted recommendation into an independent structured ChangeProposal containing the current version,
target version or candidate, diff, reason, and evidence references. A new RunSpec/Strategy version may take effect only
after the exact proposal is approved and Runtime validation succeeds.

W5 explicitly excludes unattended rollout, multiple reviewers, large-scale A/B testing, and cross-tenant strategy learning.

### Foundations already present in the code

- `calle_reports` already carries Goal/tenant/session/Run/RunGroup scope, lineage, versions, supersession, and evidence refs.
- `commit_report` verifies Workspace scope, Markdown/JSON artifacts, checksums, and schemas before writing a Goal Event
  and durable `report.committed` Session Event.
- Report subjects already cover one-shot Runs, batch RunGroups, and inbound day/week/onboarding windows.
- `calle_run_specs` already has lineage, version, status, instruction ref/checksum, and
  `supersedes_run_spec_id`. In the current domain, a RunSpec version is the natural carrier for Strategy Version.
- Simulation already has candidate identity, canonical evidence, suite checksum, verdict, and a durable
  `simulation_completed` event.
- Canonical confirmation already binds an authenticated user decision to an exact immutable subject and validates
  idempotent replay.
- TUI `/report` and the Session Report API read and verify committed reports within owner scope.

Focused tests for the existing Report, Report skill, Goal confirmation, Simulation, and TUI Report boundaries produced
`87 passed` during this audit. The W5 problem is therefore missing product contracts and governance wiring, not a
failure of these existing foundations.

### Current gaps and material risks

1. **No multi-call strategy analysis.** Only `one-shot-call-report` exists. There is no `batch-call-report`,
   `inbound-report`, strategy-analysis instruction/output schema, or OfflineAnalysisAgent.
2. **No controlled analysis input.** The registry can query Runs, but the GoalAgent tool surface has no bounded,
   structured evidence snapshot by RunGroup, RunSpec version, or time window. Analysis must not depend on injecting
   complete transcripts or directly accessing the database.
3. **No strategy-effect criteria.** Success, comparison window, baseline, minimum sample, provider-failure exclusions,
   and the distinction between causal effect and observed association are undefined. A model cannot responsibly claim
   that v2 beats v1 before the ground truth and validation method exist.
4. **ChangeProposal is entirely absent.** There is no schema, ORM/store, migration, lifecycle, event set, API/TUI
   projection, or test coverage.
5. **Existing confirmation subjects do not cover strategy changes.** Canonical confirmation currently supports voice
   runs, test binding, and inbound hotline binding, but not proposal/candidate identity or edit/revision semantics.
6. **Current RunSpec activation cannot serve as the W5 gate.** Agent-facing `create_run_spec` defaults to
   `activate=true`, and the Store can directly move a draft to active. These foundation interfaces do not validate a
   proposal, approval, Simulation, or candidate checksum. W5 needs a separate, non-bypassable governed activation command.
7. **No proposal presentation or recovery path.** Durable client events cover existing Report and Simulation terminal
   states, but a user cannot yet inspect an exact proposal and continue its decision after restoring a Session.

### Specification conflict

The active long-task spec requires ChangeProposal to be stored independently and never reconstructed from Report
Markdown. Report v0.1.0 both postpones ChangeProposal and suggests that a future workflow could grep
`## Recommendations` before structuring it. That conflicts with the governance invariant that recommendations do not
execute automatically and proposals are not parsed back out of prose.

Before implementation, the active specs should converge on one boundary: `commit_report` continues to commit only the
report; analysis also emits structured recommendation candidates; an explicit proposal command consumes that structured
data without parsing report prose.

### Recommended implementation order

1. **W5-0: converge the specifications.** Select the first domain and define strategy-effect criteria, candidate
   identity, edit/revision semantics, approval-versus-Simulation order, and concurrent baseline drift behavior.
2. **W5-1: deliver T9.** Add a bounded analysis snapshot and one real aggregation subject, preferably RunGroup; emit
   structured findings/recommendations and reuse `commit_report`. Split an OfflineAnalysisAgent only when heavy context,
   independent evaluation, or failure isolation becomes a demonstrated need.
3. **W5-2: establish the ChangeProposal lifecycle.** Add independent identity, source report, current/candidate RunSpec,
   diff, reason, evidence refs, revisions, and decision audit.
4. **W5-3: extend canonical confirmation.** Approval must bind proposal, source report, and current/candidate checksums.
   An edit creates a new revision/candidate and invalidates the old approval.
5. **W5-4: add governed activation.** At apply time, Runtime revalidates the proposal, owner scope, current version,
   candidate checksum, and matching Simulation, then activates version+1 with compare-and-swap behavior.
6. **W5-5: complete the minimum E2E.** Cover pending/reject leaving active unchanged, edits invalidating old approval,
   stale baselines being rejected, Simulation failure blocking rollout, cross-scope denial, and restored
   report/proposal/decision state.

CALL-E is W5 / Phase 3 ready only after this chain is complete.

## 7. Current priorities

1. **Complete segmented latency metrics.** Locate the real bottleneck across Bot preparation, Calling creation, connection, and first audio.
2. **Reuse deployable Voice Artifacts.** Let stable RunSpecs bind ready versions instead of paying cold-start cost for every Run.
3. **Add strategy and retrieval evaluation.** Make retrieval, simulation, and Run outcomes comparable.
4. **Build ChangeProposal.** Put high-impact strategy changes behind explicit human governance.
5. **Keep strengthening E2E behavior.** Cover recovery, duplicate delivery, external timeout, permissions, inbound launch, and Report delivery.

This status should move with source audits rather than promising another fixed six-week calendar. The [Source Atlas](/projects/call-e/source-atlas) locates these capabilities in the current module tree.
