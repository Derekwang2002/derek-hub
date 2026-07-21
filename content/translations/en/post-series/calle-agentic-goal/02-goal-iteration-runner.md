---
title: "Tracing GoalIterationRunner—How Leases, Cursors, and Recovery Work Together"
summary: "Start from needs_dispatch=true and read GoalIterationRunner section by section to understand event batches, lease claims, cursor advancement, transaction ownership, and failure recovery."
---

This article is based on `prod-dive-in` commit `aa7af64`. The previous article stopped after `goal_committed` had been persisted and `needs_dispatch=true` had been set. This article begins with the background handoff and follows the complete lifecycle of one call to `GoalIterationRunner.run_goal_iteration()`.

If you are new to source reading, begin with one sentence: **an iteration is not a phone call; it is one work cycle in which GoalAgent reads a batch of new facts, makes a decision, and reliably saves the result.**

## 1. What this article explains

Continue with the restaurant example. MainAgent has committed “ask about a table for two at 7 PM tomorrow” as a Goal, and the database says it needs dispatch. The system must now answer:

- When two background tasks see the Goal at the same time, which one processes it?
- Should GoalAgent read all history or only Events after the previous cycle?
- Should a database transaction stay open while the model runs for tens of seconds?
- Who clears the “running” state after a model failure or process crash?
- How does the next iteration resume from the correct position?
- When does GoalAgent output become a product fact?

Those questions map to four central concepts:

| Concept | Question it answers |
|---|---|
| `needs_dispatch` / backlog | Is there useful work to do now? |
| Lease | Which iteration temporarily owns processing? |
| Event Cursor | Which Goal Events has this consumer already processed? |
| Transaction boundary | Which state is durable, and which state can still roll back together? |

This article stops at the boundary where GoalAgent produces `voice_run_ids`. How `RunSpec → Run → VoiceRunExecutor` places a real call belongs to the next article.

## 2. Start with the complete call chain

First compress one successful iteration into a single picture:

```text
CallEAgent._run_goal_iteration_once(goal_id)
  ▼
GoalIterationRunner.run_goal_iteration(goal_id)
  ├─ Read Goal, Dispatch, and the latest Event ID
  ├─ No pending events → return no_pending_goal_events
  ├─ claim_iteration(...)
  │    ├─ Lock the Goal / Dispatch rows
  │    ├─ Check the current Lease
  │    └─ Write active_iteration_id, lease_until, and running
  ├─ Read Events after the cursor
  ├─ Ensure the dedicated GoalAgent Session
  ├─ commit()  ← make the Claim durable first
  ├─ Runner.run(...) / Runner.run_streamed(...)
  ├─ require_iteration_output(...)
  ├─ apply_iteration_output(...)
  ├─ advance_cursor(...)
  ├─ release_iteration(...)
  └─ Return GoalIterationRunResult

CallEAgent (transaction owner)
  ├─ commit()  ← commit product state for this cycle
  ├─ Publish committed Session Events
  └─ Persist OpenAI context in the background
```

The diagram contains two different `commit()` calls. The first, inside the Runner, only establishes “I have claimed this iteration” as a durable fact. The outer `CallEAgent` commit makes the Goal update, Cursor, Release, and Context Delivery final together. Treating them as one commit leads to an incorrect model of failure recovery.

## 3. The Runner is one consumption attempt, not the scheduler

The `GoalIterationRunner` constructor receives a database session, model configuration, Workspace, Lease TTL, Event batch size, and Session Event infrastructure. It knows how to complete one iteration, but it does not decide when the system should continuously poll every Goal.

The real entry is `CallEAgent._run_goal_iteration_once()`:

```text
Scheduling layer: which goal_id should be attempted now?
    ↓
Runner: can this attempt Claim it, what should it read, and how should it save the result?
```

This separation lets `GoalIterationRunResult` describe the attempt precisely:

- `claimed`: whether this attempt acquired processing ownership;
- `dispatched`: whether GoalAgent actually ran;
- `reason`: `dispatched`, `no_pending_goal_events`, or `goal_iteration_already_claimed`;
- `processed_event_count`: how many new Events were in the input batch;
- `last_processed_goal_event_id`: where the Cursor ended;
- `iteration_status`, `next_wakeup_at`, and `summary`: the next-stage state from GoalAgent;
- `voice_run_ids` and `context_deliveries`: output references for other runtimes.

Calling a scheduling function therefore does not guarantee that the model runs. The Runner first passes through two gates.

## 4. First gate: is there actually new work?

The Runner reads the Goal, Dispatch, and the greatest current Event ID for the Goal. Its key condition is equivalent to:

```python
has_backlog = (
    latest_event_id is not None
    and latest_event_id > dispatch.last_processed_goal_event_id
)

if not dispatch.needs_dispatch and not has_backlog:
    return no_pending_goal_events
```

It checks both the Boolean signal and the real backlog instead of trusting only `needs_dispatch`:

| `needs_dispatch` | `latest_event_id > cursor` | Behavior |
|---|---:|---|
| `false` | `false` | Return immediately; there is no work |
| `true` | either | Attempt a Claim |
| `false` | `true` | Still attempt a Claim so real new events are not missed |

`needs_dispatch` is a materialized signal that is convenient to index and wake on. The difference between Event ID and Cursor is a fact that can be recomputed. Using both lets the runtime see a backlog even when the signal was not updated in time.

If the Dispatch row does not exist, the Runner treats `last_processed_event_id` as `0`. The normal Goal creation path creates a Dispatch row at the same time, but this branch still makes the boundary more robust.

## 5. Second gate: prevent duplicate consumption with a Lease

After confirming that work exists, the Runner generates an `iteration_id` and calls:

```python
claimed = await goal_store.claim_iteration(
    goal_id=goal.goal_id,
    iteration_id=iteration_id,
    lease_ttl_seconds=self.lease_ttl_seconds,
)
```

`claim_iteration()` locks the Goal row and then the Dispatch row. Inside the lock, it returns `false` when it finds:

```text
active_iteration_id != null
and lease_until > now
```

Otherwise it records the current iteration as the new owner:

```text
active_iteration_id = this iteration_id
lease_until         = now + TTL
iteration_status    = running
```

When two Workers arrive together, think of it this way:

```text
Worker A                Database row lock            Worker B
   │ claim                  │                         │ claim
   ├───────────────────────►│                         │
   │ Write Lease            │◄────────────────────────┤ waits for lock
   │ flush                  │                         │
   │ after lock release     │────────────────────────►│ sees valid Lease
   │                        │                         │ returns claimed=false
```

The database row lock solves the “both check and both write” race. The Lease handles the longer period after a Worker has acquired ownership and crosses a model call.

## 6. Why a Lease instead of a permanent lock

If the system stored only a non-expiring `running=true`, a Worker that lost power, was forcibly terminated, or became partitioned might never clear it. A Lease adds an expiration time to ownership:

- Normal completion: the owner calls `release_iteration()`.
- Catchable exception: the Runner rolls back this cycle's writes and explicitly releases to `idle`.
- Process disappears: no cleanup code runs, but `lease_until` eventually expires.
- Later Worker: after expiration, it can write a new `iteration_id`.

Here, source reality must be separated from extensibility. The Store provides `renew_iteration()`, which verifies the owner and extends the TTL, but the main `GoalIterationRunner` path at commit `aa7af64` does not call it periodically. The Runner's default TTL is 300 seconds. The current source therefore relies on an iteration finishing within that Lease window. If future model or tool flows can take longer, renewal must be connected to the actual execution path; the mere existence of a Store method does not mean automatic renewal already happens.

This is an important source-reading habit: **a defined capability is not necessarily used by the main call chain.**

## 7. Why the Claim must commit before the model runs

After acquiring the Lease, the Runner reads new Events and collaboration context and ensures a dedicated GoalAgent Session. Before it calls the model, it then executes:

```python
await self.db_session.commit()
```

The reason is not that model output is complete. It is to make the Claim visible to other database connections. If the Claim remained in an uncommitted transaction while the Runner called a model for tens of seconds:

- other Workers might not see the owner;
- a long transaction would retain locks and an old snapshot;
- model or external-tool latency would hold database resources with it.

Think of this as durably hanging an ownership sign:

```text
Phase A (short transaction)
  Acquire Lease + prepare Session
  COMMIT

Phase B (without a long-lived database row lock)
  Invoke GoalAgent / model / tools

Phase C (product transaction)
  Apply output + advance Cursor + release Lease
  outer owner COMMIT
```

`test_openai_goal_iteration_commits_claim_before_model_and_leaves_final_state_to_owner` and its non-OpenAI counterpart specifically verify that the Claim commits before the model runs while the caller still owns commit or rollback of final product state.

## 8. How the Cursor determines this cycle's input

After a successful Claim, the Runner calls:

```python
new_events = await goal_store.list_goal_events_after(
    goal_id=goal.goal_id,
    after_event_id=last_processed_event_id,
    limit=self.max_event_batch_size,
)
```

The Cursor lives in `calle_goal_dispatches.last_processed_goal_event_id`. It is not the current Goal version and not an array index. It is the greatest durable Event ID that this consumer has confirmed as processed.

Suppose the database contains:

```text
Event 41  goal_created
Event 42  goal_committed
Event 43  user_update
Event 44  confirmed
Cursor = 42
```

The input for this cycle is 43 and 44. The Cursor moves only after success. If the cycle fails, it remains 42, so the next attempt can read the same facts again.

On the first iteration the Cursor is 0, and `build_goal_iteration_input()` produces:

```json
{
  "dispatch_type": "goal_bootstrap",
  "goal": {
    "goal_id": "goal_restaurant",
    "goal_type": "one_shot_outbound",
    "objective": "Ask about a table for two at 7 PM tomorrow",
    "current_status": "planning"
  },
  "events": [
    { "event_id": 41, "event_type": "goal_created" },
    { "event_id": 42, "event_type": "goal_committed" }
  ]
}
```

Later iterations use `dispatch_type="goal_events"` and send only Events after the Cursor, without repeating the complete Goal bootstrap. `test_goal_iteration_runner_sends_only_new_events_after_bootstrap` fixes this contract with a two-cycle test.

## 9. Input contains more than Events

`build_goal_iteration_input()` also does three easily missed things:

1. The first cycle includes the current Goal snapshot: objective, status, version, revision, and payload.
2. It places `collaboration_context.response_language` in the input.
3. On the first cycle, it resolves files under `uploads/` from `GoalBrief.source_refs` into image or file inputs.

The Cursor therefore carries incremental facts, the Goal bootstrap establishes the initial work context, and the dedicated GoalAgent Session / Responses context preserves model continuity. They are not the same kind of “memory”:

| Mechanism | What it stores | Product source of truth? |
|---|---|---|
| Goal/Event | Product state and facts that occurred | Yes |
| Dispatch Cursor | Consumption progress | Yes, as runtime state |
| GoalAgent Session/context | Model conversation continuity | No; it cannot replace product state |

## 10. GoalAgent must explicitly complete the iteration

The Runner builds either `OutboundGoalAgent` or `InboundGoalAgent` from `goal_type`, then calls `Runner.run()`. With a live Session Event bus, it uses `Runner.run_streamed()`.

Model text does not mean an iteration is complete. During execution, the `complete_goal_iteration` tool produces a `GoalIterationCompletedEvent`. After the run:

```python
output = require_iteration_output(completion_events)
```

The code requires **exactly one** completion event:

- zero: raise `GoalIterationCompletionError`;
- more than one: also raise;
- exactly one: obtain the structured `GoalIterationResult`.

This boundary prevents the system from guessing state from model prose. Only fields in the structured completion tool, such as `goal_state_patch`, `events_to_emit`, `iteration_status`, `resume_after_minutes`, and `context_deliveries`, continue into product writes.

## 11. Success path: apply output before advancing the Cursor

`apply_iteration_output()` applies the structured result with the `GoalAgent` actor:

- optionally update Goal state;
- protect the `GoalBrief` committed by MainAgent from replacement by GoalAgent;
- append Event types that GoalAgent is allowed to emit;
- reject Event types owned by the runtime;
- derive idempotency keys from `iteration_id`.

The Runner then queries the latest current Goal Event ID again and calls `advance_cursor()`. The Store lets the Cursor move only forward:

```python
if new_cursor > old_cursor:
    old_cursor = new_cursor
```

It then compares the latest database Event ID again. Only when the latest Event is not greater than the Cursor does it set `needs_dispatch=false`. Clearing the wake-up signal is therefore not a blind write; it represents “the consumer has caught up with the Event stream.”

Notice the current source's exact definition: the Runner queries `latest_goal_event_id` after applying this cycle's output. The Cursor therefore covers Goal Events written during the cycle, not only the last Event in the original input list. When studying concurrency behavior, follow this actual code and do not mistake `processed_event_count` for the Cursor calculation.

## 12. Release does not mean the entire Goal is complete

After advancing the Cursor, the Runner computes `next_wakeup_at` from `resume_after_minutes` and calls:

```python
await goal_store.release_iteration(
    goal_id=goal.goal_id,
    iteration_id=iteration_id,
    iteration_status=output.iteration_status,
    next_wakeup_at=next_wakeup_at,
)
```

The Store first asserts that `active_iteration_id` still equals this cycle's ID, which prevents an old Worker from releasing a newer Worker's Lease. It then clears the owner and expiration time.

`release_iteration()` means only that **ownership of this processing cycle has been returned**. `iteration_status` may indicate waiting for an Event, waiting for a wake-up, or another intermediate state. The Goal itself may still be `calling`, `needs_confirmation`, or something else. Iteration completion and Goal completion live at different levels.

## 13. Final commit belongs to CallEAgent

When `run_goal_iteration()` returns, the success-path Goal patch, Events, Cursor, Release, Session runtime state, and Context Delivery still belong to the outer product transaction. `CallEAgent._run_goal_iteration_once()` then owns:

```python
try:
    result = await runner.run_goal_iteration(goal_id=goal_id)
    await db_session.commit()
except Exception:
    await db_session.rollback()
    raise
```

This creates an important atomic boundary. The system cannot commit “Goal state changed” without the Cursor, nor can it advance the Cursor while losing this cycle's result.

Only after the product transaction commits does `CallEAgent` publish `committed_session_envelopes`. Durable Session Events observed by live clients therefore correspond to committed database facts, not drafts that may later roll back.

## 14. Failure path: roll back results, release the Lease, do not advance the Cursor

If the model call, completion validation, or any product write raises, the Runner's exception path performs:

```text
ROLLBACK uncommitted product changes
  ↓
release_iteration(iteration_status="idle")
  ↓
COMMIT the Lease release
  ↓
re-raise the original exception
```

The important post-failure state is:

| Field | Result |
|---|---|
| `active_iteration_id` | `null` |
| `lease_until` | `null` |
| `iteration_status` | `idle` |
| Event Cursor | Does not advance |
| Uncommitted Goal/Event changes from this cycle | Rolled back |

Because the Cursor does not advance, a later attempt can read the same input again. Explicitly committing the Lease release avoids waiting for the TTL after an ordinary exception.

`test_goal_iteration_runner_releases_iteration_after_goal_agent_failure` verifies cleanup after a model failure. `test_goal_iteration_runner_requires_complete_goal_iteration_tool` verifies that a missing completion tool takes the same recovery path. `test_goal_iteration_runner_preserves_original_db_error_after_aborted_transaction` also ensures that an aborted transaction is rolled back before release, so a secondary database error does not hide the original failure.

## 15. How recovery works after a process crash

Exception handling helps only when the process is alive and Python can execute `except`. If a Worker is terminated after its Claim commits:

```text
Durable state: active_iteration_id = giter_A
               lease_until = 12:05
               cursor = 42

12:02  Worker A disappears without release
12:03  Worker B attempts; Lease is valid → claimed=false
12:06  Worker C attempts; Lease expired → replaces it with giter_C
       cursor is still 42 → reads the original Events again
```

This is a retry-oriented recovery shape, not a magical continuation from the model's middle token. The system recovers the **durable input position and processing ownership**, not an in-process call stack.

Real-world side effects inside an iteration must therefore continue to rely on their own Run/tool idempotency and state machines. Lease and Cursor make Goal Event consumption hard to lose, but by themselves they cannot guarantee that an external call is never duplicated. That is why the next article must enter the RunSpec and Run runtime.

## 16. Why OpenAI context is later than the product commit

When model configuration uses OpenAI Responses context, the Runner stores `_pending_openai_context` temporarily but does not mix context persistence into the product transaction. After product commit, `CallEAgent` schedules:

```python
await runner.persist_openai_context_after_commit()
```

It also uses an independent database Session. The ordering expresses a deliberate priority:

```text
Commit product terminal state such as Goal/Event/Cursor/Lease first
                              ↓
Persist model context and compaction audit later
```

If the second step fails, it cannot rewind the completed product iteration. `test_openai_context_failure_after_product_commit_cannot_roll_back_iteration_terminal` fixes this boundary.

Model context can reduce repeated input in the next cycle, but the source of truth for recovery remains durable product records such as Goal, Event, Dispatch, and Session.

## 17. Derive design contracts from the tests

Do not read only down the implementation. Treat the tests as executable architecture documentation:

| Test | Contract it fixes |
|---|---|
| `test_goal_iteration_runner_runs_outbound_goal_agent_and_advances_cursor` | First-cycle input, structured output, Cursor, and Release |
| `test_goal_iteration_runner_sends_only_new_events_after_bootstrap` | Send only new Events after bootstrap |
| `test_goal_iteration_runner_respects_active_actor_lease` | A valid Lease prevents a second GoalAgent run |
| `test_goal_iteration_runner_releases_iteration_after_goal_agent_failure` | Release the owner and return to idle after failure |
| `test_goal_iteration_runner_requires_complete_goal_iteration_tool` | Never infer completion from ordinary model text |
| `test_openai_goal_iteration_commits_claim_before_model_and_leaves_final_state_to_owner` | Commit Claim first; leave final product state to the outer owner |
| `test_openai_context_failure_after_product_commit_cannot_roll_back_iteration_terminal` | Model-context failure cannot roll back product facts |

When reading these tests, pay special attention to when commit or rollback occurs and what another Session can see. Those assertions explain real transaction boundaries more clearly than any one function name.

## 18. Source-reading checklist

Read in the order “entry → Runner backbone → input → Store concurrency primitives → output application → transaction owner → tests”:

1. `services/seleven-mcp/src/calle/agentic/agents/calle.py`
   - Find `_run_goal_iteration_once()` and `_run_goal_iteration_post_commit()`.
2. `services/seleven-mcp/src/calle/agentic/runtime/goal_iteration_runner.py`
   - Read only `run_goal_iteration()` first, then the helpers.
3. `services/seleven-mcp/src/calle/agentic/runtime/goal_iteration_input.py`
   - Compare bootstrap, incremental Events, and uploaded files.
4. `services/seleven-mcp/src/calle/agentic/goals/store.py`
   - Read `claim_iteration()`, `renew_iteration()`, `advance_cursor()`, and `release_iteration()`.
5. `services/seleven-mcp/src/calle/db/models/goal.py`
   - Match the Dispatch owner, Lease, Cursor, status, and indexes.
6. `services/seleven-mcp/src/calle/agentic/runtime/iteration.py`
   - Read `require_iteration_output()` and `apply_iteration_output()`.
7. `services/seleven-mcp/src/calle/agentic/runtime/models.py`
   - Inspect `GoalIterationRunResult` and relative wake-up time.
8. `services/seleven-mcp/tests/test_calle_agentic_goal_runtime.py`
   - Validate the mental model with success, concurrency, failure, and context tests.

The source will continue to change, so file paths and symbol names are more useful than transient line numbers. Every conclusion in this article refers to commit `aa7af64`.

## 19. Mental model for this article

Compress the article into six sentences:

1. `needs_dispatch` is a wake-up signal; `latest_event_id > cursor` is a recomputable backlog fact.
2. A Claim writes a time-bounded `iteration_id` under row locks so two Workers do not consume the same Goal together.
3. The Claim commits separately before the model runs, making the owner visible and avoiding a long-lived database transaction.
4. The Cursor advances only after structured output is applied successfully; on failure it stays put so the same Events can be retried.
5. Ordinary exceptions explicitly release the Lease; process crashes recover through expiration, but the current main path does not renew automatically.
6. `CallEAgent` atomically commits final product state, while OpenAI context persists independently after commit and cannot define business truth.

The next article will take the `voice_run_ids` returned by this cycle and trace how `RunSpec → Run → VoiceRunExecutor` turns a GoalAgent decision into a real phone call, including the state machine and idempotency boundary for external side effects.
