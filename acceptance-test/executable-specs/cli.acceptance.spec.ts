import { describe, it } from "vitest"
import { dsl } from "../dsl"

// BDD acceptance suite generated from specification-package/tictactoe-bdd-specification-package.md

describe("Epic: Game Initialization", () => {
    describe("Feature: Start a new game", () => {
        it("should initialize empty board", async () => {
            // Given
            await dsl.game.noGameInProgress()

            // When
            await dsl.game.startNewGame()

            // Then
            dsl.board.confirmIsEmpty()

            // And
            dsl.board.confirmAllPositionsAvailable()

            // And
            dsl.player.confirmStartsWith("X")
        })

        it("should display initial board", async () => {
            // Given
            await dsl.game.start()

            // When
            await dsl.game.playRawMoves("1")

            // Then
            dsl.game.confirmOutputContains("---+---+---")
        })
    })
})

describe("Epic: Making Moves", () => {
    describe("Feature: Player makes a move", () => {
        it("should accept a valid move on an empty cell", async () => {
            // Given
            await dsl.game.start()

            // When
            await dsl.game.playRawMoves("5")

            // Then
            dsl.game.confirmOutputContains("  4 | X | 6")

            // And
            dsl.game.confirmOutputContains("O to move")
        })

        it("should alternate turns between players", async () => {
            // Given
            await dsl.game.start()

            // When
            await dsl.game.playRawMoves("1,2")

            // Then
            dsl.game.confirmOutputContains("Round 2")

            // And
            dsl.game.confirmOutputContains("X to move")
        })

        it("should not place mark on occupied cell", async () => {
            // Given
            await dsl.game.start()

            // When
            await dsl.game.playRawMoves("2,2")

            // Then
            dsl.game.confirmOutputContains("Position already taken at 2")
        })

        it("should not place mark outside board", async () => {
            // Given
            await dsl.game.start()

            // When
            await dsl.game.playRawMoves("10")

            // Then
            dsl.game.confirmOutputContains("Invalid position: choose 1-9")
        })

        it("should not place mark with invalid input", async () => {
            // Given
            await dsl.game.start()

            // When
            await dsl.game.playRawMoves("abc")

            // Then
            dsl.game.confirmOutputContains("Invalid input: enter a number 1-9")
        })
    })
})

describe("Epic: Win Detection", () => {
    describe("Feature: Player wins the game", () => {
        it("should win with horizontal line (top row)", async () => {
            // Given
            await dsl.game.start()

            // When
            await dsl.game.playRawMoves("1,4,2,5,3")

            // Then
            dsl.game.confirmOutputContains("Player X wins!")
        })

        it("should win with vertical line (middle column)", async () => {
            // Given
            await dsl.game.start()

            // When
            await dsl.game.playRawMoves("1,2,3,5,7,8")

            // Then
            dsl.game.confirmOutputContains("Player O wins!")
        })

        it("should win with diagonal line (top-left to bottom-right)", async () => {
            // Given
            await dsl.game.start()

            // When
            await dsl.game.playRawMoves("1,2,5,3,9")

            // Then
            dsl.game.confirmOutputContains("Player X wins!")
        })

        it("should win with diagonal line (top-right to bottom-left)", async () => {
            // Given
            await dsl.game.start()

            // When
            await dsl.game.playRawMoves("3,1,5,2,7")

            // Then
            dsl.game.confirmOutputContains("Player X wins!")
        })
    })
})

describe("Epic: Game End States", () => {
    describe("Feature: Game ends in a draw", () => {
        it("should end with board full and no winner", async () => {
            // Given
            await dsl.game.start()

            // When
            await dsl.game.playRawMoves("1,2,3,5,6,4,7,9,8")

            // Then
            dsl.game.confirmOutputContains("It's a draw!")
        })
    })

    describe("Feature: Game state management", () => {
        it("should display current player's turn", async () => {
            // Given
            await dsl.game.start()

            // When
            await dsl.game.playRawMoves("1")

            // Then
            dsl.game.confirmOutputContains("O to move")
        })

        it("should not be possible to make moves after game ends", async () => {
            // Given
            await dsl.game.start()

            // When
            await dsl.game.playRawMoves("1,4,2,5,3,6")

            // Then
            dsl.game.confirmOutputContains("Game is over. Player X won!")
        })
    })
})

describe("Epic: Technical Acceptance Criteria (Non-functional)", () => {
    describe("Feature: Player feedback via user interface", () => {
        it("should display board after each move", async () => {
            // Given
            await dsl.game.start()

            // When
            await dsl.game.playRawMoves("1,4,2")

            // Then
            dsl.game.confirmOutputContains("---+---+---")

            // And
            dsl.game.confirmOutputContains("Round 2")
        })

        it("should clear error messages", async () => {
            // Given
            await dsl.game.start()

            // When
            await dsl.game.playRawMoves("10")

            // Then
            dsl.game.confirmOutputContains("Invalid position: choose 1-9")
        })
    })
})
