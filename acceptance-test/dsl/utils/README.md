# Params DSL Utilities

Acceptance testing utilities for functional and temporal isolation in TypeScript.

> Thanks to [Dave Farley](https://courses.cd.training/) for creating the original Params and DslContext patterns and teaching the isolation techniques that inspired this implementation.

## Overview

- `Params` maps DSL arguments (plain objects whose values are strings or string arrays) to named values.
- `DslContext` keeps per-test sequences and global alias maps so test runs never clash.
- Everything lives under `acceptance-test/dsl/utils/` and is exercised via Vitest.

## Getting Started

```bash
pnpm install
pnpm exec vitest run acceptance-test/dsl/utils
```

## Usage

```ts
import { DslContext } from "./context/dsl-context"
import { Params } from "./params/params"

const context = new DslContext()

const params = new Params(context, {
  email: "user@test.com",
  name: "ResourceName",
  tags: ["tag-a", "tag-b"],
  region: "us-east"
})

const uniqueEmail = params.alias("email") // For isolation: "user@test.com1", "user@test.com2", etc.
const region = params.optional("region", "us-west") // For readability: sensible defaults
const tags = params.optionalList("tags", ["default-tag"])
```

### Supported Argument Styles

- `new Params(context, { name: "Alice", role: "Accountant" })`
- `new Params(context, { tags: ["tag-a", "tag-b"] })`
- `new Params(context, { tags: "tag-a,tag-b" })`

## Functional & Temporal Isolation

Acceptance tests run against production-like systems with real databases and caches (slower than unit tests that mock everything). To keep test suites fast, we run tests in parallel. Isolation prevents tests from interfering with each other during parallel execution and ensures repeatable results across multiple runs.

- **Functional isolation**: Each test creates its own unique data boundary (e.g., user account) as the primary isolation boundary. All test operations happen within that boundary's context (e.g., todos belong to that specific user). The first action in every test establishes this boundary via `dsl.user.hasAccount({ email: "user@test.com" })`, where `params.alias("email")` transforms it to "user@test.com1", "user@test.com2", etc. Tests share the same database but operate in isolated spaces, enabling safe parallel execution.

- **Temporal isolation**: `params.alias()` takes the value from your test arguments and ensures it gets a unique suffix across test runs. When you replay a test, "Buy milk" becomes "Buy milk1", "Buy milk2", producing deterministic results without colliding with previous data.

- **Readability helpers**: `params.optional()` provides sensible defaults so executable specifications stay concise and business-focused. This is not for isolation—it's for keeping tests readable by avoiding unnecessary technical details.

Together these properties allow test suites to run in parallel against a long-lived SUT while staying deterministic and easy to rerun.

> ℹ️ `DslContext` maintains a static `globalSequenceNumbers` map that persists across all tests within the process. Each test creates a fresh `DslContext` instance (which is destroyed after the test), but all instances share the same static counter, so Test 1 gets suffix "1", Test 2 gets "2", etc.
>
> This is the one intentional piece of shared state: it enables temporal isolation and deterministic numbering without manual cleanup. When you restart the test runner, the process terminates and the OS reclaims all process memory (including the static `globalSequenceNumbers` map), so the new process starts with a fresh empty map.

## Provided Methods

- `optional(name, default)` – returns supplied value or default (for test readability)
- `alias(name)` – enforces presence and returns unique alias per context (for functional & temporal isolation)
- `optionalSequence(name, start)` – returns supplied value or numbered sequence (convenience feature)
- `optionalList(name, defaults)` – returns array of supplied values or defaults (for test readability)

## Tests

Use `npm run test` or `npx vitest --coverage` to run the suite.

## Example Test Fixture

```ts
// dsl/index.ts

import type { ProtocolDriver } from "../protocol-driver"
import { DslContext } from "./utils/context"
import { UserDsl } from "./user"
import { TodoDsl } from "./todo"

export class Dsl {
  public readonly user: UserDsl
  public readonly todo: TodoDsl

  constructor(driver: ProtocolDriver) {
    const context = new DslContext()

    this.user = new UserDsl(context, driver)
    this.todo = new TodoDsl(context, driver)
  }
}
```

```ts
// acceptance-test/executable-specs/tictactoe.acceptance.spec.ts

import { beforeEach, describe, it } from "vitest"
import { createProtocolDriver } from "../protocol-driver"
import { Dsl } from "../dsl"

describe("Epic: Making Moves", () => {
  describe("Feature: Player makes a move", () => {
    let dsl: Dsl

    beforeEach(() => {
      const driver = createProtocolDriver(process.env.TEST_PROTOCOL ?? "cli")

      dsl = new Dsl(driver)
    })

    it("should accept a valid move on an empty cell", async () => {
      // Given
      await dsl.game.start()
      await dsl.player.isTurn("X")
      await dsl.board.isPositionEmpty(5)

      // When
      await dsl.player.placeMark("X", 5)

      // Then
      await dsl.board.confirmPositionContains(5, "X")
      await dsl.player.confirmNextTurn("O")
    })
  })
})
```
