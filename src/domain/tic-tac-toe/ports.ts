import type { GameState, Player } from "./game"

export enum ExitReason {
    InvalidInput = "InvalidInput",
    OutOfRange = "OutOfRange",
    PositionTaken = "PositionTaken"
}

export type Presenter = {
    presentState: (state: GameState) => void
    presentError?: (message: string) => void
    presentHelp?: () => void
    presentGameOver?: (state: GameState) => void
    prompt?: (nextPlayer: Player) => void
    presentQuit?: () => void
    presentExit?: (reason: ExitReason) => void
}
