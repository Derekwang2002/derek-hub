---
title: "CALL-E"
summary: "From a one-call tool to an Agentic system that continuously owns a user goal: product boundaries, three canonical journeys, and a recoverable, auditable Goal Runtime."
---

CALL-E is not "a chatbot that can invoke a phone tool." It handles an objective that may last far longer than a single conversation: understand what the user wants, confirm real-world side effects, plan one or more calls, preserve evidence along the way, and deliver the outcome back to the user. Today's agentic CALL-E runs on the OpenAI Agents SDK (code in `calle/agentic`); both single-execution outbound calls and long-task Goals run on the same Goal Runtime, and the old stateless v1 pipeline has been absorbed as one kind of RunSpec and Run inside the Runtime.

This page builds the system model needed to read the whole Project. Product-side content is based on the knowledge-transfer document `docs/calle-agentic-knowledge-transfer.md` (baseline 2026-08-12); the engineering side is based on a source audit of `s-eleven-mcp` at revision `b36ac02f`. Implementation details are expanded in the follow-up documents.

## 1. One main chain

```text
user message
  → CALL-E API creates or resumes a Session
  → MainAgent clarifies the request and commits the Goal
  → GoalIterationRunner restores Goal context
  → GoalAgent publishes a RunSpec and creates a Run
  → VoiceRunExecutor assembles the Botlab Agent and Calling task
  → realtime events, transcripts, and results are written back to Run / Evidence
  → GoalAgent continues, retries, stops, or commits a Report
  → Session Events let the frontend resume and display the result
```

This chain has two time scales. A chat turn should respond quickly; a phone objective may wait for someone to answer, go through multiple attempts, or even span service restarts. So the system cannot keep progress only in the model context or in-memory tasks.

## 2. Five core objects

| Object | Question it answers |
|---|---|
| `Goal` | What does the user ultimately want done, and which constraints are confirmed? Persists across sessions and executions |
| `RunSpec` | How does the system plan to do it? An immutable, traceable execution version (script + contract + configuration) |
| `Run` | Which attempt actually happened in the real world? |
| `Evidence` / `Artifact` | Why was this conclusion reached? Append-only, never rewritten |
| `Delivery` | What does the system need to tell or ask the user right now? Declared by GoalAgent, delivered by the Runtime |

Chat history helps the model reason, but `Goal`, `RunSpec`, `Run`, and `Evidence` are the product facts. A `Goal` is not one phone call: a long-term objective can produce multiple versioned `RunSpec`s and multiple `Run`s; execution status is not Goal status either — a failed call does not fail the goal, and a successful one does not complete it.

## 3. Four user-experience boundaries

The system makes only four promises to the user, and every evaluation case maps to one of them:

1. **The status the system reports is true** — "saved," "validated," "approved," "executed," and "completed" must never stand in for one another;
2. **The user knows what the system will do next** — before a real call or hotline binding, the approval target is the exact action itself;
3. **The system does not disappear** — during a long task the user can always see progress, what it is waiting for, and when it will resume;
4. **Failure does not mean starting over** — crashes, restarts, and failed calls never lose a confirmed Goal, plan, or evidence.

These four are honored by the Goal Runtime's durable state, protected-tool approval, delivery contract, and bounded recovery, at the cost of a longer chain, one extra hop to read facts, and cross-Agent debugging effort.

## 4. Four system boundaries

| Boundary | Main responsibility | Current source location |
|---|---|---|
| API | Request identity, session access, message and event streams | `calle/apps/api` |
| Agentic Runtime | MainAgent, Goal, Iteration, Run, Report, and durable events | `calle/agentic` |
| Voice Runtime | Freeze voice instructions, create voice Agents, dial, monitor, and collect results | `calle/voice_runtime` |
| Platform Adapter | Botlab, Calling, IAMS, realtime events, and other external capabilities | `calle_platform` |

The API layer may finish one HTTP request while the Goal keeps advancing in the background. The Agentic Runtime holds business facts and decides the next step; the Voice Runtime executes one call; the Platform Adapter isolates external system protocols. The model is responsible for judgment; deterministic code is responsible for identity, state transitions, idempotency, transactions, and side-effect boundaries.

## 5. Why it can recover and be audited

CALL-E writes key progress as durable records: the Goal and its Events, the dispatch cursor, immutable RunSpecs, Run state and Events, Reports, Session Events, and evidence references in the Workspace.

`GoalIterationRunner` uses claim, lease, and cursor to keep multiple workers from reprocessing the same span of Goal history. One iteration consumes only committed facts; the final business state is committed by an outer transaction, and only after the commit are visible events published to the user Session and Voice Runs scheduled. After a page refresh, a dropped connection, or a process restart, the system recovers from the database and event records instead of guessing where the model left off.

Real phone calls still carry an external side-effect window. CALL-E can provide stable local identity, a state machine, idempotency keys, and an evidence chain, but a database transaction alone cannot prove that an external provider will never execute twice. The documentation explicitly distinguishes "local exactly-once records" from "end-to-end side-effect guarantees."

## 6. How to keep reading

Start with the four product pages: [From "make a call" to "keep completing a Goal"](/projects/call-e/goal-first-product-design) defines the Goal and the four experience boundaries; [Three canonical product journeys](/projects/call-e/product-journeys) expands the lifecycles of Outbound, Published Goal, and Inbound Hotline; [The Goal Lifecycle PRD](/projects/call-e/goal-lifecycle) gives the developer-perspective step-by-step flow from creation to production improvement with the P0–P3 breakdown; [Layer attribution and iteration playbook](/projects/call-e/iteration-playbook) gives bad-case attribution and release discipline.

Then move to the engineering layer: [Technical architecture and framework trade-offs](/projects/call-e/technical-architecture) explains why an explicit runtime was chosen, while [Agentic Goal architecture](/projects/call-e/agentic-goal-architecture) and the three Runtime Trace pages follow the real call chain through transactions, cursors, and voice execution. The engineering chapters also record the latency-optimization methods that still hold and the current development status. Finally, the [Source Atlas](/projects/call-e/source-atlas) jumps from domain concepts back to concrete modules. Project news and links to standalone Blog/Demo content live under [Updates](/projects/call-e/updates) and do not disturb the stable document order.
