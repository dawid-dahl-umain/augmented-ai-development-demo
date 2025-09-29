# Params DSL Utilities

Acceptance testing utilities for functional and temporal isolation in TypeScript.

> Thanks to [Dave Farley](https://courses.cd.training/) for creating the original Params and DslContext patterns and teaching the isolation techniques that inspired this implementation.

## Overview

-   `Params` maps DSL arguments (plain objects whose values are strings or string arrays) to named values.
-   `DslContext` keeps per-test sequences and global alias maps so test runs never clash.
-   Everything lives under `src/dsl/` and is exercised via Vitest.

## Getting Started

```bash
npm install
npm run test
```

## Usage

```ts
import { DslContext } from "./src/dsl/context/DslContext"
import { Params } from "./src/dsl/params/Params"

const context = new DslContext()
const params = new Params(context, {
    name: "ResourceName",
    tags: ["tag-a", "tag-b"],
    region: "us-east"
})

const uniqueName = params.alias("name")
const region = params.optional("region", "us-west")
const tags = params.optionalList("tags", ["default-tag"])
```

### Supported Argument Styles

-   `new Params(context, { name: "Alice", role: "Accountant" })`
-   `new Params(context, { tags: ["tag-a", "tag-b"] })`
-   `new Params(context, { tags: "tag-a,tag-b" })`

## Functional & Temporal Isolation

-   **Functional isolation**: Each DSL call generates fresh logical entities via per-context sequences. Defaults let tests spin up isolated data without reusing identifiers.
-   **Temporal isolation**: Aliasing ensures the same logical name maps to a unique value per run. Replaying a test leaves previous aliases untouched thanks to deterministic suffixes.

Together these properties allow suites to run in parallel against a long-lived SUT while staying deterministic and easy to rerun.

> ℹ️ `DslContext` keeps a static `globalSequenceNumbers` map that persists for the lifetime of the test process. Each new `DslContext` still pulls the next suffix from that shared counter, so reruns generate deterministic aliases without manual cleanup. Restarting the test runner recreates the map and naturally resets the sequence.

## Provided Methods

-   `optional(name, default)` – returns supplied value or default
-   `alias(name)` – enforces presence and returns unique alias per context
-   `optionalSequence(name, start)` – returns supplied value or numbered sequence
-   `optionalList(name, defaults)` – returns array of supplied values or defaults

## Tests

Use `npm run test` or `npx vitest --coverage` to run the suite.

## Example Test Fixture

```ts
// dsl/index.ts

import { DslContext } from "./utils/DslContext"
import { UserDsl } from "./user.dsl"
import { TodoDsl } from "./todo.dsl"
import { UIUserDriver } from "../protocol-driver/ui.user.driver"
import { UITodoDriver } from "../protocol-driver/ui.todo.driver"

export const createDsl = () => {
    const context = new DslContext()
    const userDriver = new UIUserDriver(global.page)
    const todoDriver = new UITodoDriver(global.page)

    return {
        user: new UserDsl(context, userDriver),
        todo: new TodoDsl(context, todoDriver)
    }
}
```

```ts
describe("User archives completed todos", () => {
    let dsl = createDsl()

    beforeEach(() => {
        dsl = createDsl()
    })

    it("archives a completed item", async () => {
        // Given
        await dsl.user.hasCompletedTodo({ name: "Buy milk" })

        // When
        await dsl.user.archives({ todo: "Buy milk" })

        // Then
        await dsl.todo.confirmInArchive({ name: "Buy milk" })
        await dsl.todo.confirmNotInActive({ name: "Buy milk" })
    })
})
```
