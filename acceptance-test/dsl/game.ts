import { boardDriver, gameDriver, type CliResult } from "../drivers"
import { DslContext } from "./utils/context"

export class GameDsl {
    private readonly context = new DslContext()

    public reset(): void {
        this.context.reset()
        void gameDriver.noGameInProgress()
    }

    // Given
    public async noGameInProgress(): Promise<void> {
        await gameDriver.noGameInProgress()
    }

    /**
     * Runs the CLI from a clean state and records the resulting transcript.
     */
    public async start(): Promise<void> {
        await gameDriver.start()
    }

    /**
     * Adds a move to the staged history without executing the CLI.
     * Useful for arranging the board before triggering a DSL action.
     */
    public addMove(position: number): void {
        gameDriver.collectScenarioMove(position)
    }

    // When
    public async startNewGame(): Promise<void> {
        await gameDriver.startNewGame()
    }

    /**
     * Replays the provided move history and stores the latest CLI result.
     * Accepts a numeric array for readability in tests.
     */
    public async applyMoves(moves: ReadonlyArray<number>): Promise<void> {
        await gameDriver.applyMoves(moves)
    }

    /**
     * Runs the CLI with the exact CSV string provided and returns the result.
     * Use when the scenario describes a full sequence of moves.
     */
    public async playMoves(movesCsv: string): Promise<CliResult> {
        return gameDriver.playMovesCsv(movesCsv)
    }

    public async playScenario(): Promise<CliResult> {
        return gameDriver.playScenario()
    }

    /**
     * Appends the raw input to the move history and executes the CLI,
     * simulating a player entering a non-numeric or otherwise invalid value.
     */
    public async enterInvalidInput(value: string): Promise<void> {
        await gameDriver.enterInvalidInput(value)
    }

    /**
     * Verifies the most recent CLI result produced a winner.
     */
    public confirmWinner(expected: "X" | "O"): void {
        gameDriver.confirmWinnerIs(expected)
    }

    /**
     * Confirms the latest CLI run rejected a move (non-zero exit code).
     */
    public confirmMoveRejected(): void {
        gameDriver.confirmMoveRejected()
    }

    /**
     * Ensures the CLI transcript advanced to the next player after a move.
     */
    public confirmMoveCompleted(): void {
        gameDriver.confirmMoveCompleted()
    }

    // Then – confirmations
    public confirmDraw(): void {
        gameDriver.confirmDraw()
    }

    public confirmShowsInvalidPosition(): void {
        gameDriver.confirmShowsInvalidPosition()
    }

    public confirmShowsInvalidInput(): void {
        gameDriver.confirmShowsInvalidInput()
    }

    public confirmShowsPositionTakenAt(position: number): void {
        gameDriver.confirmShowsPositionTakenAt(position)
    }

    public confirmOutputContains(text: string): void {
        gameDriver.confirmOutputContains(text)
    }

    public confirmExitCode(expected: number): void {
        gameDriver.confirmExitCode(expected)
    }

    public getLastResult(): CliResult {
        return gameDriver.getLastResult()
    }

    public confirmBoardIsEmpty(): void {
        boardDriver.confirmIsEmpty()
    }
}

export const game = new GameDsl()
