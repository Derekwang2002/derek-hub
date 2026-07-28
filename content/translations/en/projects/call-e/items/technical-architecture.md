---
title: "CALL-E Technical Architecture and Framework Trade-offs"
summary: "Why CALL-E separates model loops, durable state, external side effects, and realtime events—and uses an explicit Python runtime rather than a graph as business truth."
---

CALL-E's hard problem is not making a model call tools. It is making a long-running objective with real phone side effects recoverable, concurrency-safe, and auditable. At revision `b36ac02f`, model capabilities therefore run inside an explicit product runtime rather than making a framework graph the source of business truth.

## 1. Runtime layers

```text
FastAPI + Session Registry
        ↓
CallEAgent / MainAgent
        ↓
Goal Store + GoalIterationRunner
        ↓
RunSpec Store + Run Registry + Report Store
        ↓
VoiceRunExecutor
        ↓
Botlab / Calling / IAMS adapters
```

The API owns request identity, sessions, and event streams. `CallEAgent` is the facade for product transactions and background scheduling. MainAgent understands the user, fills constraints, and commits a Goal; GoalAgent and deterministic runtime code advance execution after that boundary.

## 2. Why the model layer uses the Agents SDK

The current code uses OpenAI Agents SDK `Agent`, `Runner`, `Tool`, `RunConfig`, Session, and sandbox capabilities. `orchestrator.py` assembles MainAgent as a `SandboxAgent` with a controlled Workspace, built-in tools, and outbound/inbound planner skills.

The SDK owns model turns, tool calls, and streaming events. It does not own CALL-E's business state machine. Goal, Run, and Report remain under SQLAlchemy stores, database constraints, and explicit transactions. Model configuration and Agent assembly can change without redefining business facts.

## 3. Why CALL-E does not use LangGraph

CALL-E control flow is not a fixed DAG:

- a Goal may wait for a call, user confirmation, or an external event;
- one result may lead to continuation, retry, a new RunSpec, or a Report;
- workers need cross-process claims, leases, cursors, and recovery;
- a phone side effect cannot be declared complete because a node ran.

A graph can describe steps, but CALL-E already needs domain state machines and event logs in the database. Treating graph checkpoints as another truth would duplicate recovery semantics and transaction boundaries. The current design uses domain records for facts and an Agent Runner for one model computation.

This is not a general rejection of graph orchestration. Graphs fit stable workflows with bounded nodes and workflow-owned state; they simply do not replace CALL-E's Goal/Run domain.

## 4. Durable state and realtime events are separate

The system keeps two views:

1. durable Goal, Run, Report, and Session Event facts in the database;
2. realtime delivery through in-memory and Redis fan-out plus SSE.

A live stream may disconnect; durable facts may not disappear. Clients replay durable Session Events from a cursor and then join the live stream. `session_read_model.py` folds internal events into user-facing state and removes internal data at the presentation boundary.

## 5. Transaction and side-effect boundaries

A Goal iteration is not one long transaction around a model and a phone provider:

- the claim commits first so other workers can observe the lease;
- the model performs long-running judgment outside that transaction;
- Goal patch, Event, cursor, and lease release commit as one product transaction;
- visible events and Voice Run scheduling happen after commit;
- provider results return through Run Events and evidence.

This keeps locks short and exposes crash windows. Stable Run IDs, state transitions, and idempotency keys reduce duplicate execution risk, but local transactions are not presented as external exactly-once guarantees.

## 6. External platforms stay behind ports

`voice_runtime/executor/types.py` defines Voice Engine, Dialer, and Executor protocols. Providers:

- create or reuse a voice Agent through Botlab;
- obtain calling identity through IAMS;
- create Calling tasks, consume realtime events, and retrieve final results;
- convert provider objects into CALL-E Run state, transcript, and evidence.

The Agentic Runtime depends on execution capabilities without making Botlab or Calling response structures part of its domain model.

## 7. Cost of the architecture

An explicit runtime creates more code: stores, records, schemas, events, leases, and projections all need maintenance. Database migrations and behavior tests must evolve with the state model, and related internal, Session, and UI events must remain consistent.

That cost buys explicit recovery points and side-effect governance. [Agentic Goal Architecture](/projects/call-e/agentic-goal-architecture) next compresses these components into the complete Goal path from commitment to delivery.

