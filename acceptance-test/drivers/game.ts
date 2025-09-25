import { expect } from "vitest"
import { cliDriver, type CliResult } from "./cli"

type StateBlock = ReadonlyArray<string>

type Result = CliResult

class GameStateHelpers {
    public static parseStateBlocks(stdout: string): ReadonlyArray<StateBlock> {
        const chunks = stdout.split(/(Round \d+)/).slice(1)
        if (chunks.length === 0) expect.fail("No game state output captured")

        const blocks: Array<Array<string>> = []
        for (let i = 0; i < chunks.length; i += 2) {
            const header = chunks[i]
            const body = chunks[i + 1] ?? ""
            blocks.push([
                header.trimEnd(),
                ...body.split("\n").map(line => line.trimEnd())
            ])
        }
        return blocks
    }

    public static extractBoardRows(
        stdout: string,
        which: "first" | "latest"
    ): ReadonlyArray<string> {
        const blocks = GameStateHelpers.parseStateBlocks(stdout)
        const block = which === "first" ? blocks[0] : blocks[blocks.length - 1]
        return block.filter(
            line => line.startsWith("  ") || line.startsWith(" ---")
        )
    }

    public static getCurrentPlayer(
        stdout: string,
        which: "first" | "latest"
    ): string | undefined {
        const blocks = GameStateHelpers.parseStateBlocks(stdout)
        const block = which === "first" ? blocks[0] : blocks[blocks.length - 1]
        const line = block.find(entry => entry.endsWith("to move"))
        const match = line?.match(/^([XO]) to move$/)
        return match?.[1]
    }

    public static rowHasMark(
        rows: ReadonlyArray<string>,
        position: number,
        mark: string
    ): boolean {
        const board = rows.map(row => row.replace(/\s/g, ""))
        const index = position - 1
        const rowIndex = Math.floor(index / 3)
        const colIndex = index % 3
        const row = board[rowIndex]
        return row?.[colIndex * 2] === mark
    }

    public static hasBoard(stdout: string): boolean {
        return stdout.includes("---+---+---")
    }
}

export class GameDriver {
    private lastResult: Result | null = null
    private moveHistory: string[] = []

    public async noGameInProgress(): Promise<void> {
        this.resetHistory()
    }

    public async start(): Promise<void> {
        await this.noGameInProgress()
        await this.runWithMoves([])
    }

    public collectScenarioMove(position: number): void {
        this.moveHistory.push(String(position))
    }

    public async startNewGame(): Promise<void> {
        await this.start()
    }

    public async applyMoves(moves: ReadonlyArray<number>): Promise<void> {
        this.moveHistory = moves.map(move => String(move))
        await this.replayHistory()
    }

    public async playMovesCsv(movesCsv: string): Promise<CliResult> {
        this.moveHistory = this.parseMovesCsv(movesCsv)
        return this.replayHistory()
    }

    public async playScenario(): Promise<CliResult> {
        return this.replayHistory()
    }

    public async enterInvalidInput(value: string): Promise<void> {
        this.moveHistory.push(value)
        await this.replayHistory()
    }

    public confirmOutputContains(text: string): void {
        const stdout = this.ensureResult().stdout
        if (!stdout.includes(text))
            expect.fail(`Expected output to contain: ${text}`)
    }

    public confirmWinnerIs(expected: "X" | "O"): void {
        const stdout = this.ensureResult().stdout
        if (!stdout.includes(`Player ${expected} wins!`))
            expect.fail(`Expected winner ${expected}, got output: ${stdout}`)
    }

    public confirmDraw(): void {
        const stdout = this.ensureResult().stdout
        if (!stdout.includes("It's a draw!"))
            expect.fail(`Expected draw, got output: ${stdout}`)
    }

    public confirmShowsInvalidPosition(): void {
        const stdout = this.ensureResult().stdout
        if (!stdout.includes("Invalid position: choose 1-9"))
            expect.fail("Expected invalid position message")
    }

    public confirmShowsInvalidInput(): void {
        const stdout = this.ensureResult().stdout
        if (!stdout.includes("Invalid input: enter a number 1-9"))
            expect.fail("Expected invalid input message")
    }

    public confirmShowsPositionTakenAt(position: number): void {
        const stdout = this.ensureResult().stdout
        if (!stdout.includes(`Position already taken at ${position}`))
            expect.fail("Expected position taken message")
    }

    public confirmExitCode(expected: number): void {
        const result = this.ensureResult()
        if (result.code !== expected)
            expect.fail(`Expected exit code ${expected}, got ${result.code}`)
    }

    public getLastResult(): CliResult {
        if (!this.lastResult) expect.fail("No CLI result captured")
        return this.lastResult
    }

    public extractInitialBoardRows(): ReadonlyArray<string> {
        return GameStateHelpers.extractBoardRows(
            this.ensureResult().stdout,
            "first"
        )
    }

    public extractLatestBoardRows(): ReadonlyArray<string> {
        return GameStateHelpers.extractBoardRows(
            this.ensureResult().stdout,
            "latest"
        )
    }

    public confirmPositionContains(position: number, mark: "X" | "O"): void {
        const rows = this.extractLatestBoardRows()
        if (!GameStateHelpers.rowHasMark(rows, position, mark))
            expect.fail(`Expected position ${position} to contain ${mark}`)
    }

    public confirmCurrentPlayerIs(player: "X" | "O"): void {
        const current = GameStateHelpers.getCurrentPlayer(
            this.ensureResult().stdout,
            "latest"
        )
        if (current !== player)
            expect.fail(
                `Expected ${player} to move, got ${current ?? "unknown"}`
            )
    }

    public confirmInitialPlayerIs(player: "X" | "O"): void {
        const stdout = this.ensureResult().stdout
        const initial = GameStateHelpers.getCurrentPlayer(stdout, "first")
        if (initial !== player)
            expect.fail(
                `Expected initial player ${player}, got ${initial ?? "unknown"}`
            )
    }

    public confirmMoveRejected(): void {
        const result = this.ensureResult()
        if (result.code === 0)
            expect.fail("Expected move rejection to produce non-zero exit code")
    }

    public confirmMoveCompleted(): void {
        const stdout = this.ensureResult().stdout
        const previous = GameStateHelpers.getCurrentPlayer(stdout, "first")
        const current = GameStateHelpers.getCurrentPlayer(stdout, "latest")
        if (previous === current)
            expect.fail("Expected turn to alternate after move")
    }

    public resetHistory(): void {
        this.moveHistory = []
        this.lastResult = null
    }

    private async replayHistory(): Promise<CliResult> {
        return this.runWithMoves(this.moveHistory)
    }

    private async runWithMoves(
        moves: ReadonlyArray<string>
    ): Promise<CliResult> {
        const csv = moves.join(",")
        const args = moves.length === 0 ? ["--moves", ""] : ["--moves", csv]
        const result = await cliDriver.run(["play", ...args])
        return this.storeResult(result)
    }

    private parseMovesCsv(movesCsv: string): string[] {
        if (movesCsv.trim() === "") return []
        return movesCsv.split(",").map(move => move.trim())
    }

    private ensureResult(): Result {
        if (!this.lastResult) expect.fail("No CLI result captured")
        return this.lastResult
    }

    private storeResult(result: Result): Result {
        this.lastResult = result
        return result
    }
}

export const gameDriver = new GameDriver()
