# Params & DslContext: Test Isolation Utilities

Acceptance testing utilities for functional and temporal isolation in TypeScript, based on Dave Farley's ATDD patterns.

> Thanks to [Dave Farley](https://courses.cd.training/) for creating the original Params and DslContext patterns and teaching the isolation techniques that inspired this implementation.

## Core Concepts

### Temporal Isolation (via `Params.alias`)

-   Same test run repeatedly gets consistent, unique handles
-   `"Alice"` becomes `"Alice1"` in first run, `"Alice2"` in second run
-   Within one test context, `"Alice"` always maps to the same handle
-   **Key benefit**: Tests can run repeatedly in deployed systems without cleanup

### Functional Isolation (via separate DSL instances)

-   Each DSL instance = separate context = independent state
-   Context A and Context B don't interfere with each other
-   Same logical name in different contexts gets different handles
-   **Key benefit**: Tests can run in parallel without data conflicts

### When to Use This Pattern

✓ **Use for:**

-   Multi-tenant systems (e.g. e-commerce, SaaS)
-   Systems where tests create accounts/users/entities
-   Running same test repeatedly in deployed systems
-   Parallel test execution needing data isolation

✗ **Skip for:**

-   Simple single-context systems (like basic TicTacToe)
-   Systems with full teardown after each test
-   Unit tests with complete isolation already

## Quick Start

```bash
pnpm install
pnpm test
```

## The Tools

### DslContext

Keeps per-test sequences and global alias maps so test runs never clash.

### Params

Maps DSL arguments (plain objects with string values) to named values with isolation guarantees.

**Four key methods:**

| Method                          | Purpose                    | Isolation Type    |
| ------------------------------- | -------------------------- | ----------------- |
| `alias(name)`                   | Unique handles per context | Global (temporal) |
| `optional(name, default)`       | Flexible defaults          | None              |
| `optionalSequence(name, start)` | Auto-incrementing IDs      | Per-context       |
| `optionalList(name, defaults)`  | Multi-value parameters     | None              |

## Usage Example

```typescript
import { DslContext } from "./context"
import { Params } from "./params"

const context = new DslContext()

const params = new Params(context, {
    name: "Alice",
    role: "Admin",
    tags: ["vip", "premium"]
})

const uniqueHandle = params.alias("name") // "Alice1" (globally unique)
const role = params.optional("role", "User") // "Admin" (or default "User")
const tags = params.optionalList("tags", ["regular"]) // ["vip", "premium"]
```

### Supported Argument Styles

```typescript
// String values
new Params(context, { name: "Alice", role: "Admin" })

// Array values
new Params(context, { tags: ["tag-a", "tag-b"] })

// Comma-separated string (auto-split)
new Params(context, { tags: "tag-a, tag-b" })
```

## How Isolation Works

### Temporal Isolation Example

```typescript
// Test run 1
const dsl1 = new Dsl()
dsl1.user.create({ name: "Alice" }) // Creates "Alice1"
dsl1.user.create({ name: "Alice" }) // Reuses "Alice1" (same context)

// Test run 2 (e.g., re-running the suite)
const dsl2 = new Dsl()
dsl2.user.create({ name: "Alice" }) // Creates "Alice2" (new global sequence)
```

**Why it works:** `DslContext` maintains a static `globalSequenceNumbers` map that persists for the test process lifetime. Each new context pulls the next suffix, ensuring deterministic, non-colliding aliases.

**When does it reset?** Automatically when the test process exits. Each test run (e.g., `pnpm test`) starts a fresh process with clean state. No manual cleanup needed.

### Functional Isolation Example

```typescript
// Two parallel tests or contexts
const contextA = new Dsl()
const contextB = new Dsl()

contextA.user.create({ name: "Bob" }) // "Bob1"
contextB.user.create({ name: "Bob" }) // "Bob2" (different context)

// But within one context:
contextA.user.create({ name: "Bob" }) // Still "Bob1" (cached in context)
```

**Why it works:** Each `DslContext` maintains its own alias cache. Same name in same context returns cached handle; same name in different context gets new global sequence number.

**About sequences:** The global alias counter persists across tests in the same run but resets when you restart your test suite (new process = fresh state).

## Real-World DSL Example

```typescript
// dsl/index.ts
export class Dsl {
    public readonly user: UserDsl
    public readonly todo: TodoDsl

    constructor() {
        const context = new DslContext()
        const userDriver = new UIUserDriver()
        const todoDriver = new UITodoDriver()

        this.user = new UserDsl(context, userDriver)
        this.todo = new TodoDsl(context, todoDriver)
    }
}

// dsl/user.dsl.ts
export class UserDsl {
    constructor(
        private readonly context: DslContext,
        private readonly driver: UserDriver
    ) {}

    public async create(args: ParamsArgs = {}): Promise<string> {
        const params = new Params(this.context, args)

        const username = params.alias("name") // Unique per context
        const role = params.optional("role", "User") // Default if not provided
        const email = params.optional("email", `${username}@test.com`)

        await this.driver.createUser(username, email, role)
        return username
    }
}
```

## Test Example

```typescript
describe("User manages todos", () => {
    let dsl: Dsl

    beforeEach(() => {
        dsl = new Dsl() // Fresh context per test
    })

    it("archives completed todo", async () => {
        // Given
        const user = await dsl.user.create({ name: "Alice" }) // "Alice1"
        await dsl.todo.create({ title: "Buy milk", owner: user })
        await dsl.todo.complete({ title: "Buy milk" })

        // When
        await dsl.todo.archive({ title: "Buy milk" })

        // Then
        await dsl.todo.confirmArchived({ title: "Buy milk" })
    })
})
```

## Running Tests

```bash
pnpm test                     # Run all tests
pnpm exec vitest --coverage   # With coverage report
```

## Learn More

See working examples in:

-   `/acceptance-test-isolation-demo/` - Complete isolation demo with `.alias()`, `.optional()`, and `.optionalSequence()`
