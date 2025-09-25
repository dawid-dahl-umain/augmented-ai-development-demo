import { describe, it } from "vitest"
import { dsl } from "../dsl"

// Specification: specification-package/tictactoe-bdd-specification-package.md

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
            await dsl.game.startNewGame()

            // When
            await dsl.board.viewBoard()

            // Then
            dsl.board.confirmShowsGridWithPositionsNumberedOneThroughNine()

            // And
            dsl.board.confirmAllPositionsAreEmpty()
        })
    })
})

describe("Epic: Making Moves", () => {
    describe("Feature: Player makes a move", () => {
        it("should accept a valid move on an empty cell", async () => {
            // Given
            await dsl.game.start()
            await dsl.player.confirmTurn("X")

            // And
            dsl.board.confirmPositionIsEmpty(5)

            // When
            await dsl.player.placeMark("X", 5)

            // Then
            dsl.board.confirmPositionContains(5, "X")

            // And
            await dsl.player.confirmNextTurn("O")
        })

        it("should alternate turns between players", async () => {
            // Given
            await dsl.game.start()
            await dsl.player.placeMark("X", 1)

            // When
            dsl.game.confirmMoveCompleted()

            // Then
            await dsl.player.confirmNextTurn("O")

            // And
            dsl.game.confirmOutputContains("O to move")
        })

        it("should not place mark on occupied cell", async () => {
            // Given
            await dsl.game.start()
            await dsl.player.placeMark("X", 5)
            await dsl.board.confirmPositionContains(5, "X")

            // When
            await dsl.player.placeMark("O", 5)

            // Then
            dsl.game.confirmMoveRejected()

            // And
            dsl.game.confirmOutputContains("Position already taken at 5")

            // And
            await dsl.player.confirmTurn("O")
        })

        it("should not place mark outside board", async () => {
            // Given
            await dsl.game.start()
            await dsl.player.confirmTurn("X")

            // When
            await dsl.player.placeMark("X", 10)

            // Then
            dsl.game.confirmMoveRejected()

            // And
            dsl.game.confirmShowsInvalidPosition()

            // And
            await dsl.player.confirmTurn("X")
        })

        it("should not place mark with invalid input", async () => {
            // Given
            await dsl.game.start()
            await dsl.player.confirmTurn("X")

            // When
            await dsl.game.enterInvalidInput("abc")

            // Then
            dsl.game.confirmMoveRejected()

            // And
            dsl.game.confirmShowsInvalidInput()

            // And
            await dsl.player.confirmTurn("X")
        })
    })
})

describe("Epic: Win Detection", () => {
    describe("Feature: Player wins the game", () => {
        it("should win with horizontal line (top row)", async () => {
            // Given
            await dsl.game.start()
            await dsl.game.applyMoves([1, 4, 2, 5])
            await dsl.player.confirmTurn("X")

            // When
            await dsl.player.placeMark("X", 3)

            // Then
            dsl.game.confirmWinner("X")

            // And
            dsl.game.confirmOutputContains("Player X wins!")

            // And
            await dsl.game.playMoves("1,4,2,5,3,6")
            dsl.game.confirmOutputContains("Game is over. Player X won!")
        })

        it("should win with vertical line (middle column)", async () => {
            // Given
            await dsl.game.start()

            // When
            await dsl.game.playMoves("1,3,4,7,8,5")

            // Then
            dsl.game.confirmWinner("O")

            // And
            dsl.game.confirmOutputContains("Player O wins!")

            // And
            await dsl.game.playMoves("1,3,4,7,8,5,9")
            dsl.game.confirmOutputContains("Game is over. Player O won!")
        })

        it("should win with diagonal line (top-left to bottom-right)", async () => {
            // Given
            await dsl.game.start()
            await dsl.game.applyMoves([1, 2, 5, 6])
            await dsl.player.confirmTurn("X")

            // When
            await dsl.player.placeMark("X", 9)

            // Then
            dsl.game.confirmWinner("X")

            // And
            dsl.game.confirmOutputContains("Player X wins!")

            // And
            await dsl.game.playMoves("1,2,5,6,9,7")
            dsl.game.confirmOutputContains("Game is over. Player X won!")
        })

        it("should win with diagonal line (top-right to bottom-left)", async () => {
            // Given
            await dsl.game.start()
            await dsl.game.applyMoves([3, 1, 5, 2])
            await dsl.player.confirmTurn("X")

            // When
            await dsl.player.placeMark("X", 7)

            // Then
            dsl.game.confirmWinner("X")

            // And
            dsl.game.confirmOutputContains("Player X wins!")

            // And
            await dsl.game.playMoves("3,1,5,2,7,4")
            dsl.game.confirmOutputContains("Game is over. Player X won!")
        })
    })
})

describe("Epic: Game End States", () => {
    describe("Feature: Game ends in a draw", () => {
        it("should end with board full and no winner", async () => {
            // Given
            await dsl.game.start()

            // When
            await dsl.game.playMoves("1,2,3,5,6,4,7,9,8")

            // Then
            dsl.game.confirmDraw()

            // And
            dsl.game.confirmOutputContains("It's a draw!")

            // And
            await dsl.game.playMoves("1,2,3,5,6,4,7,9,8,1")
            dsl.game.confirmOutputContains("Game is over. It's a draw!")
        })
    })

    describe("Feature: Game state management", () => {
        it("should display current player's turn", async () => {
            // Given
            await dsl.game.start()

            // When
            await dsl.game.playMoves("1")

            // Then
            dsl.game.confirmOutputContains("O to move")

            // And
            dsl.board.confirmBoardStateDisplayed()
        })

        it("should not be possible to make moves after game ends", async () => {
            // Given
            await dsl.game.start()
            await dsl.game.playMoves("1,4,2,5,3")

            // When
            await dsl.game.playMoves("1,4,2,5,3,6")

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
            await dsl.game.playMoves("1")

            // Then
            dsl.board.confirmUpdatedBoardDisplayed()

            // And
            dsl.game.confirmOutputContains("O to move")
        })

        it("should clear error messages", async () => {
            // Given
            await dsl.game.start()

            // When
            await dsl.game.playMoves("10")

            // Then
            dsl.game.confirmOutputContains("Invalid position: choose 1-9")

            // And
            dsl.game.confirmOutputContains("X to move")
        })
    })
})
