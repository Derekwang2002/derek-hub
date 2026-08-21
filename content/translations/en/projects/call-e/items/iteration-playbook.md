---
title: "Layer Attribution and Iteration Playbook"
summary: "Which layer a bad case should be fixed in — Instruction, Skill, Tool, Subagent, or Runtime — and the complete iteration discipline from problem localization to release."
---

This page is organized from chapters 5–8 of the knowledge-transfer document `docs/calle-agentic-knowledge-transfer.md` (baseline 2026-08-12) and the Product Authoring Playbook. Core principle: the product team can iterate the content layer on its own (Skills, non-Runtime Instructions, evaluation cases); anything touching persistence, side effects, approval, concurrency, or recovery requires joint work with engineering.

## 1. Vertical view: six layers of responsibility

| Layer | Question it answers | What goes in | What stays out | Who can change it |
|---|---|---|---|---|
| Instruction | The Agent's long-term stable behavioral boundaries | Role, principles, communication style, Skill routing, forbidden behaviors | Individual bad cases, retry counts, state machines | Product (except Runtime clauses) |
| Skill | How one domain task should be completed | Steps, judgment criteria, questioning strategy, examples, counterexamples, rubric | Persistent state, real side effects, secrets | Product-led |
| Tool | What action the system can safely execute | Input semantics, user-readable descriptions, business constraints | Pure text reasoning and domain methodology | Joint review |
| Subagent | Specialized judgment needing isolated context or permissions | Judgment criteria, output contract, evaluation samples | Not every model call should be a Subagent | Joint review |
| Runtime | Deterministic lifecycle and reliability | Business requirements and observable results | Open-ended semantic judgment | Engineering |
| Voice Agent | One low-latency real-time call | Conversation experience and real-time strategy | Long-term Goal lifecycle | Voice + Product |

## 2. Horizontal view: which layers an outcome crosses

Layers are vertical; user experience is horizontal. The question to ask is "which capabilities jointly shape this experience," not "how many Skills do we have."

- **Outbound (one-shot call & Published Goal)｜ MainAgent + OutboundGoalAgent**: Instructions are `root_orchestrator.md + goal/base.md + domain/outbound.md`; Skills are `outbound-planner`, `voice-agent-run-strategy`, `outbound-goal-authoring`, `one-shot-call-report`; Tools include `prepare_outbound_target`, `create_run_spec`, `run_simulation`, `submit_voice_run` ⚠, `commit_report`.
- **Inbound Hotline｜ MainAgent + InboundGoalAgent**: Skills are `inbound-planner`, `inbound-voice-run-strategy`; Tools include `upload_intake`, `create_run_spec`, `run_simulation`, `bind_hotline` ⚠.
- **Simulation｜ Runtime orchestration + three parties each with their own prompt**: no Skill. One rehearsal has three models present — the Voice Agent under test reads the candidate RunSpec, the persona caller reads `PERSONA_CALLER_INSTRUCTIONS`, and the Judge scores the result. The Runtime itself carries no prompt: orchestration, concurrency, retries, and conclusion aggregation are all deterministic code, and incomplete evidence is always judged "uncertain."
- **Persona｜ plays the person on the other end of the line during rehearsal**: data in `simulation/data/builtin_personas.yaml`, 8 built-in (cooperative, busy and impatient, hard of understanding, suspicious and refusing, wrong number, voicemail gatekeeper, not interested, distracted), with custom personas supported. Which difficult situations rehearsal covers depends entirely on this list — one of the places product should touch most.
- **CallOutcomeJudge｜ Subagent**: its own separate Instruction, no Skill, no Tool, no session, no state changes. Two modes: scoring single scenarios for Simulation, and scoring completed real calls for periodic review. It judges only individual items; it does not decide overall pass/fail.
- **Collection (built for the demo)｜ MainAgent + OutboundGoalAgent**: uses the Outbound Instructions, Skill is `collection-strategy`, supports one approved real verification call; no publishing, no batch outbound.

⚠ = protected action; explicit user approval is required before execution.

Simulation and Judge are listed separately because their boundaries are frequently confused: orchestration, retries, and the final conclusion belong to the Runtime, semantic judgment belongs to the Judge — the Judge scores every scenario, and the Runtime decides whether the batch passes. Capabilities do not have to map one-to-one to components; there is no need to invent a SimulationSkill or SimulationAgent just to make the names tidy.

## 3. Attributing failures

Most rework happens not because the wrong content was changed, but because the problem was defined wrong at the start. When a bad case arrives, attribute it first:

- The model never received a key fact → **Runtime context assembly / durable state**. This one is most often misjudged as an Instruction problem; always rule it out first.
- The model knew what to do but did not do it → **Instruction**.
- The model does not know how this domain works → **Skill** (stuffing it into the Instruction makes the main prompt grow forever).
- The model cannot reach an external system or cannot execute the action → **Tool** (do not wrap pure text reasoning as a Tool either).
- The judgment needs isolated context or permissions → **Subagent** (do not split out a single inference just to look rigorous).
- Ordering, counts, concurrency, retries, or recovery went wrong → **Runtime** (do not write "please retry three times" in an Instruction).
- Interruption, latency, ASR / TTS problems → **Voice Runtime** (do not go edit the script).
- The status the user sees is inaccurate or hard to understand → **Delivery contract / product expression** (do not go tweak prompt wording).

**Current state first: there is no evaluation tooling yet.** Under `src/calle/agentic/evals/` today there are only fixtures for unit tests — no runner, and no golden set for any domain; "domain evaluation" and "journey testing" are currently all done manually. Simulation cannot substitute: it catches semantic problems in one candidate before launch, not regressions after a change. So the gates described in this chapter are gates to be built, not processes that can run today.

## 4. Change discipline

**Change only one layer at a time.** Whichever layer is located, change only that layer — no opportunistic fallbacks. "Add an Instruction to hold the line, refactor later" is not allowed: once a temporary rule enters an Instruction it is hard to remove, because nobody can prove removal is safe. Better to let the bad case live one more day than to leave permanent debt in the wrong layer.

**Verify behavior, not wording.** Do not verify: whether a sentence appears in the Instruction, whether the model used a fixed phrasing, whether a Tool appeared in the trace in the expected order. Do verify: whether only necessary questions were asked, whether key facts were missed, whether it stopped instead of guessing when information was insufficient, whether the correct Skill was selected, whether structured output is correct, whether the right authorization was requested before side effects, whether the correct artifacts and events were left behind, whether it recovered from existing facts after failure, whether the status the user sees is accurate.

**Every change needs at least four kinds of cases:**

1. **Normal** — proves the main path still succeeds. Example: a booking with complete information / a hotline launch with complete materials.
2. **Ambiguous** — proves the system follows up correctly. Example: "tomorrow evening" without a specific time / materials that do not state refund timing.
3. **Blocked or dangerous** — proves it neither guesses nor wrongly executes side effects. Example: an incorrectly formatted number still being asked to dial / a failed rehearsal still being asked to bind a hotline.
4. **Counterexamples and neighboring domains** — proves the new rule does not pollute other scenarios. Example: after changing Chinese replies, whether English users and simulated customers still get the right language.

The fourth kind is skipped most often and causes the most trouble. Instruction changes must come with neighboring-domain counterexamples: adding a rule that cures the case in front of you while breaking the neighboring scenario is the most common collateral damage.

**Simulation's boundary must be stated clearly at all times.** It can prove semantic correctness, script reasonableness, scenario coverage, whether it answers what it should not, and whether it escalates when it should; it cannot prove ASR, TTS, interruption, line quality, audio quality, or end-to-end latency. It is a pre-launch semantic gate, not Voice E2E proof — externally, "rehearsal passed" and "real-device passed" must never be conflated. Also, no single model Judge independently decides release: coverage and the final conclusion are aggregated by deterministic code; incomplete evidence, insufficient coverage, or Judge failure all result in "uncertain" and are blocked. Better to block wrongly than to release wrongly.

## 5. The complexity ladder: if you can stop on the left, do not move right

Unifying on the Agentic path means objectives are owned by Goals, not that all logic gets stuffed into a model loop. Inside the path you still climb the complexity ladder:

```text
Level 0 plain code → Level 1 one LLM call → Level 2 deterministic workflow
  → Level 3 single Agent Loop → Level 4 multi-Agent
```

Where CALL-E's own examples each stop:

- **Level 0** — Simulation's trial orchestration, coverage, and conclusion aggregation. Ordering, counts, and aggregation rules can be fixed in advance and must be reproducible; handing them to a model would only make release conclusions unstable.
- **Level 1** — Structuring a call result into a receipt (Materializer). Fixed input, schema-bound output, no tools and no multiple turns — one call is enough.
- **Level 2** — Goal scheduling, recovery, approval interruption, and resumption. This is reliability, not judgment; the model is not responsible for reliability.
- **Level 3** — GoalAgent advancing an objective. The path cannot be fixed in advance; dynamic decisions, tool use, and repeated correction are where an Agent Loop earns its place.
- **Level 4** — CallOutcomeJudge. The only exception: it needs context isolation and independent permissions, otherwise its judgment is contaminated by the object being judged.

Moving one rung right costs: harder to reproduce, harder to debug, more expensive, slower. If you cannot write down "why the rung on the left is not enough," stay on the left.

**Stop when you see these shapes:**

- Adding one Instruction per bad case → do attribution first;
- Creating a new Agent per domain action → first produce measured evidence of context contamination, permission isolation, or parallelism needs;
- Creating a Subagent for every structured inference → one structured-output inference is one inference;
- Wrapping pure text judgment as a Tool → a Tool needs one of: external I/O, persistent state transition, or an approval boundary;
- Managing retries, counts, and concurrency with prompts → hand it to the Runtime;
- Building a factory / registry / framework ahead of time for one caller → an abstraction needs two current callers;
- Adding the same guard repeatedly across multiple layers → if the guard only exists to contain an overly broad capability introduced by this change, the capability itself should be narrowed;
- Looking only at model output without verifying user-observable results → test by behavior;
- Maintaining a "Skill-building backlog" with no corresponding outcome → no outcome, no project.

Behind all these shapes is the same habit: treating the Instruction as the default repair location for every Agent problem. Adding a rule is the fastest fix and the hardest to delete — nobody can prove deletion is safe. Also, no components "for completeness": nothing gets built without a current caller, a current user outcome, and concrete incident evidence. "We might need it later" is not a reason.

## 6. The piece each person can push

In the end there are only two kinds of people: one makes the machine sturdier, one defines more precisely "what the machine should do." Neither side has to wait for the other to move first.

- **Those good at engineering** — keep the system trustworthy when the user is absent: durable state, events, scheduling, idempotency, recovery, permissions, Tool execution, approval boundaries, and the real-time call layer's ASR / TTS, turn-taking, and barge-in. The test is hard: after a crash, does it keep running; can the same action execute twice; was what got approved that exact action itself.
- **Those good at defining problems** — make the system do the right thing, and prove it did: user outcomes, journeys, Skill content, examples and counterexamples, acceptance criteria, bad-case attribution, golden sets and regression, and how this change actually moves the north-star metric. The test is: can you say which outcome this change serves, and can you produce evidence that it worked.

There is also a hat unrelated to job function: **Domain DRI** — who owns the rubric, versions, and effectiveness of a given Skill or Judge. People from either side can wear it, but today not one of the 7 Skills and 1 Judge has a wearer. No DRI means no rubric, no golden set, no release gate — and that directly decides which layer a bad case ends up being fixed in.

- **Product can push on its own**: domain methodology inside Skills, questioning strategy for blocking questions, examples and counterexamples, non-Runtime Instruction clauses, wording of user-facing status, evaluation cases, report content structure.
- **Must be reviewed jointly with engineering**: Tool schemas, new external side effects, approval granularity, durable state, RunSpec schema, Tool permissions, new Subagents, Runtime retry/concurrency/recovery, automatic redial or batch execution strategies.

This line does not restrict anyone; it makes "product iterates on its own" deliverable: product owns the content and evaluation loop, engineering guards the runtime boundaries, and neither side has to guess whether the other will touch the same spot.

## 7. Playbook template quick reference

**Skill template (eight sections; a missing section means it is not finished)**: name / description (decides when the model loads it — write trigger scenarios, not a feature list) → Outcome (the user-observable result, not internal artifacts) → When to use / not → Required inputs (must exist / may be derived / must not be guessed — three categories, kept separate) → Procedure (steps + executable judgment criteria) → Output contract (the meaning and trigger conditions of ready / needs-more / blocked) → Boundaries (what state it does not create, what side effects it does not execute, what it does not claim to have completed) → Examples (at least four: normal, ambiguous, blocked, counterexample) → Evaluation (where the golden cases live, judgment criteria, release gate). A Skill must never contain: persistent state, real side effects, secrets, claims like "I have already created / already sent," or demands on Runtime retries and concurrency.

**Instruction template (shorter beats longer)**: role → long-term objective (one sentence) → stable principles (a principle for which you cannot write "where it does not apply" is usually an exception in disguise) → Skill routing (the most valuable part of an Instruction) → Tool usage boundaries → communication rules → explicit prohibitions (each corresponding to a real risk). Before adding one, ask: does this hold across scenarios? Does it conflict with existing rules? Three months from now, if someone wants to delete it, can they prove deletion is safe?

**Bad-case triage card**: first, against the four experience promises, state clearly which one was broken; then fill in — what actually happened (the user's original words + what the system did + the objective at the time), what should have happened (one sentence that can be judged right or wrong), whether it is reproducible, preliminary attribution + reasoning, **did the model actually have this fact at the time** (answer this first, then discuss which layer to change), blast radius.

**Pre-release checklist**: the user-observable failure has been reproduced; attribution is done and only one layer was changed; all four case kinds are present, including neighboring-domain counterexamples; domain evaluation and journey tests pass; Tool permissions were not widened nor approval loosened just to pass tests; user-facing wording has been re-checked ("saved" was not called "completed," "rehearsal passed" was not called "succeeded"); anything touching side effects, durable state, or approval granularity has passed joint engineering review; observation metrics and rollback conditions are set.

Next, return to the engineering view: [Technical architecture and framework trade-offs](/projects/call-e/technical-architecture) explains why this product model lands on an explicit Python Runtime.
