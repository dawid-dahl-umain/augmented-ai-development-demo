# Acceptance Test Isolation Demo

**Purpose:** Demonstrate how to use `DslContext` and `Params` utilities for test isolation.

> 📚 **For detailed explanation of isolation patterns**, see [this documentation](../acceptance-test/dsl/utils/README.md)

## Quick Start

```bash
pnpm exec vitest run acceptance-test-isolation-demo/acceptance-test/executable-specs/isolation-demo.acceptance.spec.ts
```

All 9 tests pass, demonstrating `.alias()`, `.optional()`, and `.optionalSequence()` in action!

## What This Demo Shows

Three utility methods for test isolation:

**`.alias(name)`** - Unique identifiers (16 uses)

```typescript
// Test uses: "Alice"
// System creates: "Alice1" (first run), "Alice2" (second run)
const username = params.alias("name")
```

**`.optional(name, default)`** - Sensible defaults (3 uses)

```typescript
// If not provided, uses empty string
const description = params.optional("description", "")
```

**`.optionalSequence(name, start)`** - Auto-increment IDs (1 use)

```typescript
// Generates: "1", "2", "3"... per test context
const id = params.optionalSequence("id", 1)
```

## Why This Matters

### Temporal Isolation

Same test runs repeatedly without cleanup:

```typescript
// First run: "Alice" → "Alice1"
// Second run: "Alice" → "Alice2"
```

### Functional Isolation

Tests run in parallel without collisions:

```typescript
// Test A: "Alice" → "Alice1"
// Test B: "Alice" → "Alice2" (different context)
```

## Structure

```text
acceptance-test/
├── executable-specs/     # 9 tests (1:1 BDD mapping)
├── dsl/                  # UserDsl, TodoDsl (uses Params)
├── protocol-driver/      # MockDriver (one driver, all assertions)
└── sut/                  # MockTodoSystem (in-memory)
```

## Key Pattern

```typescript
export class Dsl {
    constructor() {
        const context = new DslContext() // Fresh per test
        const sut = new MockTodoSystem()
        const driver = new MockDriver(sut) // ONE driver

        this.user = new UserDsl(context, driver) // Both share
        this.todo = new TodoDsl(context, driver) // same driver
    }
}
```

## vs. Main Demo

| Aspect           | Main Demo     | Isolation Demo |
| ---------------- | ------------- | -------------- |
| **SUT**          | Real CLI app  | Mock system    |
| **Params Usage** | Minimal       | Extensive      |
| **Purpose**      | Test behavior | Show utilities |

## Learn More

- **Utility details**: `../acceptance-test/dsl/utils/README.md`
- **BDD specification**: `isolation-specification-package/isolation-bdd-specification-package.md`
