import { boardDriver, gameDriver, playerDriver } from "../drivers"
import { DslContext } from "./utils/context"

export class PlayerDsl {
    private readonly context = new DslContext()

    public reset(): void {
        this.context.reset()
    }

    /**
     * Asserts which player starts the freshly initialised game.
     */
    public async confirmStartsWith(id: "X" | "O"): Promise<void> {
        gameDriver.confirmInitialPlayerIs(id)
    }

    /**
     * Confirms whose turn it is in the latest CLI transcript.
     */
    public async confirmTurn(id: "X" | "O"): Promise<void> {
        playerDriver.confirmTurn(id)
    }

    /**
     * Checks the board before a move is played.
     */
    public async confirmPositionEmpty(position: number): Promise<void> {
        boardDriver.confirmPositionIsEmpty(position)
    }

    /**
     * Records a move for the specified player and replays the CLI.
     */
    public async placeMark(id: "X" | "O", position: number): Promise<void> {
        await playerDriver.placeMark(id, position)
    }

    /**
     * Verifies the board state after a move has been applied.
     */
    public async confirmPositionHasMark(
        id: "X" | "O",
        position: number
    ): Promise<void> {
        boardDriver.confirmPositionContains(position, id)
    }

    /**
     * Checks whose turn follows the most recent move.
     */
    public async confirmNextTurn(id: "X" | "O"): Promise<void> {
        playerDriver.confirmNextTurn(id)
    }
}

export const player = new PlayerDsl()
