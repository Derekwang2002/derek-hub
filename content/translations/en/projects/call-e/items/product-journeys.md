---
title: "Three Canonical Product Journeys and Their Lifecycle Owners"
summary: "Interactive Outbound, API-driven Published Goal execution, and Inbound Hotline share one backbone; they diverge after \"execute\" — the difference is who keeps pushing forward."
---

This page is organized from chapters 3 and 4 of the knowledge-transfer document `docs/calle-agentic-knowledge-transfer.md` (baseline 2026-08-12). The three journeys are not three mutually exclusive architecture types; they are three common ways of walking the same backbone. For the more detailed developer-perspective step-by-step flow (Simulation → Live Test → Real Call Test → API integration → post-production improvement), see [The Goal Lifecycle PRD](/projects/call-e/goal-lifecycle).

## 1. The shared backbone

```text
understand the objective → save the objective → prepare a plan → validate → authorize → execute → leave evidence → review and iterate
```

What each step contains differs by path:

| Stage | Outbound | Inbound |
|---|---|---|
| Define the objective | Complete a booking, follow-up, collection, or information confirmation | Launch a hotline that continuously handles a class of incoming calls |
| Fill in facts | Contact, number, time, stop conditions | Knowledge sources, handling scope, escalation conditions, forbidden actions |
| Prepare the plan | Generate the script and RunSpec | Compile source knowledge into an inbound strategy |
| Validate | Check the script against scenarios | Check answers and escalation against personas |
| Authorize | Approve the exact dialing action | Approve binding the exact hotline and version |
| Execute | Make one call | Keep answering every call |
| Iterate | Retry, change the time, change the strategy, or end | Update knowledge, re-validate, and re-publish |

## 2. Three kinds of "approval" to keep apart

A reusable Goal walks the Outbound column and only parts ways at "authorize." The three approvals have different semantics:

- **Confirmation in conversation** — the user agrees to a plan or an action in chat. It is product semantics, not a permission mechanism.
- **Protected-tool approval** — the SDK interrupts before the handler executes; the approval target is the exact tool name, arguments, and call id. Today only `submit_voice_run` (real dialing) and `bind_hotline` (hotline binding) go through this.
- **Publish contract** — `publish_goal_run_spec` fixes which RunSpec version may be executed. It is not a protected tool; each subsequent Run is triggered by the caller against that contract.

So: interactive Outbound passes protected-tool approval before every real call; Inbound passes protected-tool approval before binding a hotline; a Published Goal locks its version through the publish contract, and each individual Run is initiated by the caller without waking GoalAgent.

## 3. Outbound: book me a restaurant, and if nobody answers, change the time and try again

1. **State the objective** — the user talks normally, MainAgent takes it. No side effects.
2. **Ask only blocking questions** — at most one or two: the restaurant's number? The name on the reservation? `outbound-planner` judges ready / needs-more / blocked. If it cannot be clarified, stop; do not guess.
3. **Confirm, Goal persisted** — a readable summary plus confirmation. At this point only "objective saved" is promised, not "arranged."
4. **Generate the plan** — OutboundGoalAgent produces the script and RunSpec, explicitly stating "not yet tested, not published." If a key fact is missing, come back and ask; do not invent it.
5. **Check / Simulation** — "rehearsed against N scenarios, conclusion: OK / not OK / uncertain." The Runtime orchestrates; the Judge scores each scenario. Incomplete evidence always means uncertain, and nothing is let through.
6. **Approve the real call** — the user sees the exact number and the exact script version. Once approved, the same action is resumed even if the process exits; the call is never duplicated.
7. **Execute and persist** — the Voice Agent calls, the Runtime stores. The result is persisted before notification, so a failed notification can be redelivered.
8. **Report and decide the next step** — "7pm is full, 8pm has a table — shall I try 8pm?" Consecutive model failures do not bother the user; in the end the user gets one actionable explanation.

Automatic rescheduling and redialing after step 8 is not production capability yet. Today it is: GoalAgent reviews → makes a suggestion → the user confirms in one sentence → the same Goal is reused for another call (no reconfiguration). "One confirmation covering multiple dialing slots, with the Runtime guarding time and count" is still in draft (the `goal-call-strategy` spec).

## 4. Reusable Goals (Draft): after publishing, hand over to the API

The restaurant journey is one-shot: done and finished. Another form turns a Goal into a reusable template: the first half is the same (intake, candidate generation, Simulation validation), and once validated it is published so external systems can invoke it repeatedly by `goal_id`.

- **Publish** — `publish_goal_run_spec` sets the validated RunSpec version as the published pointer. Before that, it remains an "untested, unpublished candidate."
- **External trigger** — `POST /v1/goals/{goal_id}/runs` carries this invocation's variables (who to call, what to say); CALL-E executes once with the published version, and the result is fetched from `GET .../runs/{goal_run_id}`. The contract lives in `sdks/openapi/calle.openapi.yaml`; the spec is still Draft.

On this path, **GoalAgent does not participate in each call**. When a published Goal's Run ends, no Goal event is created, no Agent is woken, and no delivery is produced — the result lands directly as a structured projection for the caller to fetch. Invoked a thousand times a day, you cannot wake an Agent to think about every single call.

So "who is advancing this objective" has different answers on the two paths: for interactive, it is GoalAgent; for published, it is the caller itself. The same bad case appearing on different paths means completely different things need to change.

## 5. Inbound: launch a support hotline that can answer logistics and refund questions

The user's words are roughly: "Set up a support hotline that can answer logistics and refund questions; escalate to a human when unsure or when a refund approval is involved."

1. **Describe the service objective** — MainAgent takes it.
2. **Ask what cannot be derived** — Where are the materials? What must not be answered? When should it escalate? Which language? Anything derivable from materials or configuration must not be asked back to the user.
3. **Confirm, create the Inbound Goal** — "Objective saved, organizing the materials now." At this point no bot has been built and no number has been bound.
4. **Organize knowledge + generate the strategy** — InboundGoalAgent distills a knowledge scope from the uploaded materials. Knowledge comes only from source materials; every change produces a new version, and old versions remain traceable.
5. **Rehearse with personas** — simulate scenarios like refunds, timeouts, and no-reason returns. The rehearsal targets an exact candidate version; switching versions requires re-running it.
6. **Auto-repair and re-rehearse** — "found 2 inaccurate answers, fixed and re-rehearsed." There is a bounded attempt count; once exhausted, report what was fixed, what risks remain, and what is recommended — never dump the implementation task back on the user.
7. **Report + approve binding** — the onboarding report states clearly what was understood, what was rehearsed, what limitations remain, and what effect activation will have. The report is decision context, not an authorization credential; before binding, version and evidence are re-validated for consistency.
8. **Hotline goes live** — set the publish pointer; the Goal becomes active. A stale version, a rejected approval, or a provider failure never moves the pointer.
9. **Keep answering** — the Voice Agent is responsible. A single failed call does not affect hotline status and does not end the Goal.
10. **Periodic review** — "8 calls this week went unanswered, concentrated around refund timing" plus improvement suggestions. What it produces is a draft candidate; nothing goes live automatically.

Inbound differs from Outbound in two ways. First, **bounded auto-repair**: problems the Agent can find and fix by itself, it fixes and re-rehearses; it comes back to the user only for facts only the user knows, or when an already-confirmed boundary must change. Second, **going live is not the finish line**: once the hotline is active it enters a review loop, identifying knowledge gaps and producing improvement candidates awaiting validation.

One more point worth repeating: **InboundGoalAgent does not participate in any real-time conversation**. What it owns is the hotline's build-validate-improve lifecycle; every incoming call is handled independently by the Voice Agent. These two operate on time scales orders of magnitude apart — mixing them makes real-time performance impossible to guarantee.

Finally, periodic review is off by default. After a Goal first goes live, the system asks once, explains that it adds cost, and offers three choices — "off / weekly / daily." It does not turn on a background analysis that costs money without asking.

## 6. Product concepts and components

Chat history helps the model reason, but Goal, RunSpec, Run, and Evidence are the product facts. The components exist to maintain these objects, not the other way around.

| Object | Question it answers |
|---|---|
| Goal | "What do I want done" — an objective that persists across sessions and executions |
| RunSpec | "How does the system plan to do it" — an immutable, traceable execution version (script + contract + configuration), including but not limited to the Voice Agent Instruction |
| Run | "This one actual execution" — created by a protected Tool in the interactive path, or by the authorized external invocation contract for a Published Goal; once in real execution it cannot be undone by rewriting history |
| Evidence / Artifact | "Why this conclusion" — call-record references, result receipts, evaluation results, reports; append-only, never rewritten |
| Delivery | "What does the system need to tell or ask me now" — declared by GoalAgent, delivered by the Runtime, expressed by MainAgent |

Four lifecycle owners:

- **MainAgent owns the conversation** — understands the objective, asks only necessary questions, gets confirmation, expresses results. It does not own Goal strategy state, does not submit execution, and does not proxy approvals.
- **GoalAgent owns the Goal** — produces plans, prepares execution, validates, handles results, improves periodically. It cannot bypass approval.
- **Runtime owns the deterministic skeleton** — state, scheduling, recovery, idempotency, permissions, lifecycle. It makes no open-ended semantic judgments.
- **Voice Agent owns single-call execution** — one low-latency real-time conversation. It owns no Goal, no publishing, and no cross-call reporting.

Two auxiliary roles (owning no lifecycle): **Judge** — semantic judgment in an isolated context, no tools, no session, no state changes; **Materializer** — one-shot structuring that turns a terminal result into a receipt.

One boundary gets used over and over: MainAgent and GoalAgent may only collaborate through the Runtime's state / event / delivery.

## 7. Why split into MainAgent and GoalAgent

This is probably the most questioned complexity in the whole architecture. The reason is that two kinds of work have exactly opposite requirements on three dimensions:

| Dimension | MainAgent | GoalAgent |
|---|---|---|
| Context | The current user conversation | The current Goal's decisions and facts |
| Trigger | The user sends a message | Runtime events, approvals, execution results, scheduled tasks |
| Lifecycle | Conversation-scoped | Goal-scoped, across conversations and days |
| Output | User-facing expression | Plans, decisions, deliveries |

Crammed into one Agent, these rows fight each other. What the split buys: GoalAgent gets an independent context, the Runtime can wake it proactively, and any conversation can pick up the same objective (conversations are derived from `goal_id`, independent of the chat window).

The cost is that the two do not share full context, and what the user sees depends entirely on the quality of the structured delivery and that summary. So the quality of delivery summaries is something the product is responsible for — a badly written summary leaves the user staring at empty words like "some issues were found."

One more reminder: **execution status is not Goal status**. A failed call does not fail the objective, and a successful one does not complete it. When an objective ends is decided by the user and GoalAgent.

Next, see [Layer attribution and iteration playbook](/projects/call-e/iteration-playbook): which layer a bad case should be fixed in, and how a complete iteration runs.
