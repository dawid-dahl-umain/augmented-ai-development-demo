# Tic Tac Toe - BDD Specification Package

## Project Overview

A two-player Tic Tac Toe game (X and O) taking turns on a 3x3 grid. The system should handle basic gameplay, win detection, draw detection, and provide clear, timely feedback to players. The domain is UI-agnostic; any user interface may present the state and messages.

## Ubiquitous Language

- **Board**: A 3x3 grid where the game is played
- **Cell/Square**: An individual position on the board (positions 1-9)
- **Player**: Either X or O
- **Move**: Placing a mark (X or O) in an empty cell
- **Turn**: The current player's opportunity to make a move
- **Win**: Three marks in a row (horizontal, vertical, or diagonal)
- **Draw**: All cells filled with no winner

---

## Epic 1: Game Initialization

### Title: Start a new game

**User Story:**
As a player, I want to start a new game, so that I can play Tic Tac Toe with another player.

**Acceptance Criteria:**

#### Feature: Start a new game

##### Scenario: Initialize empty board

> **Given** no game is in progress
> **When** I start a new game
> **Then** the board should be empty
> **And** all 9 positions should be available
> **And** player X should go first

##### Scenario: Display initial board

> **Given** a new game has started
> **When** I view the board
> **Then** I should see a 3x3 grid with positions numbered 1-9
> **And** all positions should be empty

---

## Epic 2: Making Moves

### Title: Player makes a move

**User Story:**
As a player, I want to place my mark on the board, so that I can work towards winning the game.

**Acceptance Criteria:**

#### Feature: Player makes a move

##### Scenario: Valid move on empty cell

> **Given** it is player X's turn
> **And** position 5 is empty
> **When** player X places their mark at position 5
> **Then** position 5 should contain X
> **And** it should be player O's turn

##### Scenario: Alternate turns between players

> **Given** player X has just made a move
> **When** the move is completed
> **Then** it should be player O's turn
> **And** player O should be prompted to make a move

##### Scenario: Cannot place mark on occupied cell

> **Given** position 5 contains X
> **When** player O attempts to place at position 5
> **Then** the move should be rejected
> **And** an error message "Position already taken" should be shown
> **And** it should still be player O's turn

##### Scenario: Cannot place mark outside board

> **Given** it is player X's turn
> **When** player X attempts to place at position 10
> **Then** the move should be rejected
> **And** an error message "Invalid position: choose 1-9" should be shown
> **And** it should still be player X's turn

##### Scenario: Cannot place mark with invalid input

> **Given** it is player X's turn
> **When** player X enters "abc" as their position
> **Then** the move should be rejected
> **And** an error message "Invalid input: enter a number 1-9" should be shown
> **And** it should still be player X's turn

---

## Epic 3: Win Detection

### Title: Player wins the game

**User Story:**
As a player, I want the game to detect when I've won, so that the game can end and declare me the winner.

**Acceptance Criteria:**

#### Feature: Player wins the game

##### Scenario: Win with horizontal line (top row)

> **Given** the board state is:
>
> ```
> | 1:X | 2:X | 3:_ |
> | 4:O | 5:O | 6:_ |
> | 7:_ | 8:_ | 9:_ |
> ```
>
> **And** it is player X's turn
> **When** player X places at position 3
> **Then** player X should win the game
> **And** the game should display "Player X wins!"
> **And** no further moves should be allowed

##### Scenario: Win with vertical line (middle column)

> **Given** the board state is:
>
> ```
> | 1:X | 2:O | 3:X |
> | 4:_ | 5:O | 6:_ |
> | 7:_ | 8:_ | 9:_ |
> ```
>
> **And** it is player O's turn
> **When** player O places at position 8
> **Then** player O should win the game
> **And** the game should display "Player O wins!"
> **And** no further moves should be allowed

##### Scenario: Win with diagonal line (top-left to bottom-right)

> **Given** the board state is:
>
> ```
> | 1:X | 2:O | 3:_ |
> | 4:O | 5:X | 6:_ |
> | 7:_ | 8:_ | 9:_ |
> ```
>
> **And** it is player X's turn
> **When** player X places at position 9
> **Then** player X should win the game
> **And** the game should display "Player X wins!"
> **And** no further moves should be allowed

##### Scenario: Win with diagonal line (top-right to bottom-left)

> **Given** the board state is:
>
> ```
> | 1:O | 2:X | 3:X |
> | 4:_ | 5:X | 6:O |
> | 7:_ | 8:_ | 9:_ |
> ```
>
> **And** it is player X's turn
> **When** player X places at position 7
> **Then** player X should win the game
> **And** the game should display "Player X wins!"
> **And** no further moves should be allowed

---

## Epic 4: Game End States

### Title: Game ends in a draw

**User Story:**
As a player, I want the game to detect when it's a draw, so that we know the game has ended without a winner.

**Acceptance Criteria:**

#### Feature: Game ends in a draw

##### Scenario: Board full with no winner

> **Given** the board state is:
>
> ```
> | 1:X | 2:O | 3:X |
> | 4:X | 5:O | 6:O |
> | 7:O | 8:X | 9:_ |
> ```
>
> **And** it is player X's turn
> **When** player X places at position 9
> **Then** the game should end in a draw
> **And** the game should display "It's a draw!"
> **And** no further moves should be allowed

### Title: Game state management

**User Story:**
As a player, I want to know the current game state, so that I can make informed decisions.

**Acceptance Criteria:**

#### Feature: Game state management

##### Scenario: Display current player's turn

> **Given** it is player O's turn
> **When** I view the game state
> **Then** I should see "Player O's turn"
> **And** the current board state should be displayed

##### Scenario: Cannot make moves after game ends

> **Given** the game has ended with player X winning
> **When** player O attempts to make a move
> **Then** the move should be rejected
> **And** a message "Game is over. Player X won!" should be shown

---

## Technical Acceptance Criteria (Non-functional)

### Title: Game input/output

**User Story:**
As a player, I want clear and responsive game interaction, so that I can play smoothly.

**Acceptance Criteria:**

#### Feature: Player feedback via user interface

##### Scenario: Display board after each move

> **Given** a game is in progress
> **When** any player makes a valid move
> **Then** the updated board should be presented immediately
> **And** the next player should be prompted

##### Scenario: Clear error messages

> **Given** a player makes an invalid move
> **When** the error is presented
> **Then** the message should be clear and actionable
> **And** the player should be prompted to try again

---

## Board Position Mapping (UI-agnostic)

```
 1 | 2 | 3
-----------
 4 | 5 | 6
-----------
 7 | 8 | 9
```

This diagram is illustrative only. User interfaces may render the board in any format.

## Implementation Notes

- The domain is UI-agnostic and free of I/O
- A user interface (CLI, GUI, or web) may collect positions (1–9) and present state
- The board should be presented after each valid move
- Clear messages for game state changes
- Interface specifics are out of scope for domain behavior

## Out of Scope (for this demo)

- AI opponent
- Network play
- Save/load game state
- Undo moves
- Score tracking across multiple games
- GUI interface
