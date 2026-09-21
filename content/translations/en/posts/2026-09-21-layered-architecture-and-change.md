---
title: "What Does Layered Architecture Isolate? Change, Dependencies, and Cost"
summary: "Starting with a course enrollment example split into domain, service, API, and database code, explore why layering can help even when business rules change fastest, when to split a system, and what the extra structure costs."
---

One sentence is easy to remember when learning layered architecture: parts that change easily should depend on parts that do not.

A course enrollment example seems to fit that explanation. The API and database sit on the outside, a service orchestrates the workflow, and the domain holds the core rules. The outer parts may switch frameworks or databases, while the enrollment rules remain relatively stable.

Real product development often looks different. The database and web framework stay unchanged for years, while the product team adjusts eligibility, pricing, and workflows every week. The domain and service may be the most frequently edited parts of the system.

Should the dependencies then point the other way? If not, what does layering protect? And is a small project justified in adding all those files and interfaces?

My view is that **layering earns its value by separating responsibilities according to why they change, then using explicit contracts to limit how changes spread. Edit frequency is a useful observation, but it cannot determine dependency direction on its own.**

This article starts with summary notes on the enrollment example in the Bilibili video “Learn Architecture Design in Five Minutes,” then draws on Clean Architecture, hexagonal architecture, and Transaction Script. The discussion of scale and tradeoffs extends the original example.

## Four Responsibilities Inside One Enrollment Function

The most direct implementation usually combines several tasks: parse a request, load a student and course, check for duplicate enrollment and capacity, save the result, and return an HTTP response.

The code works, but understanding and checking one rule requires dealing with business conditions, SQL, connections, and HTTP errors at the same time. A single function has several reasons to change.

Separating those responsibilities gives each part a different question to answer:

| Part | Core question | Enrollment example |
|---|---|---|
| domain | Which actions are valid in the business? | Reject duplicate enrollment and enrollment beyond capacity |
| service | Which steps complete a use case? | Load data, apply enrollment rules, and save the result |
| API | How do external callers request an operation and understand its result? | Parse parameters and turn business outcomes into HTTP responses |
| Database implementation | How is data actually read and persisted? | SQL, ORM usage, field mappings, and storage operations |

Here, service means application use-case orchestration; it does not imply an independently deployed microservice. A domain can use objects with behavior, or ordinary data structures and functions. Putting enrollment behavior inside a `Course` object is a modeling choice, not a mandatory form.

Four layers also do not require four particular folders. The original Clean Architecture article explicitly describes its layer count as schematic; responsibilities and source-code dependencies are what matter. [Reference: The Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)

## Stability Has at Least Three Meanings

Before deciding what should depend on what, distinguish three questions.

**Does the implementation change frequently?** This is the frequency of code edits that version history can reveal.

**Does the external contract change frequently?** Do the parameters, results, errors, and behavioral guarantees that callers must understand keep changing? A contract includes failure modes and calling constraints, not just a function signature.

**Is it easily affected by changes elsewhere?** Enrollment eligibility may change with product decisions, but should not change because the HTTP framework is upgraded.

These dimensions are different. A module can change its internal rules every week while preserving its external contract. Another can remain untouched for a year yet tightly couple its callers to many exposed implementation details.

In this context, saying that business rules are stable is better understood as an aim to keep them unaffected by unrelated technical changes. It does not mean that business rules stay unchanged over time.

Likewise, using the same database product for years does not mean storage code stays the same. Queries, schemas, indexes, and transaction handling may keep evolving. Keeping an API framework does not guarantee that its public contract stays unchanged either.

Sorting the four layers by Git commit counts and choosing dependency directions from that ranking confuses these different kinds of change.

## Dependency Inversion Changes Source-Code Dependencies

A service that needs a course naturally calls a storage operation at runtime. Dependency inversion does not remove that call.

It changes what the service needs to know when its code is written.

With a direct dependency on an implementation, the service must know a particular PostgreSQL storage class. With a storage interface defined on the business side, it only needs to know that courses can be retrieved and enrollment results saved. The concrete implementation is supplied from outside.

```text
Source dependencies:

API adapter ----------> EnrollmentService ------> Domain
                               |
                               v
                      EnrollmentStore interface
                               ^
                               |
                     PostgreSQL adapter

Runtime call:
EnrollmentService -> injected store object -> database
```

The upward arrow means that the PostgreSQL adapter implements an interface defined on the business side. It does not mean the database initiates a runtime call to the service. Abbreviating this relationship as “the DB depends on the service” can confuse source dependencies with execution order.

Dependency injection handles assembly: create a storage object, pass it to the service, and let the API use that service. Ordinary constructor or function arguments are sufficient; a dependency injection container is optional.

An interface does not become better simply by becoming more generic. If a storage interface still makes callers supply SQL, understand ORM sessions, and manipulate database row objects, business code still needs to know storage details. An interface earns its value through the complexity it actually hides from callers.

## Layering Can Work Even When the Domain Changes Fastest

Suppose the enrollment use case exposes this operation:

```text
enroll(student_id, course_id) -> EnrollmentResult
```

The product team changes the rule from “enrollment is allowed until the course starts” to “enrollment closes 24 hours before the course starts.” If existing data includes the start time and existing failure results can express rejection, this change may only require updating the eligibility rule and its tests.

The service still loads data, applies the rule, and saves the result. The API still accepts two IDs. Storage still retrieves the same information.

**A change inside the domain does not require every caller to change.** Changing an implementation and changing its external contract are different events.

The more frequently business rules change, the more useful it can be to express them in one place and verify them independently. A maintainer adjusting the enrollment cutoff can focus on the time condition without also understanding HTTP requests and database connections.

One central motivation for hexagonal architecture is to test an application independently of a particular UI or database, and to drive it through different entry points such as user interactions, programs, or batch jobs. [Reference: Hexagonal Architecture](https://alistair.cockburn.us/hexagonal-architecture)

The situation changes if the product moves from “enrollment succeeds immediately” to “pay first, then obtain approval, then confirm enrollment.” New business semantics may require several coordinated changes:

- The domain adds states such as awaiting payment and awaiting approval, along with transition rules.
- The service orchestrates payment and approval.
- The database stores the new states and records.
- The API exposes the relevant operations and returns new outcomes.

These changes are coupled by the requirement itself. A reasonable architecture can give each part a clear responsibility, but cannot eliminate changes that follow necessarily from new business semantics.

When evaluating decoupling, a more useful question is whether a change across modules is required by the business or caused by leaked implementation details.

### Keep Frequently Changing Rules in a Smaller Area

If the enrollment workflow stays relatively fixed but ordinary, membership, and promotional courses use different eligibility rules, start by extracting eligibility into an independent function. The workflow only needs to know whether enrollment is allowed and the reason for rejection.

Consider a strategy interface when multiple rule sets actually need to be switched or maintained independently. For one simple condition, a clear function is usually enough.

If product exploration might overturn every rule, keep the model simple and allow it to be refactored. Building a generic rules engine too early can freeze poorly understood variation into a framework that is harder to change.

It is also perfectly normal for the API and database to remain stable for a long time. Layering can still earn its keep by reducing testing and maintenance costs. If those benefits are absent too, a complete isolation structure is difficult to justify solely because the database might change someday.

## How Large Must a Business Be Before This Is Worthwhile?

User count, QPS, and lines of code are not reliable thresholds on their own.

A high-traffic query service can contain very little business logic. A settlement system used by a few hundred people can deserve careful modeling because its monetary, approval, and state rules are complex. Traffic primarily raises capacity and performance concerns; responsibility design primarily addresses understanding, change, and collaboration. The two cannot be directly converted into one another.

I pay more attention to problems that already exist:

| Existing problem | Separation worth considering |
|---|---|
| The same rule appears in HTTP handlers, scheduled jobs, and import scripts | Consolidate shared business behavior in a reusable use case or rules module |
| Checking a calculation or eligibility rule requires starting the entire service | Separate pure rules from external interactions |
| Changing one condition requires understanding requests, ORM behavior, and SQL | Gather the rule in one place and reduce what maintainers must understand |
| State and monetary rules are scattered, causing edits to be missed | Establish one authoritative place to maintain each rule |
| A requirement repeatedly causes rework in unrelated modules | Check for shared data structures and leaked implementation details |

Business complexity, the spread of changes, team collaboration, and expected maintenance lifetime usually explain more than reaching a particular number of users.

Nor must every feature use the same structure. A complex enrollment workflow can have independent rules and a storage interface, while a nearby read-only list simply queries and returns data. Modules carry different amounts of complexity and can use different amounts of structure.

## Benefits and Costs Show Up in Everyday Maintenance

The most common benefit of layering is reducing how much must be understood and verified to make a change.

- **Changes stay local.** Enrollment eligibility has a clear home, without multiple copies to find.
- **Tests become direct.** Supply inputs to a rule and check its results with less environment setup.
- **Behavior can be reused.** A web interface, background task, and bulk import can share business behavior.
- **Collaboration becomes clearer.** Modules interact through explicit contracts, reducing the need to share knowledge of their internals.

The costs are additional interfaces, data mappings, object assembly, and file navigation. Multiple models must remain consistent, and the team must understand the contracts. A poorly chosen abstraction can make a simple field change travel through five layers.

A typical warning sign is a chain whose layers merely forward arguments:

```text
Controller -> Service -> Repository -> ORM
```

The chain alone does not prove the design is wrong. What matters is whether each layer owns rules, conversions, or constraints, and whether it hides complexity. If each exposes almost the same information and maintainers still need to read all the way through, the extra structure offers little benefit.

Try a deletion test: if a module disappeared, would the complexity it handles reappear across several callers? If so, it is doing useful work. If that complexity disappears with the module, it may have been unnecessary forwarding.

An approximate economic framework can help:

```text
Expected benefit:
recurring changes × effort saved per change
+ reduced regression and coordination cost

Expected cost:
initial extraction + ongoing interface and mapping maintenance
```

This is not a precise formula, and there is no universal percentage improvement. It is a reminder to examine actual changes: could recent requirements have been located faster, implemented with fewer repeated edits, and verified more easily?

## Two Practical Costs Hidden in the Enrollment Example

### Switching Databases Takes More Than One Line of Assembly Code

“Swap the implementation at the assembly point” assumes that the new implementation already exists and satisfies the original contract.

A real migration from SQLite to PostgreSQL may also involve SQL dialects, data migration, transaction isolation, and performance verification. An interface can reduce coupling between business code and a concrete implementation, but cannot perform that migration work.

Database replaceability is therefore often better treated as an additional capability the architecture provides. Whether abstraction is worthwhile still depends on current testing, maintenance, and reuse needs.

### Correct Rules Do Not Guarantee Correct Concurrent Behavior

Suppose a course has one remaining place. Two requests load it simultaneously, and both domain checks conclude that a place is available. Both may then save successfully.

An in-memory capacity check expresses business intent but does not independently guarantee consistency under concurrency. A concrete solution may need locking inside a transaction, an update with a version check, or a capacity condition included in an atomic write. An appropriate unique constraint can also prevent duplicate enrollment.

These mechanisms require coordinated design: the use case determines what atomicity an operation requires, storage supplies the relevant guarantees, and failures return to the business workflow for handling. A simple `get` plus `save` interface that leaves its consistency contract unspecified can hide the most important part of the problem.

Pure rule tests, storage integration tests, and necessary concurrency tests therefore have distinct responsibilities. An in-memory substitute cannot prove that a real database behaves correctly under transactions.

## Start Small and Add Structure Gradually

I prefer to add structure as problems appear.

**First, express one use case clearly.** Let the route handle HTTP and a business function describe the operation, using an ORM directly where appropriate. Simple CRUD does not require a domain, service, and repository for every table.


Organizing a business request as a procedure, with common steps extracted into subprocedures, corresponds to Fowler's Transaction Script. It is an established way of organizing business logic in its own right. [Reference: Transaction Script](https://martinfowler.com/eaaCatalog/transactionScript.html)

**Second, extract rules that have become complex.** Gather calculations, eligibility decisions, and state transitions so they can be tested independently. Start with functions; introduce richer models when objects have data and behavior that actually need to be maintained together.

**Third, introduce interfaces for real substitution needs.** If a real database obstructs rule testing, or payment and notification capabilities already have different implementations, introduce small interfaces at those points. A test substitute can be a real substitution need, while still requiring integration checks against the real implementation.

**Fourth, organize around business modules as the system grows.** Enrollment, payments, and courses maintain their own capabilities, with an appropriate degree of layering inside each module. Avoid a giant service that accumulates every feature.

All of these steps can happen in one application and one process. Splitting modules and splitting microservices address different problems. The network, operational, and consistency costs of independent deployment deserve a separate evaluation.

## Ask Each Layer Which Costs It Removes

Returning to the original question, frequent changes to the domain and service do not directly invalidate layering. They make it more important to identify which changes a stable contract can contain within a module and which truly alter the overall workflow.

I would condense this discussion into three judgments:

- Dependencies should target explicit business capabilities and contracts; code edit frequency alone cannot rank them.
- Layering works when common changes become more local, rules become easier to verify, and callers need to understand fewer details.
- The extent of separation should follow actual complexity and maintenance benefits. Each layer needs responsibilities that justify the cost of its existence.

For a particular project, the most useful follow-up is concrete: after adding this module, where will the next common requirement be implemented, how much will a maintainer need to understand, and how will they know nothing has broken?

## References

- Summary notes on the course enrollment example in the Bilibili video “Learn Architecture Design in Five Minutes”: the starting point for this discussion; this article is not a verbatim transcript of the video.
- [Robert C. Martin: The Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html): separation of concerns, source-code dependency direction, and interactions between inner and outer layers.
- [Alistair Cockburn: Hexagonal Architecture](https://alistair.cockburn.us/hexagonal-architecture): ports and adapters, and the motivation for testing applications independently of UI and database implementations.
- [Martin Fowler: Transaction Script](https://martinfowler.com/eaaCatalog/transactionScript.html): organizing procedural logic around business requests.
