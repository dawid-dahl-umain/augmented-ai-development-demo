import { DslContext } from "./utils/context"
import { Params, ParamsArgs } from "./utils/params"
import type { CliDriver } from "../protocol-driver/cli-driver"

export class PlayerDsl {
    public constructor(
        private readonly context: DslContext,
        private readonly driver: CliDriver
    ) {}

    public async confirmStartsWith(id: "X" | "O"): Promise<void> {
        this.driver.confirmInitialPlayer(id)
    }

    public async confirmTurn(id: "X" | "O"): Promise<void> {
        this.driver.confirmCurrentPlayer(id)
    }

    public async confirmPositionEmpty(position: number): Promise<void> {
        this.driver.confirmPositionIsEmpty(position)
    }

    public async placeMark(_id: "X" | "O", position: number): Promise<void> {
        this.driver.addMove(String(position))
        await this.driver.executeAccumulatedMoves()
    }

    public async confirmPositionHasMark(
        id: "X" | "O",
        position: number
    ): Promise<void> {
        this.driver.confirmPositionContains(position, id)
    }

    public async confirmNextTurn(id: "X" | "O"): Promise<void> {
        this.driver.confirmCurrentPlayer(id)
    }

    public registerPlayer(args: ParamsArgs = {}): string {
        const params = new Params(this.context, { name: "Player", ...args })

        return params.alias("name")
    }

    public reset(): void {
        this.driver.clearMoves()
    }
}
