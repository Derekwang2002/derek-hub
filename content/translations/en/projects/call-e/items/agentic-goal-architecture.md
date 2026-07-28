---
title: "CALL-E Agentic Goal Architecture"
summary: "A complete long-task domain model built from Goal, Event, Iteration, RunSpec, Run, and Report."
---

CALL-E does not pass one user sentence directly to a phone Bot. It first fixes natural-language intent as an auditable Goal, then lets a dedicated GoalAgent advance it in stages. At revision `b36ac02f`, the model supports outbound and inbound objectives while placing simulation, confirmation, real execution, and delivery in one durable lifecycle.

## 1. GoalBrief fixes what must be done

MainAgent collaborates with the user. It loads a planner skill, fills the objective, known facts, constraints, success criteria, and confirmation boundary, then calls `commit_goal`.

`GoalBrief` stores:

- `goal_type` and the user objective;
- known facts, constraints, and open questions;
- success criteria and allowed actions;
- collaboration context, including the language used to answer the user.

Response language is not the callee's language. Voice target, locale, number, and concrete instruction are resolved and frozen again at the RunSpec/Run boundary.

## 2. Goal is the aggregate; Events are history

One commitment creates three complementary records:

| Record | Role |
|---|---|
| `calle_goals` | Current Goal snapshot, status, revision, and Session ownership |
| `calle_goal_events` | Append-only fact history |
| `calle_goal_dispatches` | Pending work, consumer cursor, and iteration lease |

The Goal snapshot makes current reads cheap. Events preserve why the snapshot changed. Dispatch tells workers which facts remain unprocessed. None replaces the others.

User confirmation, updates, nudges, stops, terminal Run state, and Report commits add idempotent events and mark `needs_dispatch` again.

## 3. A Goal iteration is one controlled advance

`CallEAgent` finds a Goal that needs dispatch and invokes `GoalIterationRunner`:

```text
claim iteration lease
  → read committed Goal Events after the cursor
  → combine Goal, Runs, uploads, and Workspace refs
  → select outbound or inbound GoalAgent
  → run the model and controlled tools
  → complete_goal_iteration
  → commit Goal patch, Events, cursor, and lease release
```

An iteration is not an unbounded loop that must finish the objective. It consumes currently visible facts and explicitly returns the next state, context delivery, and Runs to schedule. A Goal can wait for a user, call, or external condition; a new event starts the next iteration.

## 4. RunSpec and Run separate plan from reality

GoalAgent drafts a voice-instruction artifact and calls `create_run_spec` to publish an immutable RunSpec. A RunSpec describes one execution method, input references, voice binding, and schemas. A changed plan becomes a new version rather than silently mutating the old record.

`submit_voice_run` resolves and freezes the target snapshot, runtime profile, SIP line, and idempotent identity, then creates a Run or RunGroup.

| Object | Meaning |
|---|---|
| RunSpec | Reusable, versioned execution definition |
| RunGroup | Logical collection created by one batch submission |
| Run | One real attempt for one target |
| RunEvent | Append-only queued, running, result, and diagnostic history |

One Goal may have many RunSpecs and Runs. A terminal Run writes a Goal Event so GoalAgent can decide from real results.

## 5. Outbound and inbound share the runtime

Outbound GoalAgent can create a RunSpec, submit a real Voice Run, read results, and commit a Report.

Inbound GoalAgent reuses Goal, RunSpec, Report, and iteration mechanics but adds pre-launch gates: a candidate voice configuration, ScenarioSuite, SimulationReport, human approval, and hotline binding. The current `SimulationRunner` performs bounded text rehearsal and freezes persona, ground truth, trials, and judge results. Only a policy-compliant candidate can proceed to real number binding.

The two Goal types expose different tools over the same durable skeleton, so clients do not need separate task-recovery protocols.

## 6. Report and Context Delivery

A Report is not temporary model prose. GoalAgent first writes Markdown—and JSON when required—to the Workspace. `commit_report` validates paths, content integrity, subject, and schema before creating a versioned Report record and Goal Event.

An iteration returns context delivery explicitly through `complete_goal_iteration`. Only after the outer product transaction commits does `CallEAgent` turn that delivery into a durable event visible to MainAgent and the user Session. GoalAgent's internal reasoning does not become a user fact directly.

## 7. Three boundaries to preserve

1. **MainAgent does not execute the Goal.** It understands, confirms, and commits; GoalAgent advances long-running work.
2. **Events are not current snapshots.** Events provide history; Goal, Run, and Report records serve current reads.
3. **A local commit is not external exactly-once.** The database can atomically update local facts, while phone providers still require idempotent identity, state reconciliation, and compensation.

Continue with three source paths: [Commit a Goal](/projects/call-e/commit-goal), [Run one Goal iteration](/projects/call-e/goal-iteration-runner), and [RunSpec to real Voice Run](/projects/call-e/voice-run-execution).

