import { describe, it, expect, vi } from "vitest"
import { TicTacToe } from "#src/domain/tic-tac-toe/game"
import { CliInputAdapter } from "./cli-input-adapter"

// NOTE: Technical adapter tests will be implemented incrementally via AAID TDD.
// We start with a skipped test list derived from the technical roadmap.

describe("CLI Input Adapter", () => {
    it("starts a new game on 'start' and presents initial state", () => {
        // Given
        const presenter = {
            presentState: vi.fn(),
            presentError: vi.fn(),
            presentHelp: vi.fn(),
            presentGameOver: vi.fn(),
            prompt: vi.fn()
        }
        const adapter = new CliInputAdapter(presenter)

        // When
        adapter.handle("start")

        // Then
        expect(presenter.presentState).toHaveBeenCalledWith(
            expect.objectContaining({
                currentPlayer: TicTacToe.INITIAL_PLAYER,
                isOver: false,
                isDraw: false,
                availablePositions: TicTacToe.POSITIONS
            })
        )
    })

    it("forwards the domain-produced state after 'move 5'", () => {
        // Given
        const presenter = {
            presentState: vi.fn(),
            presentError: vi.fn(),
            presentHelp: vi.fn(),
            presentGameOver: vi.fn(),
            prompt: vi.fn()
        }
        const adapter = new CliInputAdapter(presenter)

        // When
        adapter.handle("start")
        const stateAfterStart = presenter.presentState.mock.lastCall?.[0]
        adapter.handle("move 5")

        // Then
        const expectedNext = TicTacToe.play(stateAfterStart, 5)
        expect(presenter.presentState).toHaveBeenLastCalledWith(expectedNext)
    })

    it("forwards domain-produced states across successive valid moves", () => {
        // Given
        const presenter = {
            presentState: vi.fn(),
            presentError: vi.fn(),
            presentHelp: vi.fn(),
            presentGameOver: vi.fn(),
            prompt: vi.fn()
        }
        const adapter = new CliInputAdapter(presenter)

        // When
        adapter.handle("start")
        const s0 = presenter.presentState.mock.lastCall?.[0]

        adapter.handle("move 1")
        const s1 = presenter.presentState.mock.lastCall?.[0]
        const expected1 = TicTacToe.play(s0, 1)

        adapter.handle("move 2")
        const s2 = presenter.presentState.mock.lastCall?.[0]
        const expected2 = TicTacToe.play(s1, 2)

        adapter.handle("move 3")
        const s3 = presenter.presentState.mock.lastCall?.[0]
        const expected3 = TicTacToe.play(s2, 3)

        // Then
        expect(s1).toEqual(expected1)
        expect(s2).toEqual(expected2)
        expect(s3).toEqual(expected3)
    })

    it("rejects 'move 10' with 'Invalid position: choose 1-9'; state unchanged", () => {
        // Given
        const presenter = {
            presentState: vi.fn(),
            presentError: vi.fn(),
            presentHelp: vi.fn(),
            presentGameOver: vi.fn(),
            prompt: vi.fn()
        }
        const adapter = new CliInputAdapter(presenter)
        adapter.handle("start")
        const stateBeforeInvalidPosition =
            presenter.presentState.mock.lastCall?.[0]

        // When
        const act = () => adapter.handle("move 10")

        // Then
        expect(act).not.toThrow()
        expect(presenter.presentError).toHaveBeenCalledWith(
            TicTacToe.ERROR_INVALID_POSITION
        )
        expect(presenter.presentState.mock.lastCall?.[0]).toEqual(
            stateBeforeInvalidPosition
        )
    })

    it("rejects 'move 5' when taken and reports which position is taken; state unchanged", () => {
        // Given
        const presenter = {
            presentState: vi.fn(),
            presentError: vi.fn(),
            presentHelp: vi.fn(),
            presentGameOver: vi.fn(),
            prompt: vi.fn()
        }
        const adapter = new CliInputAdapter(presenter)
        adapter.handle("start")
        adapter.handle("move 5")
        const stateBeforeTakenError = presenter.presentState.mock.lastCall?.[0]

        // When
        const act = () => adapter.handle("move 5")

        // Then
        expect(act).not.toThrow()
        expect(presenter.presentError).toHaveBeenCalledWith(
            expect.stringContaining("Position already taken")
        )
        expect(presenter.presentState.mock.lastCall?.[0]).toEqual(
            stateBeforeTakenError
        )
    })

    it("includes the position number in the error when a taken cell is retried", () => {
        // Given
        const presenter = {
            presentState: vi.fn(),
            presentError: vi.fn(),
            presentHelp: vi.fn(),
            presentGameOver: vi.fn(),
            prompt: vi.fn()
        }
        const adapter = new CliInputAdapter(presenter)
        adapter.handle("start")
        adapter.handle("move 2")

        // When
        adapter.handle("move 2")

        // Then
        expect(presenter.presentError).toHaveBeenCalledWith(
            "Position already taken at 2"
        )
    })

    it("rejects 'move abc' with 'Invalid input: enter a number 1-9'; state unchanged", () => {
        // Given
        const presenter = {
            presentState: vi.fn(),
            presentError: vi.fn(),
            presentHelp: vi.fn(),
            presentGameOver: vi.fn(),
            prompt: vi.fn()
        }
        const adapter = new CliInputAdapter(presenter)
        adapter.handle("start")
        const stateBeforeInvalidInput =
            presenter.presentState.mock.lastCall?.[0]

        // When
        const act = () => adapter.handle("move abc")

        // Then
        expect(act).not.toThrow()
        expect(presenter.presentError).toHaveBeenCalledWith(
            TicTacToe.ERROR_INVALID_INPUT
        )
        expect(presenter.presentState.mock.lastCall?.[0]).toEqual(
            stateBeforeInvalidInput
        )
    })

    it("announces winner on winning move and signals game over", () => {
        // Given
        const presenter = {
            presentState: vi.fn(),
            presentError: vi.fn(),
            presentHelp: vi.fn(),
            presentGameOver: vi.fn(),
            prompt: vi.fn()
        }
        const adapter = new CliInputAdapter(presenter)

        // When
        adapter.handle("start")
        adapter.handle("move 1")
        adapter.handle("move 4")
        adapter.handle("move 2")
        adapter.handle("move 5")
        adapter.handle("move 3")

        // Then
        expect(presenter.presentGameOver).toHaveBeenCalledWith(
            expect.objectContaining({ isOver: true, winner: "X" })
        )
    })

    it("announces draw on full board without winner and signals game over", () => {
        // Given
        const presenter = {
            presentState: vi.fn(),
            presentError: vi.fn(),
            presentHelp: vi.fn(),
            presentGameOver: vi.fn(),
            prompt: vi.fn()
        }
        const adapter = new CliInputAdapter(presenter)

        // When
        adapter.handle("start")
        adapter.handle("move 1")
        adapter.handle("move 2")
        adapter.handle("move 3")
        adapter.handle("move 5")
        adapter.handle("move 6")
        adapter.handle("move 4")
        adapter.handle("move 7")
        adapter.handle("move 9")
        adapter.handle("move 8")

        // Then
        expect(presenter.presentGameOver).toHaveBeenCalledWith(
            expect.objectContaining({ isOver: true, isDraw: true })
        )
    })

    it("ignores further moves after game over and presents final message", () => {
        // Given
        const presenter = {
            presentState: vi.fn(),
            presentError: vi.fn(),
            presentHelp: vi.fn(),
            presentGameOver: vi.fn(),
            prompt: vi.fn()
        }
        const adapter = new CliInputAdapter(presenter)

        // When
        adapter.handle("start")
        adapter.handle("move 1")
        adapter.handle("move 4")
        adapter.handle("move 2")
        adapter.handle("move 5")
        adapter.handle("move 3")
        const callsAfterWin = presenter.presentState.mock.calls.length
        adapter.handle("move 6")

        // Then
        expect(presenter.presentState.mock.calls.length).toBe(callsAfterWin)
    })

    it("shows help on 'help' via presenter", () => {
        // Given
        const presenter = {
            presentState: vi.fn(),
            presentError: vi.fn(),
            presentHelp: vi.fn(),
            presentGameOver: vi.fn(),
            prompt: vi.fn()
        }
        const adapter = new CliInputAdapter(presenter)
        adapter.handle("start")
        const callsBefore = presenter.presentState.mock.calls.length

        // When
        adapter.handle("help")

        // Then
        expect(presenter.presentHelp).toHaveBeenCalled()
        expect(presenter.presentState.mock.calls.length).toBe(callsBefore)
    })

    it("exits cleanly on 'quit' (stops input loop)", () => {
        // Given
        const presenter = {
            presentState: vi.fn(),
            presentError: vi.fn(),
            presentHelp: vi.fn(),
            presentGameOver: vi.fn(),
            prompt: vi.fn(),
            presentQuit: vi.fn()
        }
        const adapter = new CliInputAdapter(presenter)

        // When
        adapter.handle("quit")

        // Then
        expect(presenter.presentQuit).toHaveBeenCalled()
        expect(presenter.presentState).not.toHaveBeenCalled()
    })

    it("handles unknown commands with a clear error", () => {
        // Given
        const presenter = {
            presentState: vi.fn(),
            presentError: vi.fn(),
            presentHelp: vi.fn(),
            presentGameOver: vi.fn(),
            prompt: vi.fn(),
            presentQuit: vi.fn()
        }
        const adapter = new CliInputAdapter(presenter)
        adapter.handle("start")
        const stateBefore = presenter.presentState.mock.lastCall?.[0]

        // When
        adapter.handle("foobar")

        // Then
        expect(presenter.presentError).toHaveBeenCalledWith("Unknown command")
        expect(presenter.presentState.mock.lastCall?.[0]).toEqual(stateBefore)
    })

    it("treats empty/whitespace input as no-op (optional prompt)", () => {
        // Given
        const presenter = {
            presentState: vi.fn(),
            presentError: vi.fn(),
            presentHelp: vi.fn(),
            presentGameOver: vi.fn(),
            prompt: vi.fn(),
            presentQuit: vi.fn()
        }
        const adapter = new CliInputAdapter(presenter)
        adapter.handle("start")
        const stateBefore = presenter.presentState.mock.lastCall?.[0]

        // When
        adapter.handle("   \t   ")

        // Then
        expect(presenter.presentError).not.toHaveBeenCalled()
        expect(presenter.presentState.mock.lastCall?.[0]).toEqual(stateBefore)
    })

    it("presents a business message when a move is attempted after game over", () => {
        // Given
        const presenter = {
            presentState: vi.fn(),
            presentError: vi.fn(),
            presentHelp: vi.fn(),
            presentGameOver: vi.fn(),
            prompt: vi.fn(),
            presentQuit: vi.fn()
        }
        const adapter = new CliInputAdapter(presenter)

        // When
        adapter.handle("start")
        adapter.handle("move 1")
        adapter.handle("move 4")
        adapter.handle("move 2")
        adapter.handle("move 5")
        adapter.handle("move 3") // X wins
        adapter.handle("move 6") // attempt after game over

        // Then
        expect(presenter.presentGameOver).toHaveBeenCalled()
        expect(presenter.presentError).toHaveBeenCalledWith(
            "Game is over. Player X won!"
        )
    })
})
