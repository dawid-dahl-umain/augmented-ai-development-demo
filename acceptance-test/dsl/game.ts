import type { DslContext } from "./utils/context"
import type { GameDriver } from "../drivers/game"
import type { BoardDriver } from "../drivers/board"
import type { CliResult } from "../drivers"

export class GameDsl {
    public constructor(
        private readonly _context: DslContext,
        private readonly gameDriver: GameDriver,
        private readonly boardDriver: BoardDriver
    ) {}

    // Given
    public async noGameInProgress(): Promise<void> {
        await this.gameDriver.noGameInProgress()
    }

    /**
     * Runs the CLI from a clean state and records the resulting transcript.
     */
    public async start(): Promise<void> {
        await this.gameDriver.start()
    }

    /**
     * Adds a move to the staged history without executing the CLI.
     * Useful for arranging the board before triggering a DSL action.
     */
    public addMove(position: number): void {
        this.gameDriver.collectScenarioMove(position)
    }

    // When
    public async startNewGame(): Promise<void> {
        await this.gameDriver.startNewGame()
    }

    /**
     * Replays the provided move history and stores the latest CLI result.
     * Accepts a numeric array for readability in tests.
     */
    public async applyMoves(moves: ReadonlyArray<number>): Promise<void> {
        await this.gameDriver.applyMoves(moves)
    }

    /**
     * Runs the CLI with the exact CSV string provided and returns the result.
     * Use when the scenario describes a full sequence of moves.
     */
    public async playMoves(movesCsv: string): Promise<CliResult> {
        return this.gameDriver.playMovesCsv(movesCsv)
    }

    public async playScenario(): Promise<CliResult> {
        return this.gameDriver.playScenario()
    }

    /**
     * Appends the raw input to the move history and executes the CLI,
     * simulating a player entering a non-numeric or otherwise invalid value.
     */
    public async enterInvalidInput(value: string): Promise<void> {
        await this.gameDriver.enterInvalidInput(value)
    }

    /**
     * Verifies the most recent CLI result produced a winner.
     */
    public confirmWinner(expected: "X" | "O"): void {
        this.gameDriver.confirmWinnerIs(expected)
    }

    /**
     * Confirms the latest CLI run rejected a move (non-zero exit code).
     */
    public confirmMoveRejected(): void {
        this.gameDriver.confirmMoveRejected()
    }

    /**
     * Ensures the CLI transcript advanced to the next player after a move.
     */
    public confirmMoveCompleted(): void {
        this.gameDriver.confirmMoveCompleted()
    }

    // Then – confirmations
    public confirmDraw(): void {
        this.gameDriver.confirmDraw()
    }

    public confirmShowsInvalidPosition(): void {
        this.gameDriver.confirmShowsInvalidPosition()
    }

    public confirmShowsInvalidInput(): void {
        this.gameDriver.confirmShowsInvalidInput()
    }

    public confirmShowsPositionTakenAt(position: number): void {
        this.gameDriver.confirmShowsPositionTakenAt(position)
    }

    public confirmOutputContains(text: string): void {
        this.gameDriver.confirmOutputContains(text)
    }

    public confirmExitCode(expected: number): void {
        this.gameDriver.confirmExitCode(expected)
    }

    public getLastResult(): CliResult {
        return this.gameDriver.getLastResult()
    }

    public confirmBoardIsEmpty(): void {
        this.boardDriver.confirmIsEmpty()
    }
}
