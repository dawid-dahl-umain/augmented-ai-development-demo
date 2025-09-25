import { boardDriver } from "../drivers"
import { DslContext } from "./utils/context"

export class BoardDsl {
    private readonly context = new DslContext()

    public reset(): void {
        this.context.reset()
        // board driver is stateless; no reset needed
    }

    public async viewBoard(): Promise<void> {
        await boardDriver.viewBoard()
    }

    public confirmShowsGridWithPositionsNumberedOneThroughNine(): void {
        boardDriver.confirmShowsGridWithPositionsNumberedOneThroughNine()
    }

    public confirmBoardStateDisplayed(): void {
        boardDriver.confirmShowsGridWithPositionsNumberedOneThroughNine()
    }

    public confirmUpdatedBoardDisplayed(): void {
        boardDriver.confirmShowsGridWithPositionsNumberedOneThroughNine()
    }

    public confirmAllPositionsAreEmpty(): void {
        boardDriver.confirmAllPositionsAreEmpty()
    }

    public confirmIsEmpty(): void {
        boardDriver.confirmIsEmpty()
    }

    public confirmAllPositionsAvailable(): void {
        boardDriver.confirmAllPositionsAvailable()
    }

    public confirmPositionIsEmpty(position: number): void {
        boardDriver.confirmPositionIsEmpty(position)
    }

    public confirmPositionContains(position: number, mark: "X" | "O"): void {
        boardDriver.confirmPositionContains(position, mark)
    }
}

export const board = new BoardDsl()
