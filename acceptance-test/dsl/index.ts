import { CliDriver } from "../protocol-driver/cli-driver"
import { CliOutputParser } from "../protocol-driver/cli-output-parser"
import { CliResponseValidator } from "../protocol-driver/cli-response-validator"
import { BoardDsl } from "./board"
import { GameDsl } from "./game"
import { PlayerDsl } from "./player"
import { DslContext } from "./utils/context"

export class Dsl {
    public readonly board: BoardDsl
    public readonly game: GameDsl
    public readonly player: PlayerDsl

    constructor() {
        const context = new DslContext()

        const parser = new CliOutputParser()
        const validator = new CliResponseValidator()
        const cliDriver = new CliDriver(parser, validator)

        this.board = new BoardDsl(context, cliDriver)
        this.game = new GameDsl(context, cliDriver)
        this.player = new PlayerDsl(context, cliDriver)
    }
}
