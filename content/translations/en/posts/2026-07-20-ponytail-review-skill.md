---
title: "Ponytail Review Skill: Streamlining Redundant Code"
summary: "ponytail-review looks only for overengineering in the current diff and reports one-line deletion suggestions tagged delete, stdlib, native, yagni, or shrink. It belongs after a normal code review, not in place of one."
---

AI-generated code doesn't only go wrong by being incorrect. A lot of it is correct and unnecessary: a component library pulled in for one date input, a factory for an interface with a single implementation. The tests pass, and a normal review has nothing to flag.

[`ponytail-review`](https://github.com/DietrichGebert/ponytail/blob/16f29800fd2681bdf24f3eb4ccffe38be3baec6b/skills/ponytail-review/SKILL.md) exists for that second kind of problem. It asks one question:

> What in this diff does not need to exist at all?

It is an Agent Skill in the [`DietrichGebert/ponytail`](https://github.com/DietrichGebert/ponytail) project. It **does not check correctness, security, or performance**, and it does not modify code. It lists code that can be deleted, inlined, or replaced with something that already exists, and every suggestion has to name the replacement. Ponytail ships six Skills, and I think review is the easiest one to adopt as-is. The reasons are further down.

## Correct but unnecessary code slips past normal review

Say the requirement is a single date field on a form. An agent might deliver:

- A new third-party date-component dependency.
- A project wrapper component around it.
- A new stylesheet.
- Time-zone configuration added in advance.
- A generic interface abstracted for one caller.

All of this may compile, and the tests may pass. A conventional review focused on functionality and risk may not flag any of it.

The repository still now carries the cost of dependency upgrades, style compatibility, and understanding the abstractions, and it pays that cost on every future change.

`ponytail-review` treats overengineering as a review dimension of its own. Instead of asking whether the code works, it keeps asking:

- Does the requirement actually call for this capability?
- Does the repository already contain an implementation?
- Does the standard library already provide it?
- Does the browser, database, or operating system support it natively?
- Does this abstraction really have a second implementation?
- Can the same logic be expressed more directly?

This kind of review fits agent-generated diffs especially well. Humans usually write redundant code because they copied something under time pressure. Agents tend to add scaffolding, extension points, and explanatory wrappers because they are trying to look thorough. The causes differ, but the maintainer pays for both.

## Five tags: delete, stdlib, native, yagni, shrink

Every `ponytail-review` finding carries one of five tags. The tag forces the reviewer to say what kind of complexity this is and what replaces it once it's gone.

| Tag | What it looks for | Common replacement |
|---|---|---|
| `delete` | Dead code, unused flexibility, speculative features | Nothing |
| `stdlib` | Handwritten versions of standard-library capabilities | A specific standard-library function or type |
| `native` | Dependencies or custom code that duplicate platform features | Native browser, database, or OS functionality |
| `yagni` | Single-implementation interfaces, config nobody sets, single-caller layers | Inline it; abstract when a real need appears |
| `shrink` | Same logic, expressible much more briefly | A more direct equivalent |

The examples below are adapted from the ones in SKILL.md.

### `delete`: remove code with no real requirement behind it

```text
L52-71: delete: Retry wrapper around an idempotent local call. No replacement needed.
```

This category is not a mandate to strip every safeguard. It looks for mechanisms with no failure model behind them, branches that can never run, and features that "might be useful someday." A local call that is already idempotent and can't fail on a flaky network has nothing for a retry wrapper to protect against.

### `stdlib`: don't reimplement the standard library

```text
L12-38: stdlib: 27-line email validator class. "@" in email, one line; real validation is the confirmation email.
```

Standard-library code is usually shorter and much more widely tested. The goal isn't one-liners. It's not making the team own an implementation it never needed to write.

### `native`: use what the platform already provides

```text
date-picker.tsx:L4: native: Component library imported for one date input. Use <input type="date">, removing a dependency.
```

`native` is Ponytail's most distinctive category. Browser controls, CSS, database constraints, and OS features are often cheaper than rebuilding them in the application layer.

The native option does have to meet the product requirement. If the date picker needs interaction, formatting, or accessibility behavior the browser control lacks, saving a few lines is not a reason to swap it.

### `yagni`: don't design for the second requirement before it exists

```text
repo.py:L88: yagni: AbstractRepository has one implementation. Inline until a second appears.
```

Interfaces and factories aren't bad in themselves. The question is whether they handle variation that actually exists. With one implementation, one caller, and one parameter that never changes, the abstraction layer only lengthens the reading path.

### `shrink`: same logic, fewer lines

```text
L30-44: shrink: Hand-written loop builds a dict. Replace with dict(zip(keys, values)).
```

This is the category most easily abused as code golf. A good `shrink` cuts both line count and reading effort. If the shorter version makes readers stop and decode it, it isn't a simplification.

## Each finding gets one line, and that limit matters

`ponytail-review` requires a fixed format for every finding:

```text
<file>:L<line>: <tag> <what to remove>. <what replaces it>.
```

Multi-file diffs include the filename; single-file diffs can use just the line number. The review ends with one line estimating the possible reduction:

```text
net: -42 lines possible.
```

Treat that number as a hint; the actual code decides what changes. I also wouldn't turn it into a team KPI. Trading away readability or necessary safeguards to make the negative number bigger defeats the point of the Skill.

When nothing can be removed, it doesn't invent a problem to prove it did some work. It prints:

```text
Lean already. Ship.
```

The format avoids several habits of AI reviews. It has to point at specific lines instead of saying "the structure seems somewhat complex." It has to propose a replacement instead of voicing a preference. And the one-line limit squeezes out the hedging and preamble, so the author can judge each suggestion at a glance.

## What it doesn't check: "Lean already" is not "ready to ship"

How useful a narrow Skill is depends a lot on whether it knows its boundaries. `ponytail-review` explicitly excludes:

- Correctness bugs.
- Security vulnerabilities.
- Performance issues.
- Applying changes automatically.

Those belong in a normal code review. It also keeps minimal smoke tests and `assert`-based self-checks, and never flags them as bloat just because they add lines.

So `ponytail-review` can't be the only merge gate. A diff can get `Lean already. Ship.` and still contain SQL injection, a race condition, or completely wrong business logic. The verdict only means there's no obvious overengineering.

## Compared with the other five Ponytail Skills, review costs the least to adopt

The Ponytail repository currently provides six Skills. They share one philosophy, but their cost of use varies a lot.

### `ponytail`: constrain the whole coding process, all the time

The main Skill turns YAGNI, reuse of existing code, standard-library-first, and platform-native-first into a decision ladder with three intensity levels: `lite`, `full`, and `ultra`. The plugin can also inject rules into every conversation turn and sub-agent through lifecycle Hooks.

That can help a team that wants to enforce one agent coding style, but it isn't lightweight. Modes are stateful, there are environment variables and config files, and installation and injection differ across agents. Many projects only need a few core principles in `AGENTS.md`.

`ponytail-review` carries none of that. It runs once when you ask, ends after reading the diff, and leaves later sessions unchanged.

### `ponytail-audit`: extend the review to the whole repository

`ponytail-audit` scans the entire repository with the same tags and sorts findings by estimated deletion size. It suits a dedicated legacy cleanup, not a routine default.

Repository-wide code lacks the requirement boundary a diff has. An interface that looks single-implementation may serve external plugins; config that looks untouched may be overridden by the deployment system. The wider the scope, the less history the agent can see, and the more false positives a human has to check.

A diff usually has a clear requirement, author, and tests. Judging whether a new abstraction is unnecessary is far more reliable inside that boundary.

### `ponytail-debt`: a dedicated ledger for simplifications

`ponytail-debt` scans `ponytail:` comments and compiles deliberate simplifications, capability limits, and upgrade conditions into a list. If a project already tracks this with issues, TODOs, or tech-debt labels, a Ponytail-specific convention duplicates it.

`ponytail-review` needs no new comments or process. It reads the diff you already have.

### `ponytail-gain` and `ponytail-help`: not everything needs to be a Skill

`ponytail-help` is a command cheat sheet, which the README already covers. `ponytail-gain` is a fixed benchmark card that doesn't analyze the current repository.

The [`ponytail-gain` I looked at](https://github.com/DietrichGebert/ponytail/blob/16f29800fd2681bdf24f3eb4ccffe38be3baec6b/skills/ponytail-gain/SKILL.md) also still quotes the early single-turn experiment's "80–94% less code." The project's current [README](https://github.com/DietrichGebert/ponytail/blob/16f29800fd2681bdf24f3eb4ccffe38be3baec6b/README.md) acknowledges that the old baseline counted model explanations and alternatives, which inflated the gains. The updated real-agent experiments report averages of about 54% fewer lines of code, 20% lower cost, and 27% less time.

The benchmark report is worth reading. Freezing numbers that keep changing into a Skill costs more to maintain than it gives back.

That's the real difference between `ponytail-review` and the rest: it isn't a standing methodology, a governance protocol, a global scanner, or a promo page. It's a review tool with clear edges.

## Recommended workflow: run it as a second pass after normal review

The safe setup is two consecutive passes, not a replacement for normal review:

```text
Feature implementation complete
  ↓
Normal review: requirements, correctness, security, error handling, performance, tests
  ↓
ponytail-review: look only for removable complexity
  ↓
Human checks the suggestions and edits
  ↓
Run the tests again
```

It's most worth running when:

- An agent-generated diff is clearly bigger than the requirement suggested.
- The diff adds a dependency, interface, factory, Provider, Wrapper, or config layer.
- Something the browser, database, or standard library could handle was built as a custom system.
- The PR is correct and green, yet a maintainer still feels "a change this small shouldn't need this much code."

You can state the scope when invoking it:

```text
Use ponytail-review to inspect the current branch's diff against main.
Report only overengineering, do not check correctness, and do not modify code.
```

In Codex, after installing the full plugin, invoke `@ponytail-review`. Other agents with Skill support usually use `/ponytail-review`. If this is the only piece you want, putting its `SKILL.md` in your project or user Skills directory is enough; you don't need Ponytail's persistent modes, Hooks, or the other Skills.

## Four questions before accepting a deletion suggestion

When the output comes back, check each suggestion with four questions:

1. Does the replacement fully cover the current explicit requirements?
2. Does the removed code protect a security, data, or accessibility boundary?
3. Does this abstraction really have only one implementation and one axis of change?
4. After the change, is the code easier to understand and test, not just shorter?

Apply the suggestion when all four answers favor simplifying. If any answer depends on business context the agent doesn't have, a human should decide, rather than deleting code because the output said `delete`.

Next time an agent hands you a diff that's correct but surprisingly large, finish the normal review, then run the [SKILL.md](https://github.com/DietrichGebert/ponytail/blob/16f29800fd2681bdf24f3eb4ccffe38be3baec6b/skills/ponytail-review/SKILL.md) as a second pass. Even if all you get back is `Lean already. Ship.`, that beats accepting every layer of abstraction an agent writes by default.
