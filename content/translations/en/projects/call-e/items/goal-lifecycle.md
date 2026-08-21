---
title: "The Goal Lifecycle: Developer Journey PRD"
summary: "The complete developer flow from creating a Goal through Simulation, Live Test, real call testing, API integration, and post-production continuous improvement, with the P0–P3 task breakdown and acceptance criteria."
---

This page is organized from the PRD "CALL-E | The Goal Lifecycle" (2026-08-13). It describes the **target product experience** — the complete developer-perspective journey of a Goal from creation to production iteration. The current implementation status of each item is governed by the [development status page](/projects/call-e/development-plan); where the two disagree, do not cite the PRD as delivered capability.

## 0. Overview: a loop, not a straight line

```text
Create Goal → Goal Created
  → Choose Next Step (returned to after every Goal Updated)
      → System Test (Simulation) | Live Test (Conversation)
        | Real Call Test (Phone Call) | API Integration
  → Analyze Result / Find Issues → Goal Updated
  → back to Choose Next Step
```

Key design: validation is not a one-time gate but a loop of "test → find issues → update Goal → choose the next step again." The system recommends the next step based on the current validation status, but the developer can always pick a different one.

## 1. Creation entry points

Three entry points: the [Create a goal] button on the Goal page, the `/create goal` command, and the goal icon. The default guidance copy makes an explicit promise about the flow: "CALL-E will simulate calls, find potential issues, and guide you through improvements until your goal is ready to run."

## 2. Step 1: Create the Goal

**1-1 User-initiated creation.** The user describes the task in natural language (for example, "handle customer calls and help them with their requests"). Instead of creating a Goal from a single restated sentence, the system first enters **Goal Understanding**: it shows the understood Goal name and lists the key gap questions that affect call quality — who is calling in? What should happen after the call ends? Which systems can CALL-E access (order system, CRM, human agents)? Then it offers the user two actions: [Create initial Goal] / [Help me define it].

The creation receipt contains name, goal, and assumptions, and explicitly states "**No validation has been run yet**", followed by a status-aware recommendation: Step 1 — Simulation Test, while keeping [Choose another step] and [View API Integration] available. This matches the experience boundary "the status the system reports is true": created means created, not "ready to use."

**1-2 System-recommended creation from context.** When the same task recurs in a conversation ("call this customer to confirm whether they can receive the delivery today" → "ask the next customer the same thing" → "same for these three customers"), the system proactively recognizes the repeated pattern, suggests distilling it into a reusable Goal, and generates a Draft from the context: name, goal, a behavior list, and result fields (for example `customer_reached`, `can_receive_today`, `preferred_receiving_time`, `notes`). Nothing is persisted until the user confirms [Create Goal] / [Edit before creating] / [Cancel].

Disturbance control is an explicit requirement: after the user chooses [Continue manually], the current session is not prompted again; after [Not now], the system may re-evaluate after a few more calls and prompt again if the repeated pattern remains clear.

## 3. Step 2: Simulation Test (system self-test)

A low-cost self-test that makes no real calls. Based on the Goal, the system designs tests along four dimensions:

1. **Core scenarios** — can the main task be completed;
2. **Common variations** — can different customer requests be handled;
3. **Edge cases** — what happens with unexpected questions;
4. **Missing information** — what information or rules are still missing to complete the task.

Each generated test case carries the customer's original words and the validation objective; execution results are marked pass / needs improvement. When a problem is found, the system does not change anything automatically — it hands the decision to the user, for example: "how should order-status queries be handled: 1. ask for the order number and record it 2. connect to the order system 3. escalate to a human 4. add another instruction." After the user chooses, the new behavior is written back to the Goal, and the next recommended step is Live Conversation Test, with the explicit note that "you will not be asked to restart from Simulation unless you choose to re-run it for the new boundary scenarios."

## 4. Step 3: Live Conversation Test

Talk to the Goal directly in the browser to experience its real responses — **no phone call is made**. Afterwards the system analyzes the transcript, points out problems ("the customer asked for information the current Goal does not cover"), explains the impact ("the conversation may stall or require human support"), and offers optional fixes: record and follow up / connect more information sources / escalate to a human / custom rule. After the user chooses, the Goal is updated and Real Phone Call Test is recommended, while still allowing another Live Test round first to verify a specific scenario.

## 5. Step 4: Real Phone Call Test

Real phone calls validate the complete experience — the opening, voice performance, user follow-up questions, and result structuring. After each call, the system proactively reports the issues it found and offers optional fixes:

- First call: the customer asks "which company is this?" "what is being delivered?" → add a company introduction and a statement of purpose;
- Second call: the customer asks "when will the driver arrive?" → choose "collect the customer's available receiving time" rather than making an unsupported promise;
- Third call: the customer cannot receive the delivery → the system finds the results hard to track and suggests structured outcome categories (examples: `DISPONIVEL_AGORA`, `NAO_CONSEGUE_RECEBER`, `SEM_ATENDIMENTO`, etc.).

Every call uses the latest Goal. Once multiple calls run stably, the system aggregates an improvement list (company introduction, receive-availability confirmation, receiving-time collection, question handling, structured results), and the user confirms [Update Goal] to write it back in one pass. API Integration is recommended afterwards, while further testing remains available to build confidence.

## 6. Step 5: API Integration

Once the Goal is validated and stable, the developer can integrate it into their own system. Each invocation only needs to supply the dynamic information; the conversation logic and the accumulated improvements are managed by the Goal:

```text
POST /v1/calls
{
  "goal_id": "customer_support_assistant",
  "recipient": { "phone": "+1234567890" },
  "context": { "customer_name": "John", "order_id": "12345" }
}
```

Results are returned as a structured schema (`status`, `result.customer_intent`, `resolved`, `follow_up_required`, etc.), with configurable result format, webhook notifications, call triggers, and batch calling.

Note: this state corresponds to the Published Goal path in the knowledge-transfer document — the external contract (the `goal-runs-developer-api-sdk` and related specs) was still Draft as of 2026-08-12. The PRD describes the delivery target; it does not mean the API is frozen.

## 7. Step 6: Post-production iteration and continuous improvement

Going live is not the finish line. The system continuously analyzes production calls and detects repeated patterns (example: "34 customers asked about delivery arrival time; the current Goal does not define how to answer; 21 calls needed human follow-up"), and shows an "Improvement available" notice on the Goal Detail page instead of repeatedly interrupting the conversation.

Clicking [Review suggestion] brings the user back to the Conversation page: the system explains the pattern it found, the gap in current behavior, and the suggested new behavior ("explain the available information, make no unfounded delivery promises, collect a follow-up request when necessary"), and the user chooses [Apply update] / [Edit suggestion] / [Ignore]. Improvements always appear as draft candidates and never go live automatically — consistent with the Inbound periodic review governance of "off by default, producing draft candidates."

## 8. Status-aware Next Step recommendation

The system maintains a validation status for each Goal, and recommendations follow the context rather than mechanically starting over: untested → Simulation; Simulation done → Live Test; Live Test done → Real Phone Call; real calls stable → API Integration. [Choose another step] stays available at every step. This rule runs through the whole chain and is a P1 requirement.

## 9. Task breakdown and priorities

| Priority | Task | Product goal | Acceptance criteria (summary) | Corresponding step |
|---|---|---|---|---|
| P0 | Goal creation entry points and basic creation flow | Start natural-language creation from the Goal page, a command, or the input box | Generate a draft Goal and save name, goal, assumptions, status; enter the status-aware recommendation after creation | Step 1 |
| P0 | Goal Understanding stage | Prevent the AI from merely restating one user sentence; show understanding and gaps first | Before creation, must show the goal name, key gap questions, [Create initial Goal] / [Help me define it] | Step 1 / 1-1 |
| P1 | Status-aware Next Step recommendation | Recommendations fit the current context, no mechanical repetition | Maintain validation status; recommend the next step by validation progress; keep [Choose another step] | Whole chain |
| P1 | Simulation Test loop | Low-cost self-test that finds missing instructions and boundary scenarios | Generate test cases, run the simulation, mark pass / needs improvement, ask the user for decisions and write them back to the Goal | Step 2 |
| P1 | Goal updates and version write-back | Each test round's findings become reusable capability | Every update records its source, content, and affected test stages; recompute the recommended next step after updating | Steps 2–4 |
| P1 | Repeated-task detection and context-based Goal creation | Proactively distill recurring manual tasks into reusable Goals | Recognize repeated intent within a session; no more prompting this session after [Continue manually]; may re-evaluate after [Not now] | Step 1 / 1-2 |
| P2 | Real Phone Call Test loop | Validate the complete phone experience | Real calls use the latest Goal; issues found and optional fixes offered after each call; one consolidated Goal update once stable | Step 4 |
| P2 | Validation history and issue tracking | The developer knows why a Goal was updated and whether it is currently trustworthy | Goal detail shows each test stage's results, issues found, fixes adopted, and the current validation status | Steps 2–4 |
| P2 | Post-production Review trigger | Real production problems flow back as optimization suggestions | Detect repeated patterns; show Improvement available on the Goal page; return to Conversation for review / apply / edit / ignore | Step 6 |
| P2 | Advanced iteration strategy and disturbance control | Review and re-testing become a paced workflow | Trigger based on issue frequency, blast radius, and whether recently ignored; support snooze, ignore, and per-stage rerun | Step 6 / whole chain |
| P3 | Live Conversation Test loop | Experience the conversation in the browser without making calls | Enter a browser conversation; afterwards analyze the transcript, point out problems, offer optimization options, and update the Goal | Step 3 |
| P3 | API Integration delivery | Integration into developer systems after validation | Provide goal_id, dynamic context schema, Create Call API example, and result schema; entry points for webhook / trigger / batch configuration | Step 5 |
| P3 | Scaled integration enhancements | Support more complex production usage scenarios | Batch calling, number connection, custom result fields, Webhook retry, failure replay, Goal performance dashboard | Steps 5–6 |

## 10. Mapping to the product model

The PRD journey and the [three canonical product journeys](/projects/call-e/product-journeys) are two statements of the same skeleton: Simulation Test corresponds to "validate," Real Phone Call Test corresponds to interactive Outbound's protected real dialing, API Integration corresponds to the Published Goal publish contract, and post-production Review corresponds to periodic review. The difference is perspective: the PRD faces the developer's step-by-step operations and disturbance control, while the product journeys page faces who advances things inside the system and at which layer approval happens.

Next, see [Layer attribution and iteration playbook](/projects/call-e/iteration-playbook): when a PRD acceptance criterion is not met, which layer the problem should be fixed in.
