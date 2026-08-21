---
title: "From \"Make a Call\" to \"Keep Completing a Goal\""
summary: "Defining the product object of CALL-E Agentic: what a Goal is, why one-shot cannot hold it, and the four user-experience boundaries the system must defend."
---

This page is organized from the knowledge-transfer document `docs/calle-agentic-knowledge-transfer.md` in GitLab `services/seleven-mcp` (fact baseline 2026-08-12) and is the entry point for understanding the CALL-E Agentic product model. Code-level implementation details remain governed by the source-audit pages.

CALL-E Agentic is not about letting one Agent autonomously make a batch of calls. It is about letting the system continuously own and advance a user objective inside boundaries that are controllable, recoverable, and auditable.

## 1. What the user wants is not a call — it is a Goal actually getting done

A Goal is the object the system stays responsible for advancing, recording, and explaining — not the act of "making one call," and not a guarantee that the objective will be achieved.

When a user says "book me a table for Friday at 7pm," the Goal is "the restaurant has a table Friday at 7pm," not "make one phone call." When the booking fails, what the user wants is "figure something out and keep me posted." Of course, CALL-E may also run out of good ideas when the booking fails — it cannot open a resale marketplace and find a scalper to hold a table. So what is promised is **best-effort advancement and honest reporting**, not a guaranteed reservation.

## 2. The runtime that four "just add a feature" requests led to

This decision did not start from an architecture diagram. It started from a series of "should we add one more feature to one-shot call" discussions:

| Desired feature | Its natural home in Agentic |
|---|---|
| Playbook (call operation manuals by caller / taxonomy) | Skill — today there are 7 across outbound, inbound, and collection; the collection one was added by adding one Skill directory, without touching the Runtime |
| Knowledge retrieval (refund policy, price list, FAQ; upload and use) | Artifact — just tell the Agent "the user uploaded these"; it reads them when needed |
| History (who the last call reached, what they said, which time slots were tried) | Goal Event / Run / Evidence — only references are carried on wake-up; storage already works, query-on-demand is still a draft |
| Memory (user preferences; said once, should not be asked again) | Attached to the user rather than to a single Goal; scoping and invalidation policy undecided; not one line built so far |

Individually, all four look like "just a feature." Taken together, they raise the same set of questions: where is it stored? Who decides which one to use this time? How do you stay consistent across multiple invocations? Where do you resume after a mid-flight crash? And the very definition of a one-shot call is "a stateless single invocation" — to fit these four things in, you first have to give it an owner, durable state, a scheduler, and a recovery mechanism. Once you have done all that, it is no longer one-shot; it is just an agent that has not admitted it is one.

Rather than patching a single invocation feature by feature, build a runtime that owns these things from the start. That is today's CALL-E Agentic: single-execution outbound calls and long-task Goals both run on the same Goal Runtime.

## 3. Terminology alignment: which "CALL-E" we mean

- **CALL-E v1 (Legacy One-shot)** — the old stateless implementation, a fixed pipeline of 3 cascaded pydantic-ai agents: planner sets the plan → prompt generator writes the script → run summary wraps up. Each stage hands off to the next and stops when done.
- **CALL-E** — today's agentic CALL-E, driven by the OpenAI Agents SDK, code in `calle/agentic`. Every occurrence of "CALL-E" in this site's documentation means this one.
- **Single-run Outbound Goal** — a Goal in the current Runtime that ends after one execution. It is a kind of Goal, not a leftover of v1.

The ability to finish a call in one attempt was not replaced; it was absorbed. Today it is one kind of RunSpec and Run inside the Goal Runtime, produced by outbound-planner and voice-agent-run-strategy, sharing the same approval, recovery, and evidence mechanisms as long tasks. The v1 standalone pipeline no longer exists as an independent product model. Build the right runtime, and the original capability becomes a subset of it without a rewrite.

## 4. The four user-experience boundaries that must hold

These four are product promises and also the criteria for every evaluation case — for each case you write, you must be able to say which one it verifies. Each is backed by a concrete mechanism, so "which boundary was broken" is something you can point to, not a matter of feeling.

1. **The status the system reports is true.** Goal saved → plan prepared → plan validated → action approved → call executed → result confirmed → goal completed: these seven states must never stand in for one another. Counterexample: describing "Goal created" as "everything is arranged," or "simulation passed" as "the call succeeded."
2. **The user knows what the system will do next.** Before a real call or hotline binding, the user must know what will be executed, against whom, with which version, how many actions one authorization covers, and how to stop it. Counterexample: having another Agent paraphrase the action to be approved in natural language.
3. **The system does not disappear.** During a long task, the user must be able to see which step it is on, what is done, what it is waiting for, why it needs my input, and when it will continue. Counterexample: the model thinks for three minutes and the interface shows nothing.
4. **Failure does not mean starting over.** A model error, a process restart, a failed call, or the user stepping away must never lose a confirmed Goal, plan, or evidence. Counterexample: "That call did not go through — could you tell me the restaurant and time again?"

All four are observable behaviors that can be written as test cases — that is the precondition for using them as criteria. CALL-E does not promise things that cannot be verified, like "smarter" or "more natural"; there is currently no externally citable quantitative baseline either, so any effectiveness number must first establish a baseline.

## 5. What it costs to honor these four

Today's CALL-E contains one Goal Runtime, 3 long-running Agents, 1 isolated Judge, and two main product paths, Outbound and Inbound; only two protected actions can directly trigger a real call or hotline binding. Honoring the four promises has a price:

- Even a simple outbound call goes through the full chain, so first response is slower than v1;
- Facts live in durable state, so reading them takes one extra hop, and Skills must be written stateless and re-read every time;
- MainAgent cannot see GoalAgent's reasoning and relies on one bounded summary; cross-Agent debugging means stitching event streams together;
- Simulation judges any case with incomplete evidence as "uncertain," which blocks some users who would actually have been fine.

Why these costs were accepted, what was not chosen at the time, and under what conditions they should be re-evaluated are worked through from an engineering perspective in [Technical architecture and framework trade-offs](/projects/call-e/technical-architecture).

Next, continue to the [three canonical product journeys](/projects/call-e/product-journeys) to see how interactive Outbound, Published Goal, and Inbound Hotline diverge on the same backbone.
