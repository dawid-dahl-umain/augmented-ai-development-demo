export type Player = "X" | "O"

export type GameState = {
    readonly currentPlayer: Player
    readonly availablePositions: ReadonlyArray<number>
    readonly board: ReadonlyArray<Player | undefined>
    readonly isOver: boolean
    readonly isDraw: boolean
    readonly winner?: Player
}

export class PositionTakenError extends Error {
    public readonly position: number

    public constructor(position: number) {
        super("Position already taken")
        this.name = "PositionTakenError"
        this.position = position
    }
}

/**
 * Pure Tic Tac Toe domain API.
 * State is immutable; use static methods to produce next states.
 */
export class TicTacToe {
    public static readonly INITIAL_PLAYER: Player = "X"
    public static readonly POSITIONS: ReadonlyArray<number> = [
        1, 2, 3, 4, 5, 6, 7, 8, 9
    ] as const
    public static readonly WIN_LINES = [
        // Rows
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9],
        // Columns
        [1, 4, 7],
        [2, 5, 8],
        [3, 6, 9],
        // Diagonals
        [1, 5, 9],
        [3, 5, 7]
    ] as const
    public static readonly MIN_POSITION = 1
    public static readonly MAX_POSITION = 9
    public static readonly ERROR_INVALID_POSITION =
        "Invalid position: choose 1-9"
    public static readonly ERROR_INVALID_INPUT =
        "Invalid input: enter a number 1-9"
    public static readonly ERROR_POSITION_TAKEN = "Position already taken"

    private static hasLineWin(
        board: ReadonlyArray<Player | undefined>,
        player: Player,
        line: ReadonlyArray<number>
    ): boolean {
        return line.every(position => board[position] === player)
    }

    /**
     * Create a new game state with an empty board and X to play.
     */
    public static start(): GameState {
        const state: GameState = {
            currentPlayer: TicTacToe.INITIAL_PLAYER,
            availablePositions: TicTacToe.POSITIONS,
            board: TicTacToe.newEmptyBoard(),
            isOver: false,
            isDraw: false
        }
        return state
    }

    private static newEmptyBoard(): ReadonlyArray<Player | undefined> {
        const board: Array<Player | undefined> = Array.from(
            { length: 10 },
            () => undefined
        )
        return board
    }

    private static switchPlayer(player: Player): Player {
        return player === "X" ? "O" : "X"
    }

    private static isValidNumericInput(value: unknown): value is number {
        return typeof value === "number" && Number.isFinite(value)
    }

    private static isValidPosition(position: number): boolean {
        return (
            position >= TicTacToe.MIN_POSITION &&
            position <= TicTacToe.MAX_POSITION
        )
    }

    private static computeNextState(
        prev: GameState,
        position: number
    ): GameState {
        const nextBoard: Array<Player | undefined> = prev.board.slice()
        nextBoard[position] = prev.currentPlayer

        const nextAvailablePositions = prev.availablePositions.filter(
            p => p !== position
        )

        const hasWin = TicTacToe.WIN_LINES.some(line =>
            TicTacToe.hasLineWin(nextBoard, prev.currentPlayer, line)
        )
        const isBoardFull = nextAvailablePositions.length === 0
        const winner = hasWin ? prev.currentPlayer : undefined
        const isDraw = !hasWin && isBoardFull
        const isOver = Boolean(winner) || isBoardFull
        const nextPlayer = isOver
            ? prev.currentPlayer
            : TicTacToe.switchPlayer(prev.currentPlayer)

        const nextState: GameState = {
            currentPlayer: nextPlayer,
            availablePositions: nextAvailablePositions,
            board: nextBoard,
            isOver,
            isDraw,
            winner
        }
        return nextState
    }

    /**
     * Apply a sequence of moves to a game state.
     * Throws on invalid input or illegal moves; no-ops after game end.
     */
    public static play(start: GameState, ...positions: number[]): GameState {
        return positions.reduce((state, position) => {
            if (state.isOver) return state

            if (!TicTacToe.isValidNumericInput(position))
                throw new Error(TicTacToe.ERROR_INVALID_INPUT)

            if (!TicTacToe.isValidPosition(position))
                throw new Error(TicTacToe.ERROR_INVALID_POSITION)

            if (state.board[position] !== undefined)
                throw new PositionTakenError(position)

            return TicTacToe.computeNextState(state, position)
        }, start)
    }
}
