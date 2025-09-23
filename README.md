# AAID: Augmented AI Development Demo

## Quick start

```bash
pnpm install
pnpm build
pnpm start
```

## CLI usage

-   **Run directly (build runs automatically)**

```bash
pnpm start -- --moves 1,4,2,5,3
# or
node dist/index.js --moves 1,4,2,5,3
```

## TicTacToe CLI

### Non-interactive run (current)

-   **Moves**: pass a comma-separated list via `--moves`
-   **Rendering**: by default, each state is printed as a 3×3 grid
    -   includes `Round N` and `[X|O] to move`
-   **Quiet mode**: add `--no-verbose` to print only outcomes/errors

### Start with predefined moves (non-interactive)

```bash
pnpm start -- --moves 1,4,2,5,3
# or
node dist/index.js --moves 1,4,2,5,3
```

-   Applies the moves and prints board states and outcome
-   Useful for quick verification or scripts

### Errors and validation

-   **Invalid input (non-numeric)**: `Invalid input: enter a number 1-9`
-   **Out of range (not 1-9)**: `Invalid position: choose 1-9`
-   **Position taken**: `Position already taken at N`

Errors do not advance the game state. In non-interactive runs, processing continues with subsequent moves.

### Game end behavior

-   **Win**: prints `Player X wins!` (or `Player O wins!`)
-   **Draw**: prints `It's a draw!`
-   **After game over**: additional moves are rejected with a final status message (e.g., `Game is over. Player X won!`)

### Example interactive session

```bash
$ pnpm start -- --moves 1,4,2,5,3

Round 0
X to move

  1 | 2 | 3
 ---+---+---
  4 | 5 | 6
 ---+---+---
  7 | 8 | 9

Round 1
O to move

  X | 2 | 3
 ---+---+---
  4 | 5 | 6
 ---+---+---
  7 | 8 | 9

...

Player X wins!
```

### Exit codes

-   **0**: normal termination (win, draw, quit, or completed non-interactive run)
-   **2**: invalid input (non-numeric)
-   **3**: invalid position (out of range)
-   **4**: position taken

## Scripts

-   **build**: compiles TypeScript to `dist`
-   **start**: runs the compiled CLI (`node dist/index.js`)
-   **test**: runs unit tests once
-   **test:watch**: runs unit tests in watch mode
-   **lint**: lints the codebase
-   **lint:fix**: lints and fixes issues
-   **check**: runs lint and tests together

## Architecture

```
aaid-demo/
  acceptance-test/
    drivers/           # runs compiled CLI (build-once per test run)
    dsl/               # Given/When/Then helpers
    executable-specs/  # end-to-end acceptance tests
  src/
    domain/
      tic-tac-toe/     # pure domain (UI-agnostic)
        ports.ts       # presenter contract (dependency inversion)
    adapters/
      cli/
        input/         # driving adapter (parses CLI lines → domain commands)
        output/        # driven adapter (Presenter impl: templates → text)
        runner/        # driving adapter/composer (argv/verbosity/exit codes)
    index.ts           # composition root (process argv → runner)
```

-   Domain is IO-free; adapters handle IO; index wires them.
    Adapter responsibilities (hexagonal):
    -   runner: driving adapter. Parses argv/flags, composes dependencies, provides a Presenter implementation (render + exit codes).
    -   input: driving adapter. Parses CLI commands (start/move/quit), advances domain state, reports via Presenter/ExitReason.
    -   output: driven adapter. Implements Presenter: templates → text; no state/policy.
    -   Domain remains UI-agnostic and free of I/O.
-   Acceptance tests execute the built CLI to validate real behavior.
