import type { GameState, Player } from "./game"

export enum ExitReason {
    InvalidInput = "InvalidInput",
    OutOfRange = "OutOfRange",
    PositionTaken = "PositionTaken"
}

export interface StatePresenter {
    presentState: (state: GameState) => void
}

export interface ErrorPresenter {
    presentError: (message: string) => void
}

export interface HelpPresenter {
    presentHelp: () => void
}

export interface GameOverPresenter {
    presentGameOver: (state: GameState) => void
}

export interface PromptPresenter {
    prompt: (nextPlayer: Player) => void
}

export interface QuitPresenter {
    presentQuit: () => void
}

export interface ExitPresenter {
    presentExit: (reason: ExitReason) => void
}

export interface Presenter extends StatePresenter {
    presentError?: ErrorPresenter["presentError"]
    presentHelp?: HelpPresenter["presentHelp"]
    presentGameOver?: GameOverPresenter["presentGameOver"]
    prompt?: PromptPresenter["prompt"]
    presentQuit?: QuitPresenter["presentQuit"]
    presentExit?: ExitPresenter["presentExit"]
}
