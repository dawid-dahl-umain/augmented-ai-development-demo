import type { DslContext } from "./utils/context"
import type { CliDriver } from "../protocol-driver/cli-driver"
import type { CliResult } from "../protocol-driver"

export class GameDsl {
    public constructor(
        private readonly context: DslContext,
        private readonly driver: CliDriver
    ) {}

    public async noGameInProgress(): Promise<void> {
        this.driver.clearMoves()
    }

    public async start(): Promise<void> {
        this.driver.clearMoves()
        await this.driver.executeMoves([])
    }

    public async startNewGame(): Promise<void> {
        await this.start()
    }

    public addMove(position: number): void {
        this.driver.addMove(String(position))
    }

    public async applyMoves(moves: ReadonlyArray<number>): Promise<void> {
        this.driver.setMoveHistory(moves.map(String))
        await this.driver.executeAccumulatedMoves()
    }

    public async playMoves(movesCsv: string): Promise<void> {
        const moves =
            movesCsv.trim() === "" ? [] : movesCsv.split(",").map(m => m.trim())
        this.driver.setMoveHistory(moves)
        await this.driver.executeAccumulatedMoves()
    }

    public async playScenario(): Promise<void> {
        await this.driver.executeAccumulatedMoves()
    }

    public async enterInvalidInput(value: string): Promise<void> {
        this.driver.addMove(value)
        await this.driver.executeAccumulatedMoves()
    }

    public confirmWinner(expected: "X" | "O"): void {
        this.driver.confirmWinner(expected)
    }

    public confirmDraw(): void {
        this.driver.confirmDraw()
    }

    public confirmMoveRejected(): void {
        this.driver.confirmMoveRejected()
    }

    public confirmMoveCompleted(): void {
        this.driver.confirmMoveCompleted()
    }

    public confirmShowsInvalidPosition(): void {
        this.driver.confirmTextInOutput("Invalid position: choose 1-9")
    }

    public confirmShowsInvalidInput(): void {
        this.driver.confirmTextInOutput("Invalid input: enter a number 1-9")
    }

    public confirmShowsPositionTakenAt(position: number): void {
        this.driver.confirmTextInOutput(`Position already taken at ${position}`)
    }

    public confirmOutputContains(text: string): void {
        this.driver.confirmTextInOutput(text)
    }

    public confirmExitCode(expected: number): void {
        this.driver.confirmExitCode(expected)
    }

    public confirmBoardIsEmpty(): void {
        this.driver.confirmBoardDisplayed()
        this.driver.confirmAllPositionsAreEmpty()
    }

    public getLastResult(): CliResult {
        return this.driver.getLastResult()
    }
}
