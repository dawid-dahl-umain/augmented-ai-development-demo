import { beforeEach, describe, it } from "vitest"
import { createProtocolDriver } from "../protocol-driver"
import { Dsl } from "../dsl"

const protocol = process.env.TEST_PROTOCOL ?? "cli"
const isWebProtocol = protocol === "web"

let dsl: Dsl

beforeEach(() => {
    const driver = createProtocolDriver(protocol)

    dsl = new Dsl(driver)
})

describe("Epic: Game Initialization", () => {
    describe("Feature: Start a new game", () => {
        it("should initialize empty board", async () => {
            // Given
            await dsl.game.noGameInProgress()

            // When
            await dsl.game.startNewGame()

            // Then
            await dsl.board.confirmIsEmpty()

            // And
            await dsl.board.confirmAllPositionsAvailable()

            // And
            await dsl.player.confirmStartsWith("X")
        })

        it("should display initial board", async () => {
            // Given
            await dsl.game.startNewGame()

            // When
            dsl.board.viewBoard()

            // Then
            await dsl.board.confirmShowsGridWithPositionsNumberedOneThroughNine()

            // And
            await dsl.board.confirmAllPositionsAreEmpty()
        })
    })
})

describe("Epic: Making Moves", () => {
    describe("Feature: Player makes a move", () => {
        it("should accept a valid move on an empty cell", async () => {
            // Given
            await dsl.game.start()
            await dsl.player.isTurn("X")

            // And
            await dsl.board.isPositionEmpty(5)

            // When
            await dsl.player.placeMark("X", 5)

            // Then
            await dsl.board.confirmPositionContains(5, "X")

            // And
            await dsl.player.confirmNextTurn("O")
        })

        it("should alternate turns between players", async () => {
            // Given
            await dsl.game.start()
            await dsl.player.placeMark("X", 1)

            // When
            await dsl.game.confirmMoveCompleted()

            // Then
            await dsl.player.confirmNextTurn("O")

            // And
            await dsl.game.confirmOutputContains("O to move")
        })

        it("should not place mark on occupied cell", async () => {
            // Given
            await dsl.game.start()
            await dsl.player.placeMark("X", 5)
            await dsl.board.confirmPositionContains(5, "X")

            // When
            await dsl.player.placeMark("O", 5)

            // Then
            await dsl.game.confirmMoveRejected()

            // And
            await dsl.game.confirmOutputContains("Position already taken at 5")

            // And
            await dsl.player.isTurn("O")
        })

        // Web UI only exposes board positions 1-9, so this scenario is skipped there.
        it.skipIf(isWebProtocol)(
            "should not place mark outside board",
            async () => {
                // Given
                await dsl.game.start()
                await dsl.player.isTurn("X")

                // When
                await dsl.player.placeMark("X", 10)

                // Then
                await dsl.game.confirmMoveRejected()

                // And
                await dsl.game.confirmShowsInvalidPosition()

                // And
                await dsl.player.isTurn("X")
            }
        )

        // Web UI only accepts clicks on cells, so invalid text input cannot be exercised there.
        it.skipIf(isWebProtocol)(
            "should not place mark with invalid input",
            async () => {
                // Given
                await dsl.game.start()
                await dsl.player.isTurn("X")

                // When
                await dsl.game.enterInvalidInput("abc")

                // Then
                await dsl.game.confirmMoveRejected()

                // And
                await dsl.game.confirmShowsInvalidInput()

                // And
                await dsl.player.isTurn("X")
            }
        )
    })
})

describe("Epic: Win Detection", () => {
    describe("Feature: Player wins the game", () => {
        it("should win with horizontal line (top row)", async () => {
            // Given
            await dsl.game.start()
            await dsl.game.applyMoves([1, 4, 2, 5])
            await dsl.player.isTurn("X")

            // When
            await dsl.player.placeMark("X", 3)

            // Then
            await dsl.game.confirmWinner("X")

            // And
            await dsl.game.confirmOutputContains("Player X wins!")

            // And
            await dsl.game.playMoves("1,4,2,5,3,6")
            await dsl.game.confirmOutputContains("Game is over")
        })

        it("should win with vertical line (middle column)", async () => {
            // Given
            await dsl.game.start()

            // When
            await dsl.game.playMoves("1,3,4,7,8,5")

            // Then
            await dsl.game.confirmWinner("O")

            // And
            await dsl.game.confirmOutputContains("Player O wins!")

            // And
            await dsl.game.playMoves("1,3,4,7,8,5,9")
            await dsl.game.confirmOutputContains("Game is over")
        })

        it("should win with diagonal line (top-left to bottom-right)", async () => {
            // Given
            await dsl.game.start()
            await dsl.game.applyMoves([1, 2, 5, 6])
            await dsl.player.isTurn("X")

            // When
            await dsl.player.placeMark("X", 9)

            // Then
            await dsl.game.confirmWinner("X")

            // And
            await dsl.game.confirmOutputContains("Player X wins!")

            // And
            await dsl.game.playMoves("1,2,5,6,9,7")
            await dsl.game.confirmOutputContains("Game is over")
        })

        it("should win with diagonal line (top-right to bottom-left)", async () => {
            // Given
            await dsl.game.start()
            await dsl.game.applyMoves([3, 1, 5, 2])
            await dsl.player.isTurn("X")

            // When
            await dsl.player.placeMark("X", 7)

            // Then
            await dsl.game.confirmWinner("X")

            // And
            await dsl.game.confirmOutputContains("Player X wins!")

            // And
            await dsl.game.playMoves("3,1,5,2,7,4")
            await dsl.game.confirmOutputContains("Game is over")
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
            await dsl.game.confirmDraw()

            // And
            await dsl.game.confirmOutputContains("It's a draw!")

            // And
            await dsl.game.playMoves("1,2,3,5,6,4,7,9,8,1")
            await dsl.game.confirmOutputContains("Game is over")
        })
    })

    describe("Feature: Game state management", () => {
        it("should display current player's turn", async () => {
            // Given
            await dsl.game.start()

            // When
            await dsl.game.playMoves("1")

            // Then
            await dsl.game.confirmOutputContains("O to move")

            // And
            await dsl.board.confirmBoardStateDisplayed()
        })

        it("should not be possible to make moves after game ends", async () => {
            // Given
            await dsl.game.start()
            await dsl.game.playMoves("1,4,2,5,3")
            await dsl.game.confirmWinner("X")

            // When
            await dsl.game.playMoves("1,4,2,5,3,6")

            // Then
            await dsl.game.confirmOutputContains("Game is over")
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
            await dsl.board.confirmUpdatedBoardDisplayed()

            // And
            await dsl.game.confirmOutputContains("O to move")
        })

        // Web UI only allows board interaction via clicks, so invalid move text cannot be entered there.
        it.skipIf(isWebProtocol)("should clear error messages", async () => {
            // Given
            await dsl.game.start()

            // When
            await dsl.game.playMoves("10")

            // Then
            await dsl.game.confirmOutputContains("Invalid position: choose 1-9")

            // And
            await dsl.game.confirmOutputContains("X to move")
        })
    })
})
