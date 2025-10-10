import type { DslContext } from "./utils/context"
import type { CliDriver } from "../protocol-driver/cli-driver"

export class BoardDsl {
    public constructor(
        private readonly context: DslContext,
        private readonly driver: CliDriver
    ) {}

    public viewBoard(): void {
        // Viewing is implicit in CLI output
    }

    public confirmShowsGridWithPositionsNumberedOneThroughNine(): void {
        this.driver.confirmBoardDisplayed()
    }

    public confirmBoardStateDisplayed(): void {
        this.confirmShowsGridWithPositionsNumberedOneThroughNine()
    }

    public confirmUpdatedBoardDisplayed(): void {
        this.confirmShowsGridWithPositionsNumberedOneThroughNine()
    }

    public confirmAllPositionsAreEmpty(): void {
        for (let position = 1; position <= 9; position++) {
            this.driver.isPositionEmpty(position)
        }
    }

    public confirmIsEmpty(): void {
        this.driver.confirmBoardDisplayed()
        this.driver.confirmAllPositionsAreEmpty()
    }

    public confirmAllPositionsAvailable(): void {
        this.confirmAllPositionsAreEmpty()
    }

    public isPositionEmpty(position: number): void {
        this.driver.isPositionEmpty(position)
    }

    public confirmPositionContains(position: number, mark: "X" | "O"): void {
        this.driver.confirmPositionContains(position, mark)
    }
}
