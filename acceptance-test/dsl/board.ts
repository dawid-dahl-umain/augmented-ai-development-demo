import type { PlayerMark, ProtocolDriver } from "../protocol-driver"
import type { DslContext } from "./utils/context"

export class BoardDsl {
    public constructor(
        context: DslContext,
        private readonly driver: ProtocolDriver
    ) {
        void context
    }

    public viewBoard(): void {
        // Viewing is implicit in CLI output
    }

    public confirmShowsGridWithPositionsNumberedOneThroughNine(): void {
        this.driver.confirmBoardTemplate()
    }

    public confirmBoardStateDisplayed(): void {
        this.driver.confirmBoardTemplate()
    }

    public confirmUpdatedBoardDisplayed(): void {
        this.driver.confirmBoardTemplate()
    }

    public confirmAllPositionsAreEmpty(): void {
        this.driver.confirmAllPositionsAreEmpty()
    }

    public confirmIsEmpty(): void {
        this.driver.confirmBoardIsEmpty()
    }

    public confirmAllPositionsAvailable(): void {
        this.driver.confirmAllPositionsAreEmpty()
    }

    public isPositionEmpty(position: number): void {
        this.driver.confirmPositionEmpty(position)
    }

    public confirmPositionContains(position: number, mark: PlayerMark): void {
        this.driver.confirmPositionContains(position, mark)
    }
}
