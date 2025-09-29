import { CliDriver } from "../drivers/cli-driver"
import { CliOutputParser } from "../drivers/cli-output-parser"
import { CliResponseValidator } from "../drivers/cli-response-validator"
import { BoardDsl } from "./board"
import { GameDsl } from "./game"
import { PlayerDsl } from "./player"
import { DslContext } from "./utils/context"

export const createDsl = () => {
    const context = new DslContext()

    const parser = new CliOutputParser()
    const validator = new CliResponseValidator()
    const cliDriver = new CliDriver(parser, validator)

    return {
        board: new BoardDsl(context, cliDriver),
        game: new GameDsl(context, cliDriver),
        player: new PlayerDsl(context, cliDriver)
    }
}

export type Dsl = ReturnType<typeof createDsl>
