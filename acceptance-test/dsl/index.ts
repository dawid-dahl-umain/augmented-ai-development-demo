import { GameDriver } from "../drivers/game"
import { BoardDriver } from "../drivers/board"
import { PlayerDriver } from "../drivers/player"
import { BoardDsl } from "./board"
import { GameDsl } from "./game"
import { PlayerDsl } from "./player"
import { DslContext } from "./utils/context"

export const createDsl = () => {
    const context = new DslContext()

    const gameDriver = new GameDriver()
    const boardDriver = new BoardDriver(gameDriver)
    const playerDriver = new PlayerDriver(boardDriver, gameDriver)

    return {
        board: new BoardDsl(context, boardDriver),
        game: new GameDsl(context, gameDriver, boardDriver),
        player: new PlayerDsl(context, boardDriver, gameDriver, playerDriver)
    }
}

export type Dsl = ReturnType<typeof createDsl>
