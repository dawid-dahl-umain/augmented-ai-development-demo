# Acceptance Test Suite

Acceptance tests follow the four-layer AAID blueprint:

-   `executable-specs/`: business-facing scenarios using the DSL only
-   `dsl/`: natural-language translation layer depending on the shared protocol driver interface
-   `protocol-driver/`: protocol abstraction (`ProtocolDriver` interface, factory, CLI implementation)
-   `sut/`: notes about the production-like target under test

## Runtime selection

Executable specs resolve the driver at runtime:

```typescript
beforeEach(() => {
    const protocol = process.env.TEST_PROTOCOL ?? "cli"
    const driver = createProtocolDriver(protocol)
    dsl = new Dsl(driver)
})
```

Set `TEST_PROTOCOL` to switch implementations (currently `cli`). Adding new protocols only requires another `ProtocolDriver` implementation and a new branch in `createProtocolDriver`.

## Running tests

```bash
pnpm test:at
```

The CLI driver builds the application on first use, then reuses the compiled artifact for subsequent invocations.
