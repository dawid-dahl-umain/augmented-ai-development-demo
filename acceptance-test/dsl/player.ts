import { DslContext } from "./utils/context"
import { Params, ParamsArgs } from "./utils/params"
import type { BoardDriver } from "../drivers/board"
import type { GameDriver } from "../drivers/game"
import type { PlayerDriver } from "../drivers/player"

export class PlayerDsl {
    public constructor(
        private readonly context: DslContext,
        private readonly boardDriver: BoardDriver,
        private readonly gameDriver: GameDriver,
        private readonly playerDriver: PlayerDriver
    ) {}

    /**
     * Asserts which player starts the freshly initialised game.
     */
    public async confirmStartsWith(id: "X" | "O"): Promise<void> {
        this.gameDriver.confirmInitialPlayerIs(id)
    }

    /**
     * Confirms whose turn it is in the latest CLI transcript.
     */
    public async confirmTurn(id: "X" | "O"): Promise<void> {
        this.playerDriver.confirmTurn(id)
    }

    /**
     * Checks the board before a move is played.
     */
    public async confirmPositionEmpty(position: number): Promise<void> {
        this.boardDriver.confirmPositionIsEmpty(position)
    }

    /**
     * Records a move for the specified player and replays the CLI.
     */
    public async placeMark(id: "X" | "O", position: number): Promise<void> {
        await this.playerDriver.placeMark(id, position)
    }

    /**
     * Verifies the board state after a move has been applied.
     */
    public async confirmPositionHasMark(
        id: "X" | "O",
        position: number
    ): Promise<void> {
        this.boardDriver.confirmPositionContains(position, id)
    }

    /**
     * Checks whose turn follows the most recent move.
     */
    public async confirmNextTurn(id: "X" | "O"): Promise<void> {
        this.playerDriver.confirmNextTurn(id)
    }

    public registerPlayer(args: ParamsArgs = {}): string {
        const params = new Params(this.context, { name: "Player", ...args })
        return params.alias("name")
    }
}
