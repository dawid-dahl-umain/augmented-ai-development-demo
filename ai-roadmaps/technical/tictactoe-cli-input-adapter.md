# Technical Roadmap: TicTacToe CLI Input Adapter

## Overview

Input adapter that reads commands from a CLI source, validates and translates them into domain operations on TicTacToe, and notifies a presenter/output port about outcomes. Keeps rendering and formatting concerns out of scope by delegating output to an injected presenter.

## Element Type

Input Adapter

## Integration Points

-   **Connects to Domain**: Uses `TicTacToe.start()` and `TicTacToe.play(state, position)` to evolve `GameState`
-   **External Dependencies**: Line-oriented input source (e.g., Node readline); injected presenter/output port (no direct stdout)
-   **Data Flow**: CLI line → parse/validate → domain call (with current state) → presenter notification(s)

## Test Sequence (Adapter Responsibilities)

1. `start` presents initial state (no prior state required); may call prompt
2. `move 5` after start presents updated state (X at 5, O’s turn); may call prompt
3. Successive valid moves keep alternating turns (assert presenter called with new state; do not re-assert domain rules)
4. `move 10` maps domain error to presenter.presentError("Invalid position: choose 1-9"); state unchanged
5. `move 5` on taken cell maps to presenter.presentError("Position already taken"); state unchanged
6. `move abc` maps to presenter.presentError("Invalid input: enter a number 1-9"); state unchanged
7. Winning move: presents final state and calls presenter.presentGameOver with winner; further moves are ignored/no-op
8. Draw move: presents final state and calls presenter.presentGameOver for draw; further moves are ignored/no-op
9. `help` calls presenter.presentHelp; no state change
10. `quit` requests termination (runner concern); adapter signals via a presenter call or returned flag (to be decided)
11. Unknown command: calls presenter.presentError("Unknown command"); no state change
12. Empty/whitespace input: no-op (optional prompt)

## Test Strategy

-   **Primary approach**: Integration Tests
    -   Simulate line input with a fake input source (no real stdin)
    -   Inject a fake presenter; assert presenter method calls and arguments
    -   Use real domain logic (no mocking of `TicTacToe`)
    -   Do not write to console; all user-visible effects go through the presenter

## Technical Constraints

-   **Performance**: No constraints; operations complete in milliseconds
-   **Compatibility**: Node.js (ESM) on current project toolchain
-   **Security**: No sensitive data; local-only CLI

## Spec References

-   `specification-package/tictactoe-bdd-specification-package.md`
    -   Game initialization, making moves, win detection, draw detection, and game state rules

## Dependencies

-   **Depends on**: Domain API in `src/game.ts` (`TicTacToe`, `GameState`)
-   **Blocks**: CLI renderer/output adapter (to format and print to terminal)

## Notes

-   Keep the adapter headless: accept an injected presenter interface (e.g., `presentState`, `presentError`, `presentHelp`, `presentGameOver`, `prompt`).
-   Maintain current `GameState` internally and pass the new state to the presenter after each valid command.
-   Map domain errors directly to presenter error messages using domain constants (avoids duplication).
