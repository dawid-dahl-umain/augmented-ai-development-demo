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

### Supported protocols

- `cli` – executes the compiled CLI binary (default)
- `web` – launches the static web UI through Playwright (requires browser installation)

Copy `.env.example` to `.env` (or adjust as needed) before running tests. The defaults keep the suite on the CLI driver in headless mode; override per run via environment variables.

#### Web driver lifecycle

Even though each test constructs a new driver instance (to satisfy AAID isolation rules), heavy setup only happens once per process:

- The compiled bundle is built on first use and cached for the remainder of the run.
- The static server is started lazily and reused; if a server is already listening, the driver simply connects to it.
- A single Playwright browser launch is shared, with fresh contexts/pages created per test.

This design keeps per-test isolation while avoiding repeated build/startup costs.

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
