# Feature Roadmap: Player Makes a Move

## Overview

Enable players to place marks on the board following game rules. A valid move updates the board and alternates turns; invalid inputs are rejected with clear messages and state remains unchanged.

## System View

Pure domain functions update game state; any UI layer handles I/O. Domain remains UI-agnostic.

## Spec references

-   `specification-package/tictactoe-bdd-specification-package.md`
    -   Epic 2: Player makes a move
        -   Scenario: Valid move on empty cell
        -   Scenario: Alternate turns between players
        -   Scenario: Cannot place mark on occupied cell
        -   Scenario: Cannot place mark outside board
        -   Scenario: Cannot place mark with invalid input

## Test Scenario Sequence

> Focus on behavior (what), not implementation (how)

1. Valid move on empty cell updates board and switches turn to the other player
2. Alternate turns: after a valid move, the next valid move is by the other player
3. Occupied cell is rejected with message "Position already taken"; state and turn unchanged
4. Out-of-range position (not 1–9) is rejected with message "Invalid position: choose 1-9"; state and turn unchanged
5. Non-numeric input is rejected with message "Invalid input: enter a number 1-9"; state and turn unchanged

## Boundaries & Dependencies

-   **External Systems**: None for unit tests; UI concerns in separate integration tests
-   **Internal Patterns**: Pure functions, immutable state, arrow functions; follow existing style
-   **Integration Points**: A UI layer may orchestrate prompts/errors; domain tests remain pure

## Non-Functional Requirements

-   Clear, actionable error messages per spec

## Notes

-   Tests use only Given/When/Then comments, no loops/conditionals
-   Keep domain logic free of I/O; return results and errors explicitly
-   Maintain available positions consistently with board updates
-   Do not prescribe specific data structures or function names in tests
