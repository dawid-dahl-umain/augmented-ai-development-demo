import { CliInputAdapter } from "#src/adapters/cli/input/cli-input-adapter/cli-input-adapter.js"
import { createCliTextRenderer } from "#src/adapters/cli/output/cli-text-renderer/cli-text-renderer.js"
import type { Presenter } from "#src/domain/tic-tac-toe/ports"
import { ExitReason } from "#src/domain/tic-tac-toe/ports"

type StateViewPayload = {
    board: ReadonlyArray<string | undefined>
    currentPlayer?: string
}

export class CliRunner {
    private createPresenter(verbose: boolean): {
        presenter: Presenter
        getExitCode: () => number
    } {
        const renderer = createCliTextRenderer({
            writer: { write: (text: string) => console.log(text) },
            templates: {
                gameOver: v => String(v.payload),
                error: v => String(v.payload),
                state: v =>
                    CliRunner.formatStateView(v.payload as StateViewPayload)
            },
            options: { newline: "\n" }
        })

        let exitCode = 0

        const presentState = (state: StateViewPayload): void => {
            if (!verbose) return
            renderer.render({ type: "state", payload: state })
        }
        const presentGameOver = (state: {
            winner?: string
            isDraw: boolean
        }): void => {
            const message = state.winner
                ? `Player ${state.winner} wins!`
                : state.isDraw
                ? "It's a draw!"
                : ""
            if (message) renderer.render({ type: "gameOver", payload: message })
        }
        const presentError = (message: string): void => {
            renderer.render({ type: "error", payload: message })
        }
        const presentExit = (reason: ExitReason): void => {
            const code =
                reason === ExitReason.InvalidInput
                    ? 2
                    : reason === ExitReason.OutOfRange
                    ? 3
                    : reason === ExitReason.PositionTaken
                    ? 4
                    : 0
            exitCode = Math.max(exitCode, code)
        }

        return {
            presenter: {
                presentState,
                presentGameOver,
                presentError,
                presentExit
            },
            getExitCode: () => exitCode
        }
    }

    public run(argv: ReadonlyArray<string>): number {
        const movesFlagIndex = argv.findIndex(a => a === "--moves")
        if (movesFlagIndex === -1) return 0

        const movesArg = argv[movesFlagIndex + 1] ?? ""
        const verbose = !argv.includes("--no-verbose")

        const moves =
            movesArg.trim() === ""
                ? []
                : movesArg.split(",").map(s => Number(s.trim()))

        const { presenter, getExitCode } = this.createPresenter(verbose)
        const adapter = new CliInputAdapter(presenter)

        adapter.handle("start")

        for (const move of moves) adapter.handle(`move ${move}`)

        return getExitCode()
    }

    private static formatStateView(s: StateViewPayload): string[] {
        const val = (i: number) => s.board[i] ?? String(i)
        const moves = s.board.filter(
            cell => cell === "X" || cell === "O"
        ).length
        return [
            `Round ${moves}`,
            s.currentPlayer ? `${s.currentPlayer} to move` : "",
            "",
            `  ${val(1)} | ${val(2)} | ${val(3)}`,
            " ---+---+---",
            `  ${val(4)} | ${val(5)} | ${val(6)}`,
            " ---+---+---",
            `  ${val(7)} | ${val(8)} | ${val(9)}`
        ]
    }
}
