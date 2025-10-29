import type { ProtocolDriver } from "../protocol-driver"
import { BoardDsl } from "./board"
import { GameDsl } from "./game"
import { PlayerDsl } from "./player"
import { DslContext } from "./utils/context"

export class Dsl {
    public readonly board: BoardDsl
    public readonly game: GameDsl
    public readonly player: PlayerDsl

    constructor(driver: ProtocolDriver) {
        const context = new DslContext()

        this.board = new BoardDsl(context, driver)
        this.game = new GameDsl(context, driver)
        this.player = new PlayerDsl(context, driver)
    }
}
