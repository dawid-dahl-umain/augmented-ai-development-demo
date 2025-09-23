# Feature Roadmap: Game End States

## Overview

Handle terminal game outcomes and messaging. Detect a draw when the board is full without a winner, prevent any further moves after game end (win or draw), and enable clear UI messages reflecting the final state.

## System View

No diagram needed - single-domain module with UI-agnostic state transitions; a thin UI layer renders messages and the board.

## Spec references

-   `specification-package/tictactoe-bdd-specification-package.md`
    -   Epic 4: Game End States
        -   Feature: Game ends in a draw
            -   Scenario: Board full with no winner → display "It's a draw!"; no further moves
        -   Feature: Game state management
            -   Scenario: Display current player's turn (covered)
            -   Scenario: Cannot make moves after game ends (extend to draw)

## Test Scenario Sequence

1. Board full with no winner ends the game as a draw
    - The final valid move fills the board, no winning line exists → game ends; outcome indicates no winner; suitable for UI to show "It's a draw!".
2. Prevent further moves after a draw
    - Any attempt to play after a draw is rejected; state remains unchanged; error communicates game-over (UI renders draw message).
3. Winner path remains unaffected (regression)
    - Re-run an existing win path to ensure winner detection and game-over behavior are unchanged.
4. Adapter/UI (separate suite): Display board after each valid move
    - Rendering shows updated marks and next-player prompt while game is in progress.
5. Adapter/UI (separate suite): End-of-game messaging
    - At game end (win or draw), renderer does not prompt for a turn; it shows the appropriate end message (e.g., "Player X wins!" or "It's a draw!").

## Boundaries & Dependencies

-   **External Systems**: None (unit tests mock I/O by design)
-   **Internal Patterns**: Pure, immutable domain transitions; arrow functions; no side effects in domain
-   **Integration Points**: UI text renderer consumes domain state to present board and messages

## Non-Functional Requirements

-   **Clarity**: End-state messages are concise and actionable
-   **Responsiveness**: Board/message updates occur immediately after a move

## Notes

-   Keep domain UI-agnostic: expose end state (game over without winner) rather than hard-coding UI strings; UI layer renders "It's a draw!".
-   Avoid prescribing new fields in the roadmap; let tests drive any domain surface needed to express draw state.
