---
title: "Stop asking your agent to “implement and test” in one go: Matt Pocock's Skills split it into five steps"
summary: "A single “implement this feature and test it” prompt tends to make coding agents misread requirements, expand scope, and write tests after the fact. Matt Pocock's Skills break development into grill, spec, tickets, TDD implementation, and code-review, stopping for human confirmation after each step. This post collects the prompts, completion criteria, and trade-offs for each step."
---

Hand a coding agent "implement this feature and test it," and it usually starts writing code right away. The business rules haven't been pinned down, the tests get written after the feature, and the review can only check whether those tests pass, not whether the code matches the original requirement.

Matt Pocock's [`mattpocock/skills`](https://github.com/mattpocock/skills) takes a different approach. It breaks that one big prompt into five steps (grill, spec, tickets, implement + TDD, and code-review), gives each step its own Skill, and stops at the end of each one for a human to confirm before moving on. Two more Skills handle bug diagnosis and architecture cleanup.

These Skills are not a heavyweight framework you have to adopt wholesale, and they don't replace product judgment, technical design, or human review. I find it more useful to think of them as a set of working procedures: each Skill owns one stage, and the developer still decides requirements, priorities, architectural trade-offs, and whether anything gets merged.

This post follows a team workflow and notes what changes for a solo developer committing directly to `main`. It applies to any coding agent with Skill support, such as Codex and Claude Code.

## Why one big prompt lets an agent drift

Asking for "implement and test" in a single request commonly leads to:

- **Misunderstood requirements**: the agent starts coding before key business rules are confirmed.
- **Scope creep**: the implementation adds features, abstractions, or refactors the Spec never asked for.
- **Tasks that are too large**: requirements, design, code, and tests compete for one context and drift out of sync.
- **Late tests**: tests written after the feature tend to mirror the implementation instead of checking the requirement.
- **Brittle tests**: tests that target private functions, call counts, or internal structure break under ordinary refactoring.
- **Blind bug fixing**: repeated edits without a stable reproduction can hide symptoms or introduce new bugs.
- **Review without a baseline**: the review checks whether tests pass, not whether the code satisfies the original requirement.

The workflow answers this with staged control. Reach a shared understanding first, then write it down as a Spec. Split large work into vertical Tickets that can each be verified on their own. Use TDD during implementation for fast feedback. Finally, review requirement compliance and code quality separately.

## Five stages, each answering one question

| Stage | Skill | Question it answers | Main output |
|---|---|---|---|
| grill | `/grill-with-docs` | Do we actually understand the problem? | Confirmed rules, boundaries, terminology, and decisions |
| spec | `/to-spec` | How do we turn the discussion into a stable, reviewable baseline? | Spec / PRD, acceptance criteria, test seams |
| tickets | `/to-tickets` | How do we split a large requirement into independently deliverable work? | Vertically sliced Tickets and their dependencies |
| implement + TDD | `/implement` + `/tdd` | How do we implement correctly with continuous feedback? | Code, behavioral tests, verification results |
| review | `/code-review` | Does the implementation meet the requirement and the quality bar? | Spec and Standards review results |

Two more Skills sit off the main path and are used as needed:

| Situation | Skill | Main output |
|---|---|---|
| A bug or performance regression with no obvious cause | `/diagnosing-bugs` | Stable reproduction, root cause, regression test, minimal fix |
| The feature works, but the code structure is degrading | `/improve-codebase-architecture` | Architecture findings and candidate improvements |

The main path looks like this:

```text
Requirement
  ↓
grill
  ↓
spec
  ↓
tickets
  ↓
implement + TDD
  ↓
review
  ↓
PR / merge / release
```

A handful of principles run through every stage:

- Settle requirements, boundaries, and acceptance criteria before writing code.
- Settle the test seams before implementing.
- Split medium and large requirements into vertical Tickets that can be verified independently.
- Implement one observable behavior at a time.
- When done, check both "does it match the Spec?" and "is the code quality acceptable?"
- When a bug's cause is unclear, get a stable reproduction before changing anything.

Before using these Skills in a repository for the first time, run `/setup-matt-pocock-skills` once. It configures where issues are tracked, the triage labels, and where domain docs such as `CONTEXT.md` and ADRs live. The other Skills rely on those conventions.

## Small changes don't need all five steps

New features, extensions to existing features, bug fixes, performance regressions, changes spanning several modules or both front end and back end, and projects where an agent does most of the work and scope needs tight control all benefit from the full workflow.

Copy edits, simple configuration updates, and obvious one- or two-line fixes don't need the full sequence. Shorten it to:

```text
spec → implement/TDD → review
```

When both the problem and the change are completely clear, shorter still:

```text
implement → targeted tests → review
```

Different sizes of work combine the steps roughly like this:

| Situation | Workflow |
|---|---|
| Small change | grill → spec → implement + TDD → review |
| Medium or large feature | grill → spec → tickets → implement + TDD one Ticket at a time → review → PR |
| Several people in parallel | grill → spec → tickets (with blocking edges) → parallel feature branches → code-review on each branch → separate PRs + CI → merge in dependency order |
| A bug appears | diagnosing-bugs → regression test → minimal fix → full test suite → review |
| Restructuring an existing feature | code-review → improve-codebase-architecture → pick one improvement → spec → tickets → implement + TDD → review |

## Teams use feature branches; solo developers record a starting point on main

Team and solo development differ only in the Git workflow. The grill → spec → tickets → implement/TDD → review path stays the same. What changes is the starting point `/code-review` compares against.

### Team development: feature branch + PR

Start a feature branch from the latest main branch:

```bash
git switch main
git pull
git switch -c feature/order-cancellation
```

When the work is done, run:

```text
/code-review main
```

It reviews the changes on the current feature branch since its merge base with `main`. The full flow:

```text
main
  ↓ create a feature branch
feature/...
  ↓ implement and test
code-review main
  ↓ fix issues
push
  ↓
create PR
  ↓ CI + human review
merge into main
```

### Solo development: commit directly to main

A solo project doesn't have to use feature branches. If you develop directly on `main`, record the current commit before starting a new feature:

```bash
git rev-parse HEAD
```

If that prints `a1b2c3d`, run this when the feature is done:

```text
/code-review a1b2c3d
```

You can also mark the starting point with a local tag:

```bash
git tag review/order-cancel-start
```

When development is complete:

```text
/code-review review/order-cancel-start
```

Delete the tag after the review:

```bash
git tag -d review/order-cancel-start
```

## grill: pin down the business rules before any code

This step uses interview-style questioning to confirm the user problem and expected behavior, business rules, permission rules, edge cases, error handling, data and interface impact, technical constraints, acceptance criteria, test boundaries, and what is out of scope.

```text
/grill-with-docs

Please clarify the following requirement:

<insert requirement>

Focus on confirming:
- User scenarios and expected behavior
- Business rules and edge cases
- Permissions and error handling
- Technical constraints
- Acceptance criteria
- Test seams
- Out of Scope

At this stage, only clarify requirements and make necessary updates to project documentation; do not modify business code.
After confirmation is complete, output a summary and stop. Wait for me to run /to-spec.
```

The last two lines matter. Without an explicit "stop," the agent will often finish its questions and start coding anyway.

Before moving on, you should be able to answer:

- When does the operation succeed, and when does it fail?
- What result can the user ultimately observe?
- How are errors expressed and handled?
- Which behaviors must be covered by automated tests?
- What is explicitly out of scope?

## spec: write the discussion down as a reviewable baseline

This step turns the confirmed discussion into the shared reference for development, testing, and review.

```text
/to-spec

Generate a formal Spec based on the requirements we just confirmed.

It must include:
- Problem Statement
- Solution
- User Stories
- Business Rules
- Implementation Decisions
- Testing Decisions
- Acceptance Criteria
- Out of Scope
- Known risks

Define the test seams explicitly. Test only public behavior, not private implementation.
At this stage, only create or update the Spec; do not modify business code.
Stop when finished and wait for my review.
```

A Spec needs at least these sections:

```markdown
## Problem Statement
The problem the user currently has.

## Solution
The user experience and system behavior once the feature is done.

## User Stories
1. As a ...
2. As a ...

## Business Rules
- Rule one
- Rule two

## Implementation Decisions
- Module and interface decisions
- State transitions
- API, schema, or permission handling

## Testing Decisions
- Test seams
- Happy paths
- Error cases
- Edge cases

## Acceptance Criteria
- [ ] Condition one
- [ ] Condition two

## Out of Scope
- What this change will not do
```

For a small change, go straight from the Spec to implementation. For medium and large features, split into Tickets first.

## tickets: slice vertically by user behavior, not by technical layer

Splitting into Tickets pays off when the feature spans several modules, doesn't fit in one agent context, has several independently verifiable behaviors, needs several people or agents working in parallel, or has clear dependencies between tasks.

```text
/to-tickets <Spec path, Issue, or URL>

Decompose the Spec into vertical slices that can be implemented and verified independently.

Requirements:
- Each Ticket delivers one complete user behavior
- Each Ticket can be completed in a fresh context
- Each Ticket includes acceptance criteria
- Mark Blocked by relationships
- Do not divide work horizontally into database, back end, front end, and tests
- Keep tests in the same Ticket as the corresponding functionality

Show the proposed decomposition first and publish only after confirmation.
Stop after publishing; do not start implementation automatically.
```

With a horizontal split by layer, no single Ticket delivers a behavior anyone can verify:

```text
Ticket 1: Modify the database
Ticket 2: Implement the back end
Ticket 3: Implement the front end
Ticket 4: Add tests
```

A vertical split ties every Ticket to a result the user can observe:

```text
Ticket 1: The user can complete the core operation
Ticket 2: Permissions and invalid states are handled correctly
Ticket 3: The operation supports idempotency or concurrency protection
Ticket 4: The front end provides a complete entry point and result feedback
```

Each Ticket should contain the code, tests, and any documentation needed for that behavior.

For parallel team work, also keep in mind:

- Only start a Ticket with no unfinished blockers.
- Avoid having several Tickets edit the same files at once.
- Settle shared cross-module interfaces in the Spec or an ADR first.
- One branch and one PR per Ticket makes review easier.
- When several parallel Tickets depend on the same groundwork, create a separate prefactoring Ticket for it first.

## implement + TDD: turn one test green at a time

```text
/implement <Ticket URL, number, or path>

Implement only the current Ticket.

Requirements:
- Read the Ticket, parent Spec, CONTEXT.md, and relevant ADRs
- Use the test seams confirmed in the Spec
- Use TDD: red → green
- Implement only one observable behavior at a time
- Do not test private functions or internal call counts
- Do not add functionality outside the Ticket
- Run targeted tests and typecheck regularly

When implementation is complete, run:
1. Targeted tests for the current Ticket
2. Related tests
3. The complete test suite
4. typecheck
5. lint
6. build

Then run /code-review and report the results.
```

The TDD loop itself is simple:

```text
Choose one behavior
  ↓
Write a failing test first
  ↓
Confirm that the test fails for the correct reason
  ↓
Write the minimum implementation
  ↓
Test passes
  ↓
Move to the next behavior
```

For an operation with permission and state rules:

```text
Test 1: An authorized user can perform the operation → minimum code → green
Test 2: An unauthorized user is rejected → add the permission check → green
Test 3: An invalid state is rejected → add the state rule → green
Test 4: Repeated operations remain idempotent → add idempotency protection → green
```

"Confirm that the test fails for the correct reason" is the step that gets skipped. If a test fails because a function name was misspelled, watching it turn green later proves nothing.

Test public behavior first:

```text
Calling the API returns the correct result
The user completes the operation through the UI
System state changes correctly through the real public flow
An invalid request returns the correct error
```

Avoid testing implementation details:

```text
Whether a private function was called
Whether a Repository method was called once
The order of internal function calls
The intermediate state of a private field
```

This step is done when all of the Ticket's acceptance criteria are met; the tests failed before they passed; targeted tests, related tests, and the full suite pass; typecheck, lint, and build pass; and no debug logging, temporary code, or unrelated changes remain.

## code-review: check against the Spec and the project standards separately

`/code-review` checks the implemented code along two axes:

1. **Spec Review**: is the requirement implemented correctly and completely?
2. **Standards Review**: does the code follow the project's conventions and sensible design principles?

For team development:

```text
/code-review main

Review all changes on the current feature branch relative to main.

Focus on:
- Whether the implementation fully satisfies the Spec
- Whether edge cases were missed
- Whether there is Scope Creep
- Whether tests verify real external behavior
- Whether duplicated code exists
- Whether there is excessive abstraction
- Whether module boundaries are reasonable
- Whether there are obvious code smells

Report issues first; do not modify the code immediately.
```

When developing solo on `main`, replace `main` with the commit SHA or tag recorded before the feature started. The review then covers everything from that fixed point to the current HEAD, with the same focus list.

"Report issues first; do not modify the code immediately" gives a human the chance to decide which findings actually hold. Once that's settled, have the agent fix them:

```text
Fix the confirmed valid issues from code-review.

After fixing them, rerun:
- Targeted tests
- Related tests
- The complete test suite
- typecheck
- lint
- build

Then run /code-review <original fixed point> again.
```

## diagnosing-bugs: get a stable reproduction before changing code

Switch to this Skill when behavior is wrong, a test fails for unclear reasons, CI fails but local runs pass, a bug is intermittent, there's a concurrency or timing issue, performance drops noticeably, fixing one place breaks another, or the agent starts guessing and making random edits.

```text
/diagnosing-bugs

Problem description:
<specific symptom>

Reproduction steps or failing command:
<command, error message, or interaction path>

First establish a stable, minimal failure feedback loop. Do not guess at the cause directly.

Then:
1. Reproduce consistently
2. Minimize the reproduction
3. Form falsifiable hypotheses
4. Test them one at a time
5. Add a regression test at the correct seam
6. Apply the minimal fix
7. Rerun the original reproduction and the complete test suite
```

The diagnostic process runs roughly:

```text
Establish a stable failure signal
  ↓
Minimize the reproduction
  ↓
Form 3–5 hypotheses
  ↓
Verify them with logs, a debugger, or experiments
  ↓
Write the regression test first
  ↓
Apply the minimal fix
  ↓
Rerun the original reproduction
  ↓
Run the complete test suite
  ↓
code-review
```

Rule these out explicitly:

- Changing code without a stable reproduction.
- Changing several variables at once.
- Deleting tests to make a failure go away.
- Skipping tests or loosening assertions to make a failure go away.
- Confirming only that "there's no error" without checking the symptom the user actually saw.
- Fixing the bug without adding a regression test.

## When it works but the structure is degrading: improve-codebase-architecture

When a feature has shipped but the code gets messier with each change, start with `/code-review` for requirement coverage and tests, then use this Skill for structure:

```text
/improve-codebase-architecture

Inspect the code structure related to <feature name or module>.

Look especially for:
- Unclear module boundaries
- Scattered business logic
- Excessive coupling
- Changes that ripple widely
- Designs that are hard to test
- Opportunities to form deep modules

Produce analysis and candidate improvements first; do not perform a large-scale refactor directly.
```

For any improvement you pick, go through spec → tickets → implement/TDD → review again. A large refactor with no Spec, acceptance criteria, or regression tests carries about the same risk as a big PR nobody reviewed.

## What this workflow costs

Staging buys control, and it has real costs:

- **More turns and more time.** Every stage stops for confirmation, so a small feature can take several round trips. When the requirement is already clear, those pauses are mostly overhead, which is why the workflow should be trimmed to fit the change.
- **A human has to be present.** Someone has to answer the grill questions and review the Spec and Tickets. If every output just gets approved, the process is ceremony.
- **The docs need upkeep.** `CONTEXT.md`, ADRs, and Specs go stale as requirements change, and stale docs steer the agent the wrong way.
- **Skills are prompts, not enforcement.** An agent can still skip "confirm the test fails first" or add a feature during implementation. The "stop" and "implement only the current Ticket" instructions in the prompts, plus the final review, are the backstop.

## Pre-merge checklist

```text
[ ] The requirement has been clarified through grill
[ ] There is a clear Spec with observable, testable acceptance criteria
[ ] Medium and large features are split into vertical Tickets with clear dependencies
[ ] Each behavior was implemented with TDD, and its test failed first
[ ] No tests target private implementation details
[ ] Targeted tests, related tests, and the full test suite pass
[ ] typecheck, lint, and build pass
[ ] code-review has run, with no blocking Spec Review or Standards Review issues
[ ] Bug fixes include regression tests
[ ] No debug logging or temporary code remains
[ ] For team projects: CI and human review are done, the PR description matches the changes, and no review comments are unresolved
```

## Try it on one small requirement first

There's no need to start with the full workflow on a big feature. Pick a real but small requirement, such as adding one validation rule to an existing endpoint, run `/setup-matt-pocock-skills`, and go through grill → spec → implement + TDD → code-review once.

Afterward, compare the result with what you used to get from asking the agent to "implement and test." Which edge cases did grill surface that you hadn't thought of? Did the Spec Review catch anything that drifted from the requirement? That comparison will tell you more about whether these Skills belong in your project than any description of the process. Full documentation for each Skill is in [`mattpocock/skills`](https://github.com/mattpocock/skills).
