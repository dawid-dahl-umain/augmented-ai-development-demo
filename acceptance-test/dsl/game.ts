import type { PlayerMark, ProtocolDriver } from "../protocol-driver"
import type { DslContext } from "./utils/context"

export class GameDsl {
    public constructor(
        context: DslContext,
        private readonly driver: ProtocolDriver
    ) {
        void context
    }

    public async noGameInProgress(): Promise<void> {
        await this.driver.resetScenario()
    }

    public async start(): Promise<void> {
        await this.driver.startNewGame()
    }

    public async startNewGame(): Promise<void> {
        await this.driver.startNewGame()
    }

    public async applyMoves(moves: ReadonlyArray<number>): Promise<void> {
        await this.driver.playMoves(moves)
    }

    public async playMoves(movesCsv: string): Promise<void> {
        await this.driver.playMovesFromCsv(movesCsv)
    }

    public async enterInvalidInput(value: string): Promise<void> {
        await this.driver.submitInvalidInput(value)
    }

    public confirmWinner(expected: PlayerMark): void {
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
        this.driver.confirmBoardIsEmpty()
    }
}
