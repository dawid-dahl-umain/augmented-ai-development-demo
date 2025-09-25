import { boardDriver, gameDriver } from "../drivers"

type PlayerMarker = "X" | "O"

export class PlayerDriver {
    public reset(): void {
        gameDriver.resetHistory()
    }

    public confirmTurn(player: PlayerMarker): void {
        gameDriver.confirmCurrentPlayerIs(player)
    }

    public confirmPositionEmpty(position: number): void {
        boardDriver.confirmPositionIsEmpty(position)
    }

    public async placeMark(
        player: PlayerMarker,
        position: number
    ): Promise<void> {
        gameDriver.collectScenarioMove(position)
        await gameDriver.playScenario()
    }

    public confirmPositionHasMark(position: number, mark: PlayerMarker): void {
        boardDriver.confirmPositionContains(position, mark)
    }

    public confirmNextTurn(player: PlayerMarker): void {
        gameDriver.confirmCurrentPlayerIs(player)
    }
}

export const playerDriver = new PlayerDriver()
