# AI Acceptance Testing Blueprint

## Purpose

Transform BDD user stories into executable acceptance tests using Dave Farley’s Four-Layer Model. The resulting suite proves the System Under Test (SUT) satisfies business requirements with a 1:1 mapping between Gherkin scenarios and executable specifications.

## The Four-Layer Model (Dave Farley)

Dave Farley separates concerns into four layers that keep acceptance tests **Concise, Accurate, Readable, and Durable** (CARD):

```
┌─────────────────────────────────────┐
│ Layer 1: Executable Specification    │  What the system should do (business language)
├─────────────────────────────────────┤
│ Layer 2: Domain-Specific Language    │  Business vocabulary + test isolation
├─────────────────────────────────────┤
│ Layer 3: Protocol Driver             │  How to interact with the system
├─────────────────────────────────────┤
│ Layer 4: System Under Test           │  The actual application
└─────────────────────────────────────┘
```

### Core Principles

-   **Concise** – Specs express only the business behavior.
-   **Accurate** – Tests mirror the specification exactly.
-   **Readable** – Non-technical stakeholders can read tests.
-   **Durable** – Tests survive implementation changes.

### Layer Responsibilities

1. **Executable Specification** – Business-readable tests that copy Gherkin scenarios verbatim.
2. **DSL** – Provides the ubiquitous language and handles functional/temporal isolation.
3. **Protocol Driver** – Owns all technical interaction with the SUT.
4. **SUT** – The production application or vertical slice under test.

## Prerequisites

**Required**

-   User Stories with BDD Scenarios in Gherkin format
-   Ubiquitous Language glossary (shared domain vocabulary).
-   Understanding of the SUT boundary (CLI, REST, GraphQL, etc.).

**Optional**

-   Runnable SUT (can be delivered incrementally while tests evolve).

If anything is missing, pause and request it before implementing the suite.

## Implementation Approach

Ask which path to follow:

### Option 1 – Test-First

-   Generate executable specs for every scenario.
-   Expect them to fail initially; drive development with TDD.
-   Grow DSL and drivers incrementally as features appear.

### Option 2 – Vertical Slice

-   Pick one scenario.
-   Implement all four layers end-to-end.
-   Confirm the test passes, then iterate with more scenarios.

## Recommended Directory Structure

```
acceptance-test/
├── executable-specs/          # Layer 1 tests
│   └── [epic].acceptance.spec.ts
├── dsl/                       # Layer 2 business vocabulary
│   ├── utils/
│   │   ├── context.ts         # DslContext
│   │   └── params.ts          # Params helper
│   ├── index.ts               # Exports DSL surface + reset
│   └── [concept].ts           # One per concept (game, player, board, …)
├── drivers/                   # Layer 3 protocol drivers
│   ├── index.ts               # Re-exports drivers
│   └── [concept].driver.ts    # One per concept
└── sut/                       # Layer 4 helpers (build, launch, seed, …)
    └── build.ts
```

## Step 1 – Extract Domain Vocabulary

From the specification package:

1. List all `Given`/`When`/`Then` phrases (or any valid Gherkin keywords like `And`)
2. Highlight the nouns (concepts) and verbs (actions).
3. Map each phrase to a DSL method using the ubiquitous language.

Example:

```
Gherkin: Given the customer has items in cart
DSL:     customer.hasItemsInCart()

Gherkin: When they complete checkout
DSL:     checkout.complete()

Gherkin: Then order should be created
DSL:     order.confirmCreated()
```

## Step 2 – Create Executable Specifications

Each scenario becomes a test that calls exactly one DSL method per Gherkin line.

```tsx
// executable-specs/[epic].acceptance.spec.ts
import { describe, it, beforeEach } from "vitest"
import { dsl } from "../dsl"

describe("Epic: [Epic Name]", () => {
    beforeEach(() => dsl.reset())

    describe("Feature: [Feature Name]", () => {
        it("should [scenario name]", async () => {
            // Given
            await dsl.[concept].[givenMethod]()

            // When
            await dsl.[concept].[whenMethod]()

            // Then
            await dsl.[concept].[confirmMethod]()

            // And
            await dsl.[concept].[confirmAnotherMethod]()
        })
    })
})
```

**Rules**

-   One DSL invocation per Gherkin line – no more, no less.
-   Comments must be the bare Gherkin keywords (`// Given`, `// When`, `// Then`, `// And`).
-   Use the `confirm` prefix for assertions.
-   No technical detail leaks into the test body.

## Step 3 – Build the DSL Layer

The DSL translates business language into driver calls and manages isolation.

### `dsl/utils/context.ts`

```ts
export class DslContext {
    private static globalSequences = new Map<string, number>()
    private sequences = new Map<string, number>()
    private aliases = new Map<string, string>()

    public sequence(name: string, start = 1): string {
        const current = this.sequences.get(name) ?? start
        this.sequences.set(name, current + 1)
        return String(current)
    }

    public alias(name: string): string {
        if (!this.aliases.has(name)) {
            const sequence = this.globalSequence(name)
            this.aliases.set(name, `${name}${sequence}`)
        }
        return this.aliases.get(name) as string
    }

    public reset(): void {
        this.sequences.clear()
        this.aliases.clear()
    }

    private globalSequence(name: string): number {
        const current = DslContext.globalSequences.get(name) ?? 1
        DslContext.globalSequences.set(name, current + 1)
        return current
    }
}
```

### `dsl/utils/params.ts`

```ts
import { DslContext } from "./context"

export class Params {
    public constructor(private readonly context: DslContext) {}

    public alias(name: string): string {
        return this.context.alias(name)
    }

    public sequence(name: string, start = 1): string {
        return this.context.sequence(name, start)
    }
}
```

### Concept DSL (e.g. `dsl/order.ts`)

```ts
import { orderDriver } from "../drivers"
import { DslContext } from "./utils/context"
import { Params } from "./utils/params"

export class OrderDsl {
    private readonly context = new DslContext()
    private readonly params = new Params(this.context)

    public reset(): void {
        this.context.reset()
        orderDriver.reset()
    }

    public async hasOrder(name: string): Promise<void> {
        const id = this.params.alias(name)
        await orderDriver.create(id)
    }

    public async shipOrder(name: string): Promise<void> {
        const id = this.params.alias(name)
        await orderDriver.ship(id)
    }

    public confirmOrderShipped(name: string): void {
        const id = this.params.alias(name)
        orderDriver.confirmShipped(id)
    }
}

export const order = new OrderDsl()
```

## Step 4 – Implement Protocol Drivers

Drivers own all technical interaction with the SUT.

```ts
// drivers/order.driver.ts
export class OrderDriver {
    private lastResult: { stdout: string } | null = null
    private orders = new Set<string>()

    public reset(): void {
        this.lastResult = null
        this.orders.clear()
    }

    public async create(id: string): Promise<void> {
        await cli.run(["order", "create", id])
        this.orders.add(id)
    }

    public async ship(id: string): Promise<void> {
        this.lastResult = await cli.run(["order", "ship", id])
    }

    public confirmShipped(id: string): void {
        if (!this.lastResult?.stdout.includes(`Order ${id} shipped`))
            throw new Error(`Expected order ${id} to be shipped`)
    }
}

export const orderDriver = new OrderDriver()
```

### Driver Responsibilities

-   Parse/format data for the SUT or external systems.
-   Maintain any technical state required by the tests.
-   Isolate unmanaged dependencies.
-   Emit clear failure messages when confirmations fail.

## Step 5 – Aggregate DSL Modules

```ts
// dsl/index.ts
import { board } from "./board"
import { game } from "./game"
import { player } from "./player"

class Dsl {
    public readonly board = board
    public readonly game = game
    public readonly player = player

    public reset(): void {
        this.board.reset?.()
        this.game.reset?.()
        this.player.reset?.()
    }
}

export const dsl = new Dsl()
```

## Test Isolation Strategies

1. **SUT Isolation** – Unmanaged external systems (public APIs, third-party SaaS, etc.) are stubbed at the driver level. Managed systems under our control (databases, queues, caches) stay real so acceptance tests reflect true integration.
2. **Functional Isolation** – Each test uses unique aliases/IDs to avoid clashes and allow parallel execution.
3. **Temporal Isolation** – Tests are repeatable; no cleanup scripts required between runs.

## Validation Checklist

-   [ ] Each BDD scenario has exactly one executable spec.
-   [ ] Each Gherkin line maps to exactly one DSL call.
-   [ ] DSL names follow the ubiquitous language.
-   [ ] Assertions use the `confirm` prefix.
-   [ ] Drivers own all technical interaction.
-   [ ] Tests exercise the full stack relevant to the specification.

## Common Issues & Remedies

| Issue                         | Remedy                                                               |
| ----------------------------- | -------------------------------------------------------------------- |
| DSL leaking technical details | Move the detail into the driver, revisit the vocabulary.             |
| Flaky specs                   | Check isolation (aliases/sequences) and driver reset behavior.       |
| Hard to add new scenarios     | Review concept coverage in DSL/driver; prefer composable vocabulary. |

## Success Criteria

You’re done when:

1. All scenarios have executable specifications.
2. Tests can run in parallel and repeatedly without interference.
3. Failures point to genuine behavioral regressions.
4. Adding new scenarios requires minimal changes to DSL/drivers.
5. Stakeholders can read the specs and confirm they match the business language.

## Final Notes

This blueprint reflects Dave Farley’s intent: executable specifications as living documentation. Favor clarity, follow the ubiquitous language, and let the four-layer architecture keep the suite maintainable.
