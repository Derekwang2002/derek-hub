---
title: "What does layered architecture isolate? Change, dependencies, and cost"
summary: "Business rules often change faster than the database or API. A course enrollment example helps work through what layering saves, and what extra work it creates."
---

While organizing notes on the enrollment example in [“Learn Architecture Design in Five Minutes” on Bilibili](https://www.bilibili.com/video/BV1CXet6gE6X/), my first interpretation was simple: parts that change easily should depend on parts that do not. So the API and database go on the outside, the service handles the workflow, and the domain holds the business rules.

I got stuck on the claim that business rules are relatively stable. When a product changes enrollment eligibility, pricing, or approval steps, the domain and service are exactly where those edits go. The database and web framework might stay the same for years. Measured by edit frequency, the business code can be the least stable part.

Does that dependency direction still make sense? And if an enrollment feature could fit in a few dozen lines, what work do all these extra files and interfaces actually save?

Those questions made dependency inversion and interfaces more concrete for me: a rule can change often without forcing its callers to change. I will keep using enrollment to work through this. The discussion of scale and engineering costs extends the original example.

## Four responsibilities inside one enrollment function

Enrollment can fit in a single function: parse the request, load the student and course, check for duplicates and capacity, save, and return an HTTP response.

The trouble shows up when editing it. Even checking that a full course rejects enrollment requires reading past queries and HTTP error handling. A test may need a database connection before it can get started.

The example separates the code like this:

| Part | Core question | Enrollment example |
|---|---|---|
| domain | Which actions are valid in the business? | Reject duplicate enrollment and enrollment beyond capacity |
| service | Which steps complete a use case? | Load data, apply enrollment rules, and save the result |
| API | How do external callers request an operation and understand its result? | Parse parameters and turn business outcomes into HTTP responses |
| Database implementation | How is data actually read and persisted? | SQL, ORM usage, field mappings, and storage operations |

Here, the service coordinates a use case inside the application. It does not need its own deployment. The domain can also be ordinary functions. Putting enrollment behavior inside a `Course` object suits this example, but not every behavior needs to live in a class.

As for how many layers to use, the [original Clean Architecture article](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html) is clear that the layer count is schematic. Creating four matching folders does not guarantee that responsibilities have been separated.

![Enrollment architecture: server connects api and db, both depend on service, and service depends on domain.](/blog/layered-architecture-and-change/original-layered-architecture.png)

Figure 1: The enrollment architecture from the [original video](https://www.bilibili.com/video/BV1CXet6gE6X/). The `server` is the composition root: it creates objects, connects their dependencies, and starts the application. The yellow area holds domain rules. The `db → service` arrow abbreviates the DB implementing a storage interface defined on the business side. These arrows show code dependencies, not request execution order.

## Stability has at least three meanings

I initially read “stable” as “rarely edited.” That leaves out the caller.

An eligibility function can change its internal conditions every week while keeping the same parameters, results, and failure behavior. Its callers may need no edits at all. The implementation changes often; the external contract stays relatively stable. That contract covers how to call it, how it can fail, and what it guarantees, not just the function signature.

Another kind of stability is being unaffected by unrelated changes. Product decisions can change enrollment eligibility, but an HTTP framework upgrade should not. That is the isolation we want when putting business rules on the inside.

A module that has not changed for a year can still bind its callers tightly to its internal data structures if it exposes them all. The same database product can host constantly changing queries, schemas, indexes, and transaction code. An API's public contract can change without replacing its framework either.

Rare edits, unchanged callers, and independence from a particular kind of change are different things. Counting Git commits cannot tell us which part should depend on which.

## Dependency inversion changes source-code dependencies

A service that needs a course still calls a storage object at runtime. Dependency inversion concerns the source code: must the service reference that specific PostgreSQL storage class?

The business side can define an `EnrollmentStore` interface describing what it needs to read and save. The service uses that interface, and the PostgreSQL adapter implements it. Writing the enrollment workflow then requires no direct reference to the PostgreSQL implementation.

![Source dependencies: the API uses the enrollment use case, which uses domain rules and a storage interface implemented by the PostgreSQL adapter.](/blog/layered-architecture-and-change/dependencies-en.svg)

Figure 2: Source-code dependencies. Solid arrows mean usage; the dashed arrow means interface implementation. Arrows point toward the dependency. [View full size](/blog/layered-architecture-and-change/dependencies-en.svg) · [Mermaid source](/blog/layered-architecture-and-change/dependencies-en.mmd)

This also explains the easily misread `db → service` arrow in the original sketch. The DB implementation depends on an interface declared on the business side. It is not initiating a call to the service.

When starting the program, create a concrete storage object, pass it to the service, and let the API use that service. That is dependency injection. Constructor or ordinary function arguments can do the job without a container.

![Successful enrollment at runtime: the API calls the service, which reads storage, applies domain rules, saves, and returns a result.](/blog/layered-architecture-and-change/runtime-en.svg)

Figure 3: A successful enrollment, read from top to bottom. The service calls the DB implementation through an injected object while its source can reference only an interface. Failure paths are omitted; transactions and concurrency still need separate handling. [View full size](/blog/layered-architecture-and-change/runtime-en.svg) · [Mermaid source](/blog/layered-architecture-and-change/runtime-en.mmd)

Adding an interface does not automatically hide the details. If callers still supply SQL, manage ORM sessions, and handle database row objects, understanding enrollment still requires understanding storage. That interface saves little work.

## Layering can work even when the domain changes fastest

Back to the original question. Suppose enrollment looks like this:

```text
enroll(student_id, course_id) -> EnrollmentResult
```

The product changes the cutoff from “until the course starts” to “24 hours before the course starts.” If the data already includes the start time and an existing failure result can express this rejection, updating the eligibility check and its tests may be enough.

The service follows the same steps, the API still accepts two IDs, and the database needs no additional fields for the query. The domain has changed, but its callers may not need to.

This is where layering starts to look worthwhile to me. If the cutoff changes often, give that time check an easy-to-find home and a straightforward test. Editing it should not require setting up a complete HTTP request and database connection again.

In his [original hexagonal architecture article](https://alistair.cockburn.us/hexagonal-architecture), Cockburn discusses exactly these concerns: testing an application independently of its UI and database, and allowing programs or batch jobs to use the same application behavior.

But a change from “enrollment succeeds immediately” to “pay first, then obtain approval, then confirm enrollment” reaches further:

- The domain adds states such as awaiting payment and awaiting approval, along with transition rules.
- The service orchestrates payment and approval.
- The database stores the new states and records.
- The API exposes the relevant operations and returns new outcomes.

It is hardly surprising that all four layers change here. The meaning of successful enrollment has changed, so callers and storage may need to adapt. Squeezing the new workflow into an old interface just to preserve it could make the code harder to understand.

The distinction to make is whether the new business behavior requires those edits, or whether exposed implementation details are forcing other code to follow along.

![Comparing change impact: a cutoff adjustment may affect only rules and tests if existing contracts suffice; adding payment and approval requires coordinated changes across all four layers.](/blog/layered-architecture-and-change/change-scope-en.svg)

Figure 4: Two product changes with quite different reach. The left path assumes existing data and results can express the new rule; the right adds business states that require the layers to work together. [View full size](/blog/layered-architecture-and-change/change-scope-en.svg) · [Mermaid source](/blog/layered-architecture-and-change/change-scope-en.mmd)

### Keep frequently changing rules in a smaller area

If ordinary, membership, and promotional courses have different eligibility rules but similar enrollment steps, I would start by extracting eligibility into a function. The workflow gets an approval or a rejection with a reason, then proceeds accordingly.

Once multiple rule sets need to be switched or maintained separately, consider a strategy interface. With just one condition, write that condition clearly first. A generic rules engine would add its own maintenance work.

During product exploration, the entire set of rules may be overturned. I would rather keep the model simple enough to rewrite than try to anticipate every future requirement.

It is also fine if the API and database never change. Layering is useful if it makes everyday edits and tests easier. Without even that benefit, “we might switch databases someday” is a weak reason to write another set of interfaces.

## How large must a business be before this is worthwhile?

I cannot give a useful answer like “start layering after ten thousand users.” User count and maintenance difficulty are not that directly related.

A high-traffic query service might have few business rules. A settlement system used by a few hundred people could have difficult monetary and approval states to handle. The first needs to address throughput; the second needs clear rules even with little traffic.

Rather than looking for a scale threshold, I would check whether these problems have appeared:

| Existing problem | Separation worth considering |
|---|---|
| The same rule appears in HTTP handlers, scheduled jobs, and import scripts | Consolidate shared business behavior in a reusable use case or rules module |
| Checking a calculation or eligibility rule requires starting the entire service | Separate pure rules from external interactions |
| Changing one condition requires understanding requests, ORM behavior, and SQL | Gather the rule in one place and reduce what maintainers must understand |
| State and monetary rules are scattered, causing edits to be missed | Establish one authoritative place to maintain each rule |
| A requirement repeatedly causes rework in unrelated modules | Check for shared data structures and leaked implementation details |

How often these problems occur, how many people need to make changes together, and how long the project will be maintained all affect whether the effort is worthwhile. A temporary tool and a long-lived product need not be split in the same way.

Even within one project, different choices can make sense. A complicated enrollment workflow may deserve independent rules and a storage interface, while a nearby read-only list simply queries and returns data.

## Benefits and costs show up in everyday maintenance

The work layering saves is often mundane: no hunting for several copies of an eligibility check, no starting the whole service to test a rule. If a future bulk import can call the existing enrollment logic, there is one less copy to keep in sync. For a team, knowing what a module accepts and returns is usually less work than first learning its entire implementation.

But someone has to maintain the additions. Interfaces need names, objects need assembly, and data moves between models. Reading a feature means visiting more files. With an unsuitable interface, adding one field can become an edit across five layers.

Take this call chain:

```text
Controller -> Service -> Repository -> ORM
```

If each layer handles its own rules or conversions, this can be perfectly reasonable. But if arguments pass straight down and results pass straight back up, and only the ORM code explains what happens, the forwarding layers deserve another look.

I would ask what happens if a layer is removed. Does the work it handled spread into several callers? If so, it was saving duplication. If removing it only means opening one fewer file, it may not be needed.

The size of the benefit depends on actual requirements. Small savings on frequent changes can add up; avoiding a missed edit or a round of cross-team clarification also counts. On the other side are the initial extraction effort and the recurring cost of maintaining interfaces and mappings.

Rather than assign architecture a universal return, I would work through a few recent requirements: with this proposed split, which edits would disappear, and what extra work would it introduce?

## Two practical costs hidden in the enrollment example

### Switching databases takes more than one line of assembly code

The example makes a database switch look straightforward: change one line at the assembly point. But that is the last step, after the new implementation has been written and satisfies the old contract.

A real move from SQLite to PostgreSQL may involve SQL dialects, existing data, transaction isolation, and performance. The interface can reduce edits to enrollment logic. The migration work is still there.

I would not use a possible future database switch as the only justification. Current testing, maintenance, or reuse needs are easier to assess.

### Correct rules do not guarantee correct concurrent behavior

With one place left, two requests can both read that a place is available, pass their domain checks, and save successfully. Each rule check looks correct on its own; the course still ends up over capacity.

Preventing this may require locking in a transaction, checking a version during an update, or including the capacity condition in an atomic write. A suitable unique constraint can also prevent duplicate enrollment.

These decisions need to be made together: which steps must succeed or fail as a group, how storage provides that guarantee, and how the workflow handles failure. An interface with only `get` and `save`, but no consistency requirements, leaves a practical problem for its users to solve.

Pure rule tests can check eligibility. Database integration tests and necessary concurrency tests must check that real storage upholds those requirements too. Passing tests against an in-memory substitute does not replace that work.

## Start small and add structure gradually

Starting a small project, I would let routes handle HTTP and write a business function that clearly expresses one operation, calling the ORM directly where needed. Simple CRUD does not need a domain, service, and repository for every table.

Fowler's [Transaction Script](https://martinfowler.com/eaaCatalog/transactionScript.html) organizes a business request as a procedure and extracts common steps. It is a reasonable starting point to take seriously.

When eligibility checks and state transitions become difficult to read or test, extract those rules. Functions are fine to begin with. Consider richer object models when a group of data and behavior needs to be maintained together.

Interfaces can come later too. If a real database makes rule tests awkward, or payments and notifications already have different implementations, provide a way to substitute those parts. A test substitute counts as an actual use, though it does not remove the need for integration checks against the real implementation.

As the business grows, I would organize modules around enrollment, payments, and courses, letting each use as much internal layering as it needs. That avoids pushing every feature into an ever-growing service.

At this point, the application can still be a single process. Microservices require a separate assessment of network calls, deployment and operations, and consistency across services.

## Ask each layer which costs it removes

I now find it more useful to picture the next requirement. The cutoff changes again: can I find the rule, edit it, and run its tests? If payment and approval are added, which parts really need to change together, and do the interfaces make those requirements clear?

Frequent changes to the domain and service do not make me think layering has failed. What gives me pause is writing a pile of interfaces and still having to read everything from top to bottom for every edit. In that situation, I would try consolidating the layers that only forward calls, then see which responsibilities still deserve separate treatment.

## References

- [“Learn Architecture Design in Five Minutes” on Bilibili](https://www.bilibili.com/video/BV1CXet6gE6X/): the course enrollment example; this article started with summary notes on the video.
- [Robert C. Martin: The Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html): separation of concerns, source-code dependency direction, and interactions between inner and outer layers.
- [Alistair Cockburn: Hexagonal Architecture](https://alistair.cockburn.us/hexagonal-architecture): ports and adapters, and the motivation for testing applications independently of UI and database implementations.
- [Martin Fowler: Transaction Script](https://martinfowler.com/eaaCatalog/transactionScript.html): organizing procedural logic around business requests.
