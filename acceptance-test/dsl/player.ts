import type { PlayerMark, ProtocolDriver } from "../protocol-driver"
import { DslContext } from "./utils/context"

export class PlayerDsl {
    public constructor(
        context: DslContext,
        private readonly driver: ProtocolDriver
    ) {
        void context
    }

    public async confirmStartsWith(id: PlayerMark): Promise<void> {
        await this.driver.confirmInitialPlayer(id)
    }

    public async isTurn(id: PlayerMark): Promise<void> {
        await this.driver.confirmCurrentPlayer(id)
    }

    public async confirmPositionEmpty(position: number): Promise<void> {
        await this.driver.confirmPositionEmpty(position)
    }

    public async placeMark(_id: PlayerMark, position: number): Promise<void> {
        await this.driver.placeMark(position)
    }

    public async confirmPositionHasMark(
        id: PlayerMark,
        position: number
    ): Promise<void> {
        await this.driver.confirmPositionContains(position, id)
    }

    public async confirmNextTurn(id: PlayerMark): Promise<void> {
        await this.driver.confirmCurrentPlayer(id)
    }
}
