# Technical Implementation Roadmap: CLI Runner (stdin/stdout)

## Overview

Small entrypoint that wires the CLI input adapter to a presenter and the generic CLI text renderer, manages the readline loop over stdin/stdout, and handles process termination. Keeps domain and rendering decoupled; runner owns only IO loop concerns.

## Element Type

Infrastructure / Runner (process boundary)

## System View

No diagram needed – line input → adapter.handle(line) → presenter → renderer → stdout. Runner manages lifecycle (start, quit).

## Integration Points

-   **Connects to Domain**: Indirectly via `CliInputAdapter` → `Presenter` port → renderer templates
-   **External Dependencies**: Node `readline` on `process.stdin`/`process.stdout`
-   **Data Flow**: stdin line → adapter.parse/handle → presenter calls → renderer writes to stdout

## Spec References

-   `specification-package/tictactoe-bdd-specification-package.md` (user flow)
-   Existing adapter tests (`src/adapters/cli/input/cli-input-adapter/cli-input-adapter.spec.ts`)
-   Renderer tests (`src/adapters/cli/output/cli-text-renderer/cli-text-renderer.spec.ts`)

## Test Sequence

1. starts, issues `start`, renders initial board and prompt, waits for input
2. processes `move 5`, renders updated board and prompt
3. processes invalid line (e.g., `move 10`), renders clear error; state unchanged
4. processes `help`, renders help; does not alter last state
5. processes winning sequence, renders final board and game-over message; ignores further moves
6. processes `quit`, renders goodbye and terminates loop (no further reads)
7. supports non-interactive `--moves 1,4,2,5,3`: runs to completion and exits

## Test Strategy

**Primary approach**: Integration Tests

-   Replace real stdin/stdout with fakes (or pass an input iterator and a capture writer)
-   Use real `CliInputAdapter`, real renderer with simple templates
-   Assert ordered writes and termination behavior

## Technical Constraints

-   **Performance**: N/A (interactive; per-line handling in milliseconds)
-   **Compatibility**: Node.js ESM
-   **Security**: Local-only IO; no sensitive data

## Dependencies

-   **Depends on**: `CliInputAdapter`, `createCliTextRenderer`, presenter mapping
-   **Enables**: End-to-end interactive gameplay from the terminal

## Notes

-   Runner should be thin; expose a function `runCli(io)` to make TDD easy and keep `src/index.ts` as a trivial delegator.
-   Keep templates minimal in runner tests; detailed formatting is covered by renderer tests.
