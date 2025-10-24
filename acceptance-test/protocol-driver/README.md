# Driver Layer

## Overview

The TicTacToe CLI is stateless: each invocation accepts `--moves <csv>` and returns the complete transcript. No state persists between runs.

## Architecture (Following Dave Farley's ATDD Patterns)

### One Driver Per Protocol

Single `CliDriver` handles all CLI interactions. All DSLs use this unified driver.

### State Management

**Two types of state, two homes:**

1. **Test Isolation** → `DslContext` (Dave's pattern exactly)

    - Aliased entity names (temporal isolation)
    - Sequence numbers (functional isolation)
    - **No SUT-specific state**

2. **SUT Interaction** → `CliDriver`
    - `lastResult`: Cached response from SUT
    - `moveHistory`: Accumulated inputs for SUT
    - Fresh per test

### Design

```typescript
export class CliDriver {
    private lastResult: CliResult | null = null
    private moveHistory: string[] = []

    public constructor(
        private readonly parser: CliOutputParser,
        private readonly validator: CliResponseValidator
    ) {}

    public async executeAccumulatedMoves(): Promise<void> {
        this.lastResult = await cliExecutor.run(["play", ...moves])
    }

    public confirmWinner(winner: "X" | "O"): void {
        this.validator.confirmWinner(this.ensureResult().stdout, winner)
    }
}
```

**Key benefits:**

- Test isolation via fresh driver instances
- Dependency injection for testability
- Stateful for convenience, scoped per test
- Matches Dave's pattern (no result parameters in tests)

### Composition Root

```typescript
export const createDsl = () => {
    const context = new DslContext()
    const parser = new CliOutputParser()
    const validator = new CliResponseValidator()
    const cliDriver = new CliDriver(parser, validator)

    return {
        board: new BoardDsl(context, cliDriver),
        game: new GameDsl(context, cliDriver),
        player: new PlayerDsl(context, cliDriver)
    }
}
```

Each test gets fresh instances:

- `DslContext` for isolation
- `CliDriver` for SUT interaction
- Independent DSLs sharing the same driver

### Internal Structure

```text
CliDriver
├── lastResult (SUT response cache)
├── moveHistory (SUT input accumulator)
├── parser (injected - extracts data from output)
└── validator (injected - validates expectations)
```

## Why This Works

1. **Isolation**: Fresh instances per test
2. **Clean API**: Tests use conversational DSL without result variables
3. **Dave's Pattern**: Matches his examples exactly
4. **Testability**: Dependencies injected for easy mocking
5. **Single Responsibility**: One driver for CLI protocol
