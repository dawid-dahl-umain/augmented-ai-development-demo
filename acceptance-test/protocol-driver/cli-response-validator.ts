import type { CliResult } from "./cli"
import { CliOutputParser } from "./cli-output-parser"

export class CliResponseValidator {
    public constructor(private readonly parser: CliOutputParser) {}

    private fail = (message: string): never => {
        throw new Error(message)
    }

    public confirmPositionContains(
        stdout: string,
        position: number,
        expectedMark: "X" | "O"
    ): void {
        const rows = this.parser.extractBoardRows(stdout, "latest")
        const actualMark = this.parser.getCellValue(rows, position)

        if (actualMark !== expectedMark) {
            this.fail(
                `Expected position ${position} to contain ${expectedMark}, but found ${actualMark}`
            )
        }
    }

    public isPositionEmpty(stdout: string, position: number): void {
        try {
            const rows = this.parser.extractBoardRows(stdout, "initial")
            const value = this.parser.getCellValue(rows, position)

            if (value === "X" || value === "O") {
                this.fail(
                    `Expected position ${position} to be empty, but found ${value}`
                )
            }
        } catch (error) {
            const errorMessage =
                error instanceof Error ? error.message : String(error)
            this.fail(
                `Failed to verify position ${position} is empty: ${errorMessage}`
            )
        }
    }

    public confirmCurrentPlayer(
        stdout: string,
        expectedPlayer: "X" | "O"
    ): void {
        const current = this.parser.getCurrentPlayer(stdout, "latest")

        if (current !== expectedPlayer) {
            this.fail(
                `Expected ${expectedPlayer} to move, got ${
                    current ?? "unknown"
                }`
            )
        }
    }

    public confirmInitialPlayer(
        stdout: string,
        expectedPlayer: "X" | "O"
    ): void {
        const initial = this.parser.getCurrentPlayer(stdout, "first")

        if (initial !== expectedPlayer) {
            this.fail(
                `Expected initial player ${expectedPlayer}, got ${
                    initial ?? "unknown"
                }`
            )
        }
    }

    public confirmWinner(stdout: string, expectedWinner: "X" | "O"): void {
        if (!stdout.includes(`Player ${expectedWinner} wins!`)) {
            this.fail(`Expected winner ${expectedWinner}, output: ${stdout}`)
        }
    }

    public confirmDraw(stdout: string): void {
        if (!stdout.includes("It's a draw!")) {
            this.fail(`Expected draw, output: ${stdout}`)
        }
    }

    public confirmTextInOutput(stdout: string, expectedText: string): void {
        if (!stdout.includes(expectedText)) {
            this.fail(`Expected output to contain: "${expectedText}"`)
        }
    }

    public confirmExitCode(result: CliResult, expectedCode: number): void {
        if (result.code !== expectedCode) {
            this.fail(`Expected exit code ${expectedCode}, got ${result.code}`)
        }
    }

    public confirmBoardDisplayed(stdout: string): void {
        try {
            const rows = this.parser.extractBoardRows(stdout, "initial")
            const expected = [
                "  1 | 2 | 3",
                " ---+---+---",
                "  4 | 5 | 6",
                " ---+---+---",
                "  7 | 8 | 9"
            ]

            expected.forEach((line, index) => {
                if (rows[index] !== line) {
                    this.fail(
                        `Expected board row to be "${line}" but was "${
                            rows[index] ?? "undefined"
                        }"`
                    )
                }
            })
        } catch (error) {
            const errorMessage =
                error instanceof Error ? error.message : String(error)
            this.fail(`Failed to verify board display: ${errorMessage}`)
        }
    }

    public confirmAllPositionsAreEmpty(stdout: string): void {
        const rows = this.parser.extractBoardRows(stdout, "initial")
        const hasMarks = rows.some(row => /[XO]/.test(row))

        if (hasMarks) {
            this.fail("Expected board rows to be empty but found player marks")
        }
    }

    public confirmMoveCompleted(stdout: string): void {
        const previous = this.parser.getCurrentPlayer(stdout, "first")
        const current = this.parser.getCurrentPlayer(stdout, "latest")

        if (previous === current) {
            this.fail("Expected turn to alternate after move")
        }
    }
}
