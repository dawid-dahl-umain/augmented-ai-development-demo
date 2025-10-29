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

    public async confirmShowsGridWithPositionsNumberedOneThroughNine(): Promise<void> {
        await this.driver.confirmBoardTemplate()
    }

    public async confirmBoardStateDisplayed(): Promise<void> {
        await this.driver.confirmBoardTemplate()
    }

    public async confirmUpdatedBoardDisplayed(): Promise<void> {
        await this.driver.confirmBoardTemplate()
    }

    public async confirmAllPositionsAreEmpty(): Promise<void> {
        await this.driver.confirmAllPositionsAreEmpty()
    }

    public async confirmIsEmpty(): Promise<void> {
        await this.driver.confirmBoardIsEmpty()
    }

    public async confirmAllPositionsAvailable(): Promise<void> {
        await this.driver.confirmAllPositionsAreEmpty()
    }

    public async isPositionEmpty(position: number): Promise<void> {
        await this.driver.confirmPositionEmpty(position)
    }

    public async confirmPositionContains(
        position: number,
        mark: PlayerMark
    ): Promise<void> {
        await this.driver.confirmPositionContains(position, mark)
    }
}
