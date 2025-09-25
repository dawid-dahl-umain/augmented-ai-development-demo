import { BoardDsl } from "./board"
import { GameDsl } from "./game"
import { PlayerDsl } from "./player"

export const board = new BoardDsl()
export const game = new GameDsl()
export const player = new PlayerDsl()

class Dsl {
    public readonly board = board
    public readonly game = game
    public readonly player = player

    public reset(): void {
        this.board.reset()
        this.game.reset()
        this.player.reset()
    }
}

export const dsl = new Dsl()
