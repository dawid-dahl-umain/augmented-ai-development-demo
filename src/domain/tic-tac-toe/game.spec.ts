import { describe, it, expect } from "vitest"
import { TicTacToe } from "#src/domain/tic-tac-toe/game"

describe("Start a new game", () => {
    it("initializes empty board and sets player X to start", () => {
        // When
        const game = TicTacToe.start()

        // Then
        expect(game.currentPlayer).toBe("X")
        expect(game.availablePositions).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9])
    })
})

describe("Player makes a move", () => {
    it("places mark on empty cell and switches turn", () => {
        // Given
        const initialState = TicTacToe.start()

        // When
        const next = TicTacToe.play(initialState, 5)

        // Then
        expect(next.board[5]).toBe("X")
        expect(next.currentPlayer).toBe("O")
        expect(next.availablePositions).toEqual([1, 2, 3, 4, 6, 7, 8, 9])
    })

    it("alternates turns between players after each valid move", () => {
        // Given
        const initialState = TicTacToe.start()

        // When
        const afterFirstMove = TicTacToe.play(initialState, 1)
        const afterSecondMove = TicTacToe.play(afterFirstMove, 2)
        const afterThirdMove = TicTacToe.play(afterSecondMove, 3)

        // Then
        expect(afterFirstMove.currentPlayer).toBe("O")
        expect(afterSecondMove.currentPlayer).toBe("X")
        expect(afterThirdMove.currentPlayer).toBe("O")
    })

    it("rejects placing a mark on an occupied cell and keeps turn", () => {
        // Given
        const initialState = TicTacToe.start()
        const afterFirstMove = TicTacToe.play(initialState, 5)
        expect(afterFirstMove.board[5]).toBe("X")
        expect(afterFirstMove.currentPlayer).toBe("O")

        // When
        const attemptOccupied = () => TicTacToe.play(afterFirstMove, 5)

        // Then
        expect(attemptOccupied).toThrow("Position already taken")
        const afterSecondMove = TicTacToe.play(afterFirstMove, 6)
        expect(afterSecondMove.board[6]).toBe("O")
        expect(afterSecondMove.currentPlayer).toBe("X")
        expect(afterSecondMove.availablePositions).toEqual([
            1, 2, 3, 4, 7, 8, 9
        ])
    })

    it.each([0, 10])("rejects position outside 1-9: %s", invalid => {
        // Given
        const initialState = TicTacToe.start()

        // When
        const attempt = () => TicTacToe.play(initialState, invalid)

        // Then
        expect(attempt).toThrowError(/invalid position/i)
    })

    it("rejects non-numeric input with a clear error", () => {
        // Given
        const initialState = TicTacToe.start()

        // When
        // @ts-expect-error intentionally passing non-numeric to simulate CLI parse error reaching domain
        const attemptAlpha = () => TicTacToe.play(initialState, "abc")
        const attemptEmpty = () =>
            TicTacToe.play(initialState, NaN as unknown as number)

        // Then
        expect(attemptAlpha).toThrowError(/invalid input/i)
        expect(attemptEmpty).toThrowError(/invalid input/i)
        const afterValidMove = TicTacToe.play(initialState, 1)
        expect(afterValidMove.board[1]).toBe("X")
        expect(afterValidMove.currentPlayer).toBe("O")
    })
})

describe("Win detection", () => {
    it.each([
        {
            scenario: "top row 1-2-3 results in X winning",
            moves: [1, 4, 2, 5, 3],
            winner: "X"
        },
        {
            scenario: "middle column 2-5-8 results in O winning",
            moves: [1, 2, 3, 5, 7, 8],
            winner: "O"
        },
        {
            scenario:
                "diagonal from top-left to bottom-right results in X winning",
            moves: [1, 2, 5, 3, 9],
            winner: "X"
        },
        {
            scenario:
                "diagonal from top-right to bottom-left results in X winning",
            moves: [3, 1, 5, 2, 7],
            winner: "X"
        }
    ])("declares winner when %s", ({ moves, winner }) => {
        // Given
        const initialState = TicTacToe.start()

        // When
        const finalState = TicTacToe.play(initialState, ...(moves as number[]))

        // Then
        expect(finalState.isOver).toBe(true)

        // And
        expect(finalState.winner).toBe(winner)
    })

    it("does not allow further moves after a win (no-op)", () => {
        // Given
        const winningState = TicTacToe.play(TicTacToe.start(), 1, 4, 2, 5, 3)

        // When
        const afterNoOp = TicTacToe.play(winningState, 6)

        // Then
        expect(afterNoOp).toEqual(winningState)

        // And
        expect(afterNoOp.isOver).toBe(true)
    })
})

describe("Draw detection", () => {
    it("ends the game as a draw when the board is full without a winner", () => {
        // Given
        const initialState = TicTacToe.start()

        // When
        const finalState = TicTacToe.play(
            initialState,
            1,
            2,
            3,
            5,
            6,
            4,
            7,
            9,
            8
        )

        // Then
        expect(finalState.isOver).toBe(true)

        // And
        expect(finalState.isDraw).toBe(true)
    })

    it("does not allow further moves after a draw (no-op)", () => {
        // Given
        const drawState = TicTacToe.play(
            TicTacToe.start(),
            1,
            2,
            3,
            5,
            6,
            4,
            7,
            9,
            8
        )

        // When
        const afterNoOp = TicTacToe.play(drawState, 1)

        // Then
        expect(afterNoOp).toEqual(drawState)

        // And
        expect(afterNoOp.isOver).toBe(true)
    })
})
