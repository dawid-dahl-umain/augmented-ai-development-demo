# Acceptance Test Suite

Acceptance tests follow the four-layer AAID blueprint:

- `executable-specs/`: business-facing scenarios using the DSL only
- `dsl/`: natural-language translation layer depending on the shared protocol driver interface
- `protocol-driver/`: protocol abstraction (`ProtocolDriver` interface, factory, CLI + web implementations)
- `sut/`: notes about the production-like target under test

## Runtime selection

Executable specs resolve the driver at runtime:

```typescript
beforeEach(() => {
  const protocol = process.env.TEST_PROTOCOL ?? "cli"
  const driver = createProtocolDriver(protocol)

  dsl = new Dsl(driver)
})
```

Set `TEST_PROTOCOL` to switch implementations. The default comes from the repository `.env` file (`cli`). Adding new protocols only requires another `ProtocolDriver` implementation and a new branch in `createProtocolDriver`.


> [!NOTE]
> Notice: Selecting of the protocol driver at runtime isn't a requirement. If your application
> only has one interface, then it's perfectly fine to have only one driver.

### Supported protocols

- `cli` – executes the compiled CLI binary (default)
- `web` – launches the static web UI through Playwright (requires browser installation)

Copy `.env.example` to `.env` (or adjust as needed) before running tests. The defaults keep the suite on the CLI driver in headless mode; override per run via environment variables. `UI_PORT` controls the local server port (default `5173`) and `UI_BASE_URL` lets you point the web driver at a different host while reusing the same port.

#### Web driver lifecycle

Even though each test constructs a new driver instance (to satisfy AAID isolation rules), heavy setup only happens once per process:

- The compiled bundle is built on first use and cached for the remainder of the run.
- The static server is started lazily and reused; if a server is already listening, the driver simply connects to it.
- A single Playwright browser launch is shared, with fresh contexts/pages created per test.

This design keeps per-test isolation while avoiding repeated build/startup costs.

> [!NOTE]
> Info: This is correct, but it's not strictly from Dave's advise. Basically you can do that, or not do that,
> it's fine both ways. I.e. You can rebundle assets for each test, or you might reuse them. You might restart
> the server, or you might start it once. You might create a fresh context page of playwright for each new test
> or you might reuse it.
> The goal here, is to make sure tests can execute in parallel (in a way that doesn't affect the result of the test),
> and that tests can be run in any order (in a way that doesn't affect the reuslt of the test). If you can achieve
> that, *by any means*, then you're good to go.

## Running tests

```bash
# install Playwright browsers once when using the web driver
pnpm playwright:install

# run acceptance tests with current protocol
pnpm test:at

# switch to web protocol (shell override example)
TEST_PROTOCOL=web pnpm test:at

# run web protocol with the browser visible
PLAYWRIGHT_HEADLESS=false TEST_PROTOCOL=web pnpm test:at

# open the Playwright inspector (also forces headed mode)
PWDEBUG=1 TEST_PROTOCOL=web pnpm test:at
```

The drivers build the application on first use, then reuse the compiled artifact for subsequent invocations. The web driver reuses the static server and browser across scenarios to reduce startup cost.
  
