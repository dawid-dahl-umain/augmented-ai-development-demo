import type { BoardDriver } from "../drivers/board"
import type { DslContext } from "./utils/context"

export class BoardDsl {
    public constructor(
        private readonly _context: DslContext,
        private readonly driver: BoardDriver
    ) {}

    public async viewBoard(): Promise<void> {
        await this.driver.viewBoard()
    }

    public confirmShowsGridWithPositionsNumberedOneThroughNine(): void {
        this.driver.confirmShowsGridWithPositionsNumberedOneThroughNine()
    }

    public confirmBoardStateDisplayed(): void {
        this.driver.confirmShowsGridWithPositionsNumberedOneThroughNine()
    }

    public confirmUpdatedBoardDisplayed(): void {
        this.driver.confirmShowsGridWithPositionsNumberedOneThroughNine()
    }

    public confirmAllPositionsAreEmpty(): void {
        this.driver.confirmAllPositionsAreEmpty()
    }

    public confirmIsEmpty(): void {
        this.driver.confirmIsEmpty()
    }

    public confirmAllPositionsAvailable(): void {
        this.driver.confirmAllPositionsAvailable()
    }

    public confirmPositionIsEmpty(position: number): void {
        this.driver.confirmPositionIsEmpty(position)
    }

    public confirmPositionContains(position: number, mark: "X" | "O"): void {
        this.driver.confirmPositionContains(position, mark)
    }
}
