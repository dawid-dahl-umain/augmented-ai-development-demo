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

    public async confirmWinner(expected: PlayerMark): Promise<void> {
        await this.driver.confirmWinner(expected)
    }

    public async confirmDraw(): Promise<void> {
        await this.driver.confirmDraw()
    }

    public async confirmMoveRejected(): Promise<void> {
        await this.driver.confirmMoveRejected()
    }

    public async confirmMoveCompleted(): Promise<void> {
        await this.driver.confirmMoveCompleted()
    }

    public async confirmShowsInvalidPosition(): Promise<void> {
        await this.driver.confirmTextInOutput("Invalid position: choose 1-9")
    }

    public async confirmShowsInvalidInput(): Promise<void> {
        await this.driver.confirmTextInOutput(
            "Invalid input: enter a number 1-9"
        )
    }

    public async confirmShowsPositionTakenAt(position: number): Promise<void> {
        await this.driver.confirmTextInOutput(
            `Position already taken at ${position}`
        )
    }

    public async confirmOutputContains(text: string): Promise<void> {
        await this.driver.confirmTextInOutput(text)
    }

    public async confirmExitCode(expected: number): Promise<void> {
        await this.driver.confirmExitCode(expected)
    }

    public async confirmBoardIsEmpty(): Promise<void> {
        await this.driver.confirmBoardIsEmpty()
    }
}
