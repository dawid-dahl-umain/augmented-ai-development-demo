# Driver Layer

## Directory layout

```text
protocol-driver/
├── cli/
│   ├── cli.ts                # Builds + runs the compiled CLI process
│   ├── driver.ts             # CLI ProtocolDriver implementation
│   ├── output-parser.ts      # Extracts board state from stdout
│   └── response-validator.ts # Assertion helpers for the CLI transcript
├── web/
│   ├── driver.ts             # Playwright-backed ProtocolDriver
│   └── runtime.ts            # Shared build/server/browser lifecycle
├── stubs/                    # Reserved for third-party doubles
├── factory.ts                # Protocol selection
├── index.ts                  # Public barrel export
└── interface.ts              # ProtocolDriver contract
```

Each acceptance spec constructs a fresh `ProtocolDriver` in its `beforeEach`, ensuring AAID isolation. The factory emits the appropriate driver at runtime based on `TEST_PROTOCOL`.

## Protocol abstraction

Executable specs and DSLs depend on a single contract:

```typescript
export interface ProtocolDriver {
  resetScenario(): Promise<void>
  startNewGame(): Promise<void>
  playMoves(moves: ReadonlyArray<number>): Promise<void>
  playMovesFromCsv(sequence: string): Promise<void>
  placeMark(position: number): Promise<void>
  submitInvalidInput(value: string): Promise<void>
  confirmInitialPlayer(expected: PlayerMark): Promise<void>
  confirmCurrentPlayer(expected: PlayerMark): Promise<void>
  confirmPositionEmpty(position: number): Promise<void>
  confirmPositionContains(position: number, mark: PlayerMark): Promise<void>
  confirmWinner(mark: PlayerMark): Promise<void>
  confirmDraw(): Promise<void>
  confirmMoveRejected(): Promise<void>
  confirmMoveCompleted(): Promise<void>
  confirmBoardTemplate(): Promise<void>
  confirmBoardIsEmpty(): Promise<void>
  confirmAllPositionsAreEmpty(): Promise<void>
  confirmTextInOutput(text: string): Promise<void>
  confirmExitCode(code: number): Promise<void>
}
```

Adding new protocols (API, additional UIs, etc.) only requires another implementation of this interface and a branch in `createProtocolDriver`.

## Assertion mechanism

Assertions are implemented in **Layer 3 (Protocol Driver)**. Methods starting with `confirm` (e.g., `confirmPositionContains`, `confirmWinner`) verify state by throwing `Error` on failure and returning normally on success. Since all methods return `Promise<void>`, errors propagate as rejected promises:

- **Success**: Method completes without throwing → promise resolves → test passes
- **Failure**: Method throws `Error` → promise rejects → test framework treats as failure

Error propagation flows upward through the layers:

```text
Layer 1 (Executable Specs) → Layer 2 (DSL) → Layer 3 (Protocol Driver) → throws Error
```

The test framework (Vitest) catches rejected promises and reports them as test failures. This applies to both CLI and web protocols; even when Playwright is used for browser automation, Vitest remains the test framework (Playwright is only used as a library within the Protocol Driver layer).

This keeps assertions framework-agnostic: drivers throw plain `Error` objects rather than relying on test framework assertion APIs.

## Connection to the Production-like SUT

- **CLI protocol** spawns the compiled binary (`node dist/index.js`) so tests exercise the same process users run in production.
- **Web protocol** serves the compiled frontend (`dist/` + `public/`) via the Node HTTP server and drives it through Playwright, just like a real browser session.

## CLI driver highlights

- Wraps the compiled CLI via `cli/cli.ts`, building the artifact on first use.
- Stores per-test state (`moveHistory`, `lastResult`) so assertions can interrogate the most recent transcript.
- Delegates all validations to `CliResponseValidator`, keeping checks framework-agnostic (plain `Error` throws).

## Web driver highlights

- Uses Playwright to interact with the browser UI while reusing the compiled bundle.
- `web/runtime.ts` exists because executable specs run under Vitest, not the Playwright test runner; it centralises build/server/browser setup and surface helpers such as `prepareWebPage`, `resolveHeadlessPreference`, and `describeHeadlessState`.
- The driver focuses purely on interaction/verification logic (`confirmStatus`, `confirmBoardHasNineCells`, etc.), keeping the lifecycle concerns isolated.

## Factory

```typescript
export const createProtocolDriver = (protocol: string): ProtocolDriver => {
  switch (protocol) {
    case "cli":
      announce("cli")
      return new CliDriver(new CliResponseValidator(new CliOutputParser()))
    case "web":
      announce(`web (${describeHeadlessState(resolveHeadlessPreference())})`)
      return new WebDriver()
    default:
      throw new Error(`Unknown protocol: ${protocol}`)
  }
}
```

Specs call `createProtocolDriver(process.env.TEST_PROTOCOL ?? "cli")` inside `beforeEach`, so switching protocols is strictly a runtime concern.
