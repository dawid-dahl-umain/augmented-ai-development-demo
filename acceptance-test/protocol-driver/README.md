# Driver Layer

## Overview

The TicTacToe CLI is stateless: each invocation accepts `--moves <csv>` and returns the complete transcript. No state persists between runs.

## Protocol abstraction

Executable specs and DSLs depend on the `ProtocolDriver` interface:

```typescript
export interface ProtocolDriver {
    resetScenario(): Promise<void>
    startNewGame(): Promise<void>
    playMoves(moves: ReadonlyArray<number>): Promise<void>
    playMovesFromCsv(sequence: string): Promise<void>
    placeMark(position: number): Promise<void>
    submitInvalidInput(value: string): Promise<void>
    confirmWinner(mark: PlayerMark): void
    confirmDraw(): void
    confirmMoveRejected(): void
    confirmMoveCompleted(): void
    confirmBoardTemplate(): void
    confirmBoardIsEmpty(): void
    confirmAllPositionsAreEmpty(): void
    confirmPositionEmpty(position: number): void
    confirmPositionContains(position: number, mark: PlayerMark): void
    confirmTextInOutput(text: string): void
    confirmExitCode(code: number): void
}
```

Adding new protocols (UI, API, etc.) only requires another implementation of this contract plus a branch in `createProtocolDriver`.

## CLI driver responsibilities

```typescript
export class CliDriver implements ProtocolDriver {
    private lastResult: CliResult | null = null
    private moveHistory: string[] = []

    public constructor(private readonly validator: CliResponseValidator) {}

    public async startNewGame(): Promise<void> {
        await this.resetScenario()
        await this.executeMoves([])
    }

    public async placeMark(position: number): Promise<void> {
        const nextHistory = [...this.moveHistory, String(position)]
        await this.executeMoves(nextHistory)
    }

    public confirmWinner(mark: PlayerMark): void {
        this.validator.confirmWinner(this.ensureResult().stdout, mark)
    }

    public confirmMoveRejected(): void {
        const result = this.ensureResult()
        if (result.code === 0) {
            throw new Error("Expected move rejection (non-zero exit code)")
        }
    }
}
```

-   **Stateful per test**: `moveHistory` captures the full sequence passed to the CLI, `lastResult` caches the latest transcript.
-   **All assertions here**: failures throw `Error`, keeping the layer framework-agnostic.
-   **Scenario control**: helper methods derive the next CSV payload so DSL steps remain declarative.

## Factory

```typescript
export const createProtocolDriver = (protocol: string): ProtocolDriver => {
    switch (protocol) {
        case "cli":
            return new CliDriver(
                new CliResponseValidator(new CliOutputParser())
            )
        default:
            throw new Error(`Unknown protocol: ${protocol}`)
    }
}
```

Specs resolve the driver in their `beforeEach`, so swapping to a different protocol is a runtime concern.
