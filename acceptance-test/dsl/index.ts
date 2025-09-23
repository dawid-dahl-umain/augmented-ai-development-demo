import { game } from "./game"
import { players, player } from "./players"

export const dsl = {
    game: {
        ...game
    },
    board: {
        confirmIsEmpty: (): void => {
            game.confirmOutputContains("  1 | 2 | 3")
            game.confirmOutputContains("  4 | 5 | 6")
            game.confirmOutputContains("  7 | 8 | 9")
        },
        confirmAllPositionsAvailable: (): void => {
            game.confirmOutputContains("  1 | 2 | 3")
            game.confirmOutputContains("  4 | 5 | 6")
            game.confirmOutputContains("  7 | 8 | 9")
        }
    },
    player: {
        ...player
    },
    players
}
