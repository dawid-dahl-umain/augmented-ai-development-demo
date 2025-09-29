import { expect } from "vitest"
import type { GameDriver } from "./game"

const assertRowsMatch = (
    rows: ReadonlyArray<string>,
    expected: ReadonlyArray<string>
): void => {
    expected.forEach((line, index) => {
        if (rows[index] !== line)
            expect.fail(
                `Expected board row to be "${line}" but was "${
                    rows[index] ?? "undefined"
                }"`
            )
    })
}

const assertRowsContainOnlyNumbers = (rows: ReadonlyArray<string>): void => {
    if (rows.some(row => /[XO]/.test(row)))
        expect.fail("Expected board rows to be empty but found player marks")
}

const getCellValue = (
    rows: ReadonlyArray<string>,
    position: number
): string => {
    const rowIndex = Math.floor((position - 1) / 3)
    const colIndex = (position - 1) % 3
    const rowLineIndex = rowIndex * 2
    const rowLine = rows[rowLineIndex]

    if (!rowLine) expect.fail(`Missing board row for position ${position}`)

    const cells = rowLine.split("|").map(cell => cell.trim())
    const value = cells[colIndex]

    if (value === undefined)
        expect.fail(`Missing board cell for position ${position}`)

    return value
}

export class BoardDriver {
    public constructor(private readonly gameDriver: GameDriver) {}

    public async viewBoard(): Promise<void> {
        // Viewing is implicit; no additional CLI action required.
    }

    public confirmShowsGridWithPositionsNumberedOneThroughNine(): void {
        const rows = this.initialBoardRows()
        assertRowsMatch(rows, [
            "  1 | 2 | 3",
            " ---+---+---",
            "  4 | 5 | 6",
            " ---+---+---",
            "  7 | 8 | 9"
        ])
    }

    public confirmBoardStateDisplayed(): void {
        this.confirmShowsGridWithPositionsNumberedOneThroughNine()
    }

    public confirmUpdatedBoardDisplayed(): void {
        this.confirmShowsGridWithPositionsNumberedOneThroughNine()
    }

    public confirmAllPositionsAreEmpty(): void {
        const rows = this.initialBoardRows()
        assertRowsContainOnlyNumbers(rows)
    }

    public confirmIsEmpty(): void {
        this.confirmShowsGridWithPositionsNumberedOneThroughNine()
        this.confirmAllPositionsAreEmpty()
    }

    public confirmAllPositionsAvailable(): void {
        this.confirmShowsGridWithPositionsNumberedOneThroughNine()
    }

    public confirmPositionIsEmpty(position: number): void {
        const value = getCellValue(this.initialBoardRows(), position)
        if (value === "X" || value === "O")
            expect.fail(`Expected position ${position} to be empty`)
    }

    public confirmPositionContains(position: number, mark: "X" | "O"): void {
        const value = getCellValue(this.latestBoardRows(), position)
        if (value !== mark)
            expect.fail(`Expected position ${position} to contain ${mark}`)
    }

    private initialBoardRows = (): ReadonlyArray<string> =>
        this.gameDriver.extractInitialBoardRows()

    private latestBoardRows = (): ReadonlyArray<string> =>
        this.gameDriver.extractLatestBoardRows()
}
