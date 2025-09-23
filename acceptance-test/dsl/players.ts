import { game } from "./game"

const makePlayer = () => ({
    moves: (position: number): void => {
        game.addMove(position)
    }
})

export const players = {
    X: makePlayer(),
    O: makePlayer()
}

export const player = {
    placesAt: async (_p: "X" | "O", pos: number): Promise<void> => {
        await game.applyMoves([pos])
    },
    confirmStartsWith: (p: "X" | "O"): void => {
        const out = game.getLastResult().stdout
        if (!out.includes(`${p} to move`))
            throw new Error(`Expected ${p} to start`)
    },
    confirmWinnerIs: (p: "X" | "O"): void => {
        game.confirmWinner(p)
    }
}
