import { driver } from "../drivers"

export type CliResult = { stdout: string; code: number }

let lastResult: CliResult | null = null
const scenarioMoves: number[] = []

export const game = {
    // Given
    noGameInProgress: async (): Promise<void> => {
        // implicit; no-op placeholder for readability
    },
    start: async (): Promise<void> => {
        // placeholder for interactive setup
    },
    addMove: (position: number): void => {
        scenarioMoves.push(position)
    },
    // When
    startNewGame: async (): Promise<void> => {
        // Run with a trivial move sequence to trigger initial board render on start
        const result = await driver.cli.run(["play", "--moves", "1"])
        lastResult = result
    },
    applyMoves: async (moves: ReadonlyArray<number>): Promise<void> => {
        const csv = moves.join(",")
        const result = await driver.cli.run(["play", "--moves", csv])
        lastResult = result
    },
    playMoves: async (movesCsv: string): Promise<CliResult> => {
        const result = await driver.cli.run(["play", "--moves", movesCsv])
        lastResult = result
        return result
    },
    playScenario: async (): Promise<CliResult> => {
        const result = await driver.cli.run([
            "play",
            "--moves",
            scenarioMoves.join(",")
        ])
        lastResult = result
        scenarioMoves.length = 0
        return result
    },
    // Then — confirmations
    confirmWinner: (expected: "X" | "O"): void => {
        if (!lastResult) throw new Error("No result to confirm")
        if (!lastResult.stdout.includes(`Player ${expected} wins!`)) {
            throw new Error(
                `Expected winner ${expected}, got output: ${lastResult.stdout}`
            )
        }
    },
    confirmDraw: (): void => {
        if (!lastResult) throw new Error("No result to confirm")
        if (!lastResult.stdout.includes("It's a draw!")) {
            throw new Error(`Expected draw, got output: ${lastResult.stdout}`)
        }
    },
    confirmShowsInvalidPosition: (): void => {
        if (!lastResult) throw new Error("No result to confirm")
        if (!lastResult.stdout.includes("Invalid position: choose 1-9")) {
            throw new Error("Expected invalid position message")
        }
    },
    confirmShowsInvalidInput: (): void => {
        if (!lastResult) throw new Error("No result to confirm")
        if (!lastResult.stdout.includes("Invalid input: enter a number 1-9")) {
            throw new Error("Expected invalid input message")
        }
    },
    confirmShowsPositionTakenAt: (position: number): void => {
        if (!lastResult) throw new Error("No result to confirm")
        if (
            !lastResult.stdout.includes(`Position already taken at ${position}`)
        ) {
            throw new Error("Expected position taken message")
        }
    },
    confirmOutputContains: (text: string): void => {
        if (!lastResult) throw new Error("No result to confirm")
        if (!lastResult.stdout.includes(text)) {
            throw new Error(`Expected output to contain: ${text}`)
        }
    },
    confirmExitCode: (expected: number): void => {
        if (!lastResult) throw new Error("No result to confirm")
        if (lastResult.code !== expected) {
            throw new Error(
                `Expected exit code ${expected}, got ${lastResult.code}`
            )
        }
    },
    getLastResult: (): CliResult => {
        if (!lastResult) throw new Error("No result captured")
        return lastResult
    }
}
