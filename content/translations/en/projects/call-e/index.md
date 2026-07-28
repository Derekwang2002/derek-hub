---
title: "CALL-E"
summary: "Understand how CALL-E turns model judgment into recoverable, auditable long-running execution by following one real phone-task path."
---

CALL-E is not a chatbot with a phone tool. It manages an objective that may outlive a single conversation: understand what the user wants, confirm real-world side effects, plan one or more calls, preserve evidence, and deliver the result back to the user.

This overview is based on `s-eleven-mcp` revision `b36ac02f`. It establishes only the system model needed to read the source; the following documents carry the implementation detail.

## 1. One main path

```text
User message
  → CALL-E API creates or restores a Session
  → MainAgent clarifies the request and commits a Goal
  → GoalIterationRunner restores Goal context
  → GoalAgent publishes a RunSpec and creates a Run
  → VoiceRunExecutor assembles Botlab and Calling execution
  → realtime events, transcript, and result update Run / Evidence
  → GoalAgent continues, retries, stops, or commits a Report
  → Session Events let the client recover and present the result
```

The path has two timescales. A chat turn should respond quickly, while a phone objective may wait for an answer, require several attempts, or cross a service restart. Progress therefore cannot live only in model context or an in-memory task.

## 2. Five core objects

| Object | Question it answers |
|---|---|
| `Session` | Where does the user observe and continue the work? |
| `Goal` | What outcome is required, and which constraints are confirmed? |
| `RunSpec` | How should one execution be performed? |
| `Run` | Which real attempt actually happened? |
| `Report` | What conclusion and evidence were ultimately delivered? |

A `Goal` is not one call. A long-running objective may produce several versioned `RunSpec` records and several `Run` attempts; one failed dial does not have to end the Goal. A `Report` summarizes the objective rather than copying the status of one call.

## 3. Four system boundaries

| Boundary | Main responsibility | Current source |
|---|---|---|
| API | Request identity, session access, messages, and event streams | `calle/apps/api` |
| Agentic Runtime | MainAgent, Goal, Iteration, Run, Report, and durable events | `calle/agentic` |
| Voice Runtime | Frozen voice instruction, voice-agent creation, dialing, monitoring, and result collection | `calle/voice_runtime` |
| Platform Adapter | Botlab, Calling, IAMS, and realtime-provider integration | `calle_platform` |

An HTTP request may finish while a Goal continues in the background. The Agentic Runtime owns business facts and the next decision; Voice Runtime executes one call; Platform Adapters isolate external protocols. Models make judgments, while deterministic code owns identity, state transitions, idempotency, transactions, and side-effect boundaries.

## 4. Recovery and auditability

CALL-E persists the important facts: Goal and Goal Events, dispatch cursor, immutable RunSpecs, Run state and events, Reports, Session Events, and evidence references in the Workspace.

`GoalIterationRunner` uses claims, leases, and a cursor to stop workers from consuming the same Goal history concurrently. An iteration reads committed facts; the outer transaction commits final product state, and only then does CALL-E publish user-visible Session Events and schedule Voice Runs. After a refresh, disconnect, or process restart, the system can recover from database and event records instead of guessing where a model stopped.

Real calls still contain external side-effect windows. CALL-E provides stable local identity, state machines, idempotency keys, and an evidence chain, but a database transaction alone cannot prove that an external provider will never repeat work. The deeper documents keep local exactly-once recording separate from end-to-end side-effect guarantees.

## 5. Continue reading

Start with [Technical Architecture and Framework Trade-offs](/projects/call-e/technical-architecture) to see why CALL-E uses an explicit runtime. Then read [Agentic Goal Architecture](/projects/call-e/agentic-goal-architecture) and the three Runtime Traces for the real transaction, cursor, and voice-execution paths.

Engineering documents cover latency techniques that still apply and the current development state. The [Source Atlas](/projects/call-e/source-atlas) maps domain concepts back to modules. Milestones and associated Blog/Demo publications live in [Updates](/projects/call-e/updates) without disturbing the stable reading path.

