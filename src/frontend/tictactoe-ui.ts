/// <reference lib="dom" />

import {
    TicTacToe,
    PositionTakenError,
    type GameState
} from "../domain/tic-tac-toe/game"

interface Elements {
    board: HTMLElement
    status: HTMLElement
    message: HTMLElement
    restart: HTMLButtonElement
}

type CellButton = HTMLButtonElement & {
    dataset: DOMStringMap & { position: string }
}

const queryElements = (): Elements => {
    const board = document.querySelector<HTMLElement>("#board")
    const status = document.querySelector<HTMLElement>("#status")
    const message = document.querySelector<HTMLElement>("#message")
    const restart = document.querySelector<HTMLButtonElement>("#restart")

    if (!board || !status || !message || !restart)
        throw new Error("Missing expected UI elements")

    return { board, status, message, restart }
}

const createCell = (position: number, onClick: (position: number) => void) => {
    const button = document.createElement("button") as CellButton
    button.className = "cell"
    button.type = "button"
    button.dataset.position = String(position)
    button.setAttribute("role", "gridcell")
    button.setAttribute("aria-label", `Position ${position}`)
    button.addEventListener("click", () => onClick(position))
    return button
}

const formatStatus = (state: GameState): string => {
    if (state.isOver) {
        if (state.isDraw) return "It’s a draw!"
        return state.winner ? `Player ${state.winner} wins!` : "Game over"
    }

    return `Player ${state.currentPlayer} to move`
}

const findWinningLine = (
    state: GameState
): ReadonlyArray<number> | undefined => {
    if (!state.winner) return undefined
    return TicTacToe.WIN_LINES.find(line =>
        line.every(position => state.board[position] === state.winner)
    )
}

const disableCell = (cell: CellButton, disabled: boolean) => {
    cell.dataset.disabled = String(disabled)
    cell.ariaDisabled = disabled ? "true" : "false"
    cell.disabled = disabled
}

const render = (
    state: GameState,
    cells: ReadonlyArray<CellButton>,
    elements: Elements
) => {
    const winningLine = findWinningLine(state)

    cells.forEach(cell => {
        const position = Number(cell.dataset.position)
        const mark = state.board[position]
        cell.textContent = mark ?? ""
        const isFilled = Boolean(mark)
        const isDisabled = state.isOver || isFilled
        disableCell(cell, isDisabled)

        if (winningLine?.includes(position)) {
            cell.style.background = "#bbf7d0"
        } else if (isFilled) {
            cell.style.background = "#cbd5f5"
        } else {
            cell.style.background = "#e2e8f0"
        }
    })

    elements.status.textContent = formatStatus(state)
}

const showMessage = (elements: Elements, text: string) => {
    elements.message.textContent = text
}

const clearMessage = (elements: Elements) => {
    elements.message.textContent = ""
}

const playMove = (
    state: GameState,
    position: number,
    elements: Elements
): GameState => {
    if (state.isOver) return state

    try {
        const next = TicTacToe.play(state, position)
        clearMessage(elements)
        return next
    } catch (error) {
        if (error instanceof PositionTakenError) {
            showMessage(elements, `Position already taken at ${error.position}`)
            return state
        }

        if (error instanceof Error) {
            showMessage(elements, error.message)
            return state
        }

        showMessage(elements, "Something went wrong")
        return state
    }
}

const ready = () => {
    const elements = queryElements()
    let state: GameState = TicTacToe.start()

    const setState = (next: GameState) => {
        state = next
        render(state, cells, elements)
    }

    const cells = TicTacToe.POSITIONS.map(position =>
        createCell(position, clicked => {
            setState(playMove(state, clicked, elements))
        })
    )

    elements.board.replaceChildren(...cells)

    const startNewGame = () => {
        clearMessage(elements)
        setState(TicTacToe.start())
    }

    elements.restart.addEventListener("click", startNewGame)

    setState(state)
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", ready)
} else {
    ready()
}
