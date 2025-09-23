import {
    TicTacToe,
    type GameState,
    PositionTakenError
} from "#src/domain/tic-tac-toe/game"
import type { Presenter } from "#src/domain/tic-tac-toe/ports"
import { ExitReason } from "#src/domain/tic-tac-toe/ports"

type StartCommand = { type: "start" }
type HelpCommand = { type: "help" }
type MoveCommand = { type: "move"; position: number }
type QuitCommand = { type: "quit" }
type NoopCommand = { type: "noop" }
type UnknownCommand = { type: "unknown" }
type Command =
    | StartCommand
    | HelpCommand
    | MoveCommand
    | QuitCommand
    | NoopCommand
    | UnknownCommand

export class CliInputAdapter {
    private current: GameState | null = null
    private readonly presenter: Presenter
    private static readonly UNKNOWN_COMMAND_MESSAGE = "Unknown command"

    public constructor(presenter: Presenter) {
        this.presenter = presenter
    }

    /** Parse a raw CLI line into a normalized command */
    private parseCommand(input: string): Command {
        const trimmed = input.trim()
        const lower = trimmed.toLowerCase()

        if (lower === "start") return { type: "start" }
        if (lower === "help") return { type: "help" }
        if (lower === "quit") return { type: "quit" }
        if (trimmed === "") return { type: "noop" }
        if (lower.startsWith("move ")) {
            const [, posStr] = trimmed.split(/\s+/, 2)
            return { type: "move", position: Number(posStr) }
        }

        return { type: "unknown" }
    }

    /** Handle a single line of CLI input */
    public handle(line: string): void {
        const command = this.parseCommand(line)

        switch (command.type) {
            case "start": {
                this.current = TicTacToe.start()
                this.presenter.presentState(this.current)

                return
            }

            case "help": {
                this.presenter.presentHelp?.()
                return
            }

            case "move": {
                if (this.current === null) return
                if (this.current.isOver) {
                    const message = this.current.winner
                        ? `Game is over. Player ${this.current.winner} won!`
                        : this.current.isDraw
                        ? "Game is over. It's a draw!"
                        : "Game is over."
                    this.presenter.presentError?.(message)
                    return
                }

                try {
                    this.current = TicTacToe.play(
                        this.current,
                        command.position
                    )

                    this.presenter.presentState(this.current)

                    if (this.current.isOver) {
                        this.presenter.presentGameOver?.(this.current)
                    }
                } catch (error) {
                    const message =
                        error instanceof PositionTakenError
                            ? `Position already taken at ${error.position}`
                            : error instanceof Error
                            ? error.message
                            : String(error)
                    if (error instanceof PositionTakenError)
                        this.presenter.presentExit?.(ExitReason.PositionTaken)
                    else if (
                        error instanceof Error &&
                        error.message === TicTacToe.ERROR_INVALID_INPUT
                    )
                        this.presenter.presentExit?.(ExitReason.InvalidInput)
                    else if (
                        error instanceof Error &&
                        error.message === TicTacToe.ERROR_INVALID_POSITION
                    )
                        this.presenter.presentExit?.(ExitReason.OutOfRange)
                    this.presenter.presentError?.(message)
                }
                return
            }
            case "quit": {
                this.presenter.presentQuit?.()
                return
            }
            case "noop": {
                // Intentionally do nothing
                return
            }
            case "unknown":
            default: {
                this.presenter.presentError?.(
                    CliInputAdapter.UNKNOWN_COMMAND_MESSAGE
                )
                return
            }
        }
    }
}
