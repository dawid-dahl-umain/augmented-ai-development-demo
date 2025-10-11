# Feature Roadmap: Win Detection

## Overview

Detect when a player has three in a row and end the game, declaring the correct winner. Prevent further moves after a win and provide a clear winner message for the CLI.

## System View

Domain logic handles state transitions; a separate UI presents messages. Keep the domain UI-agnostic.

## Spec references

- specification-package/tictactoe-bdd-specification-package.md
  - Epic 3: Player wins the game
    - Scenario: Win with horizontal line (top row)
    - Scenario: Win with vertical line (middle column)
    - Scenario: Win with diagonal line (top-left to bottom-right)
    - Scenario: Win with diagonal line (top-right to bottom-left)

## Test Scenario Sequence

1. Horizontal top-row win: completing 1,2,3 declares winner and ends game
2. Vertical middle-column win: completing 2,5,8 declares winner and ends game
3. Diagonal top-left to bottom-right win: completing 1,5,9 declares winner and ends game
4. Diagonal top-right to bottom-left win: completing 3,5,7 declares winner and ends game
5. No further moves after win: attempts rejected with a game-over message; state unchanged

## Boundaries & Dependencies

- **External Systems**: None for unit tests; UI is covered by separate integration tests
- **Internal Patterns**: Immutable state transitions using pure functions
- **Integration Points**: A UI renderer may display "Player X wins!"; domain exposes state only

## Non-Functional Requirements

- Clear, concise winner message suitable for the chosen UI

## Notes

- Prefer asserting via state (winner flag/player) and message substrings rather than full string equality
- Strictly prevent additional moves once a winner exists; communicate game-over
