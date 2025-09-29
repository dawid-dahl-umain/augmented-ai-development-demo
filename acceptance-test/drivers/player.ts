import type { BoardDriver } from "./board"
import type { GameDriver } from "./game"

type PlayerMarker = "X" | "O"

export class PlayerDriver {
    public constructor(
        private readonly boardDriver: BoardDriver,
        private readonly gameDriver: GameDriver
    ) {}

    public reset(): void {
        this.gameDriver.resetHistory()
    }

    public confirmTurn(player: PlayerMarker): void {
        this.gameDriver.confirmCurrentPlayerIs(player)
    }

    public confirmPositionEmpty(position: number): void {
        this.boardDriver.confirmPositionIsEmpty(position)
    }

    public async placeMark(
        player: PlayerMarker,
        position: number
    ): Promise<void> {
        this.gameDriver.collectScenarioMove(position)
        await this.gameDriver.playScenario()
    }

    public confirmPositionHasMark(position: number, mark: PlayerMarker): void {
        this.boardDriver.confirmPositionContains(position, mark)
    }

    public confirmNextTurn(player: PlayerMarker): void {
        this.gameDriver.confirmCurrentPlayerIs(player)
    }
}
