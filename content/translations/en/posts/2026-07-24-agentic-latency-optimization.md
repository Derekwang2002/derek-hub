---
title: "What Can the Agentic Layer Optimize When Downstream Model Latency Is Uncontrollable?"
summary: "A CALL-E case study that separates Agent planning, Bot preparation, external execution, and result-delivery latency, then explores precompilation, version reuse, parallel prefetching, and real-time event paths."
---

When an Agent system responds slowly, the easiest conclusion is that the downstream model is slow. That conclusion may be correct, but it is usually incomplete.

An Agent task contains more than model inference. After a request enters the system, it may pass through goal interpretation, context recovery, execution planning, Bot creation, version publication, external-system synchronization, state polling, and result delivery. Even when downstream inference time is completely outside our control, the Agentic layer can still remove repeated work from the critical path and let execution and progress reporting begin earlier.

This article uses CALL-E's Agentic Goal and Voice Run path to answer three questions:

1. Which latency optimizations already exist in the system?
2. Which designs merely improve perceived latency, and which ones reduce actual end-to-end time?
3. If the downstream Botlab model cannot be made faster, what should the Agentic layer optimize next?

The central conclusion is:

> **The Agentic layer cannot directly shorten one downstream inference, but it can reduce serial work, cold starts, repeated computation, and result-discovery time around that inference.**

## 1. Start by decomposing “latency”

End-to-end latency can be approximated as:

```text
T_total
  = T_agent
  + T_bot_prepare
  + T_external_submit
  + T_downstream_model
  + T_result_delivery
```

| Stage | Main work | How much the Agentic layer controls |
|---|---|---|
| `T_agent` | Goal interpretation, context recovery, planning, and tool calls | High |
| `T_bot_prepare` | Bot creation, saving, publication, online activation, and configuration sync | High |
| `T_external_submit` | Credential resolution, line selection, and Calling task creation | Medium to high |
| `T_downstream_model` | Per-turn Botlab inference during a call | Low |
| `T_result_delivery` | Terminal detection, persistence, event projection, and UI delivery | High |

If the metric is “user submits a request until the call begins,” the Agentic layer has considerable room to optimize. If the metric is “the other party finishes speaking until the Bot starts responding,” the Agentic layer has only indirect influence through model selection, prompt length, and tool prefetching; the main bottleneck remains inside Botlab.

Without defining the measured interval first, “Botlab is slow” collapses several unrelated problems into one.

## 2. Latency-reduction designs already present

### 2.1 Incremental events and context reuse

`GoalIterationRunner` does not reprocess the full task history after every wake-up. It stores an event cursor and reads only the Goal Events added after the previous iteration. When no new events exist and no dispatch is requested, the Runtime skips the iteration entirely.

For models that support OpenAI Responses Context, GoalAgent also persists and reuses `previous_response_id` instead of resending the complete model context on every iteration. When the context becomes too large, it is compacted and the compacted result is persisted.

These mechanisms reduce Agent input size, repeated computation, and unnecessary model calls. They improve actual latency rather than merely showing UI progress sooner.

### 2.2 Asynchronous execution and streamed events

After GoalAgent creates a Voice Run, it does not synchronously wait for the complete external task. The Voice Run continues in the background, the current iteration can release, and MainAgent and the client observe progress through events.

Model output, tool progress, and execution status are converted into stream events and returned to the client through SSE. The user can see states such as “task accepted,” “Bot preparing,” and “external task created” instead of receiving one response only after the terminal state.

This design significantly improves perceived latency and prevents a long-running task from occupying the foreground request. However, if the background still performs the same serial remote calls, it does not automatically reduce the task's actual duration.

### 2.3 Racing real-time events against polling

After external execution finishes, the system does not rely only on fixed-interval polling. Real-time events can flow through a Kafka bridge into Redis Streams, while the Voice Run concurrently consumes the real-time path and polls Calling Detail. The first path to produce a trustworthy terminal state wins.

```text
                     ┌─ Redis Stream real-time events ─┐
Calling Task ────────┤                                 ├─ FIRST_COMPLETED
                     └─ Calling Detail polling ────────┘
```

When the real-time path fails, the final Calling result still provides authoritative reconciliation. Redis and Kafka therefore remain latency-acceleration layers rather than sources of business truth.

Compared with simply polling more frequently, this “dual-path race plus final reconciliation” avoids continuously increasing load on the downstream API while preserving correctness when the real-time middleware is unavailable.

### 2.4 Caching stable data inside the executor

The Calling executor caches previously resolved AppKey data, account time zone, and Calling Token to avoid repeated IAMS requests or authentication within the same execution lifecycle.

The limitation is that these caches mostly follow the current Provider instance. Their ability to reuse data across Runs and Workers is limited, so multiple Workers may still fetch the same tenant configuration under load.

## 3. The main bottleneck on the current critical path

An outbound Voice Run still tends to create a dedicated Bot for every Run, with `run_id` included in the Bot name. One execution serially performs:

```text
Read Botlab user information
  → Create or update Bot
  → Save Draft
  → Publish Version
  → Put Version Online
  → Wait for Calling to synchronize Robot
  → Resolve AppKey / time zone
  → Create Calling Task
```

This path contains several cross-service network round trips, and each later step often depends on the previous result. Bot publication and Robot synchronization can therefore create significant cold-start latency even if Botlab model inference itself is fast.

Moving this sequence into a background task only lets the API return sooner; it does not remove the work from the critical path. A real optimization must stop creating, publishing, and activating a Bot inside every Run's hot path.

## 4. Core optimization: treat a Bot as a reusable compiled artifact

A better execution model is not “create a Bot every time,” but:

```text
GoalBrief
  → RunSpec
  → Precompile and activate Bot Artifact
  → Persist RunSpecVoiceBinding
  → Multiple Runs reference the Version directly
```

### 4.1 Identify Bot Artifacts with a stable fingerprint

A Bot Artifact can use the following inputs to compute a stable fingerprint:

```text
artifact_key = SHA256(
  tenant_id
  + instruction_checksum
  + voice_profile_version
  + model
  + language
  + speech_settings
)
```

The same tenant, prompt, and runtime configuration should resolve to the same online version. A change to any configuration produces a new Artifact instead of mutating an old version.

The database should record at least:

| Field | Purpose |
|---|---|
| `artifact_key` | Idempotent creation and reuse key |
| `tenant_id` | Prevent cross-tenant sharing |
| `run_spec_id` / `checksum` | Bind the immutable execution specification |
| `bot_id` / `version_id` | Downstream Botlab identity |
| `status` | `preparing / ready / failed / retired` |
| `lease_until` | Prevent duplicate publication by multiple Workers |
| `last_verified_at` | Decide whether online status needs refreshing |

CALL-E already has `RunSpecVoiceBinding` and a stable production Bot mechanism based on RunSpec lineage. The next step is to extend that capability to outbound execution so a Run prefers an already prepared Bot Version.

### 4.2 Move preparation to the post-confirmation phase

The appropriate preparation point is after the RunSpec has been frozen and all required confirmations have completed:

1. Runtime commits an immutable RunSpec.
2. A Bot Prepare Worker idempotently claims its `artifact_key`.
3. The Worker creates, publishes, and activates the Bot Version.
4. On success, it writes the Binding into the RunSpec.
5. At execution time, a Run only validates the Binding and creates the Calling Task.

The system should not provision costly or externally visible resources before the user has confirmed the action. Preparing immediately after confirmation preserves both low latency and the authorization boundary.

### 4.3 Move dynamic target data out of the Bot prompt

Bot reuse depends on whether the prompt contains data unique to one Run.

Phone numbers, contact names, and one-off execution parameters should not be baked into the Bot Version. They should be supplied as Calling variables or runtime context. The Bot Artifact should contain only stable policy, tone, tool definitions, and the task template.

Otherwise, every target produces a different checksum and the cache degrades back into “one Bot per Run.”

### 4.4 Handle invalidation, concurrency, and retirement

Precompilation cannot be only a conventional cache. It needs explicit consistency rules:

- Create a new version when the prompt, model, or Voice Profile changes; existing Runs keep their old version.
- Use a database row lock, lease, or unique Artifact Key to stop multiple Workers from publishing the same version.
- Move a Binding to `ready` only after the Botlab Version is confirmed Online.
- Perform a lightweight health check before execution and fall back to preparation when validation fails.
- Retire old versions using reference counts, last-used time, or a delayed TTL so an active Run is never offlined early.

With these rules, a Bot Artifact becomes an auditable deployment artifact rather than an unreliable in-memory cache.

## 5. Further reductions to the critical path

### 5.1 Prefetch independent dependencies in parallel

Several operations in the current flow do not depend on each other and can run concurrently:

- Resolve Voice Profile.
- Resolve SIP Line.
- Fetch IAMS AppKey.
- Fetch the account time zone.
- Check an existing Bot Binding.
- Warm Botlab and Calling HTTP connections.

These operations can run through `asyncio.gather` or a background Prepare Worker. AppKey data, time zones, Voice Profiles, and Botlab user information can use versioned application-level caches with TTLs instead of living only inside one Provider instance.

The genuinely dependent `save → publish → online` sequence must remain ordered; parallelism should not violate the downstream state machine.

### 5.2 Use a dedicated Worker queue for interactive work

An in-process `asyncio.create_task` has low launch overhead, but it shares CPU, connection pools, and the event loop with API requests. Background work also needs separate recovery when the process restarts.

Bot Prepare and Voice Run tasks can move to dedicated Taskiq / RabbitMQ queues:

- Interactive tasks use a high-priority queue.
- Long-running and batch tasks use separate concurrency pools.
- Workers keep HTTP connections and stable configuration caches warm.
- PostgreSQL leases, event cursors, and idempotency keys continue to enforce correctness.
- The queue provides wake-up delivery, not the only copy of task state.

This design may not reduce the absolute minimum latency of one task, but it prevents batch or slow work from causing head-of-line blocking and improves P95 and P99 under load.

### 5.3 Remove unnecessary model hops

Not every state transition requires another GoalAgent call.

A complete and unambiguous Goal can use a deterministic fast path to generate a standard RunSpec. Mechanical transitions such as `queued → running → completed` can be applied by a reducer that updates state and the user-facing projection. The model should wake only when the system must retry, revise a plan, explain an exception, or request more information.

This reduces serial calls across MainAgent, Planner, GoalAgent, and the downstream model.

### 5.4 Establish real-time event correlation earlier

The Agentic Voice path can create this association before Calling returns a Task ID:

```text
robot_name + callee → run_id
```

After task creation, it can add:

```text
task_id → run_id
```

This two-stage binding captures Kafka events that arrive during the task-creation window and reduces the probability of losing real-time progress and falling back to polling. Redis Streams provide low-latency fan-out and short-term replay, PostgreSQL continues to hold authoritative state, and an SSE reconnect catches up from the database cursor.

## 6. Build an observable latency budget first

Before optimizing, record at least these timestamps:

- `request_received_at`
- `goal_committed_at`
- `run_queued_at`
- `bot_prepare_started_at`
- `bot_online_at`
- `calling_task_created_at`
- `call_connected_at`
- `first_bot_audio_at`
- `terminal_detected_at`
- `result_visible_at`

They produce the following measurements:

| Metric | Question answered |
|---|---|
| Request → Run queued | Is Agent planning too slow? |
| Run queued → Bot Online | Is Botlab cold start dominant? |
| Bot Online → Calling created | Are IAMS, Robot sync, or Calling slow? |
| Connected → First Bot Audio | Are the downstream model, ASR, or TTS slow? |
| Terminal → User visible | Are Kafka, Redis, the database, or SSE slow? |

Prometheus Histograms can track P50, P95, and P99, while Langfuse Traces record the same stages as spans. Metric labels should use low-cardinality dimensions such as Provider, model, Region, Voice Profile, and status; `run_id` and phone numbers should never become metric labels.

Only after this instrumentation exists can the system decide whether the next optimization belongs in Bot warming, Worker scheduling, an external API, or the downstream model.

## 7. When the slow stage is per-turn inference

If measurement shows that the bottleneck truly lies between `call_connected` and `first_bot_audio`, the Agentic layer's role becomes much smaller. It can only optimize indirectly:

- Select a lower-latency model through the Voice Profile.
- Shorten and stabilize the Voice Prompt to reduce input tokens per turn.
- Complete RAG, historical-case analysis, and complex planning before the call.
- Prefetch tool data so the live conversation does not wait for slow queries.
- Tune ASR VAD, LLM Streaming, and TTS Streaming.
- Apply deadlines, circuit breakers, and controlled fallbacks to downstream calls.

The Agentic layer should not hide model latency with unlimited retries. Retries amplify queue pressure and tail latency, and they can duplicate externally visible actions.

## Conclusion

The current system already reduces some Agent overhead and result-discovery time through incremental events, context reuse, background execution, and a race between real-time events and polling. However, the outbound path still places Bot creation, publication, online activation, and Robot synchronization inside every Run's hot path.

The highest-value next step is to promote a Bot from an ephemeral runtime resource into a reusable deployment artifact versioned by RunSpec. Combined with dynamic-parameter separation, parallel prefetching, dedicated Worker queues, and stage-level latency metrics, this can substantially reduce the end-to-end latency controlled by the Agentic layer without changing Botlab inference speed.
