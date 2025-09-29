import { cliDriver as cliExecutor, type CliResult } from "./cli"
import { CliOutputParser } from "./cli-output-parser"
import { CliResponseValidator } from "./cli-response-validator"
import { expect } from "vitest"

export class CliDriver {
    private lastResult: CliResult | null = null
    private moveHistory: string[] = []

    public constructor(
        private readonly parser: CliOutputParser,
        private readonly validator: CliResponseValidator
    ) {}

    public async executeMoves(moves: ReadonlyArray<string>): Promise<void> {
        const csv = moves.join(",")
        const args = moves.length === 0 ? ["--moves", ""] : ["--moves", csv]
        this.lastResult = await cliExecutor.run(["play", ...args])
    }

    public getMoveHistory(): ReadonlyArray<string> {
        return this.moveHistory
    }

    public setMoveHistory(moves: ReadonlyArray<string>): void {
        this.moveHistory = [...moves]
    }

    public addMove(position: string): void {
        this.moveHistory.push(position)
    }

    public clearMoves(): void {
        this.moveHistory = []
    }

    public async executeAccumulatedMoves(): Promise<void> {
        await this.executeMoves(this.moveHistory)
    }

    public extractBoardRows(
        which: "initial" | "latest"
    ): ReadonlyArray<string> {
        return this.parser.extractBoardRows(this.ensureResult().stdout, which)
    }

    public getCurrentPlayer(which: "first" | "latest"): string | undefined {
        return this.parser.getCurrentPlayer(this.ensureResult().stdout, which)
    }

    public getCellValue(rows: ReadonlyArray<string>, position: number): string {
        return this.parser.getCellValue(rows, position)
    }

    public confirmPositionContains(position: number, mark: "X" | "O"): void {
        this.validator.confirmPositionContains(
            this.ensureResult().stdout,
            position,
            mark
        )
    }

    public confirmPositionIsEmpty(position: number): void {
        this.validator.confirmPositionIsEmpty(
            this.ensureResult().stdout,
            position
        )
    }

    public confirmCurrentPlayer(player: "X" | "O"): void {
        this.validator.confirmCurrentPlayer(this.ensureResult().stdout, player)
    }

    public confirmInitialPlayer(player: "X" | "O"): void {
        this.validator.confirmInitialPlayer(this.ensureResult().stdout, player)
    }

    public confirmWinner(winner: "X" | "O"): void {
        this.validator.confirmWinner(this.ensureResult().stdout, winner)
    }

    public confirmDraw(): void {
        this.validator.confirmDraw(this.ensureResult().stdout)
    }

    public confirmTextInOutput(text: string): void {
        this.validator.confirmTextInOutput(this.ensureResult().stdout, text)
    }

    public confirmExitCode(code: number): void {
        this.validator.confirmExitCode(this.ensureResult(), code)
    }

    public confirmBoardDisplayed(): void {
        this.validator.confirmBoardDisplayed(this.ensureResult().stdout)
    }

    public confirmAllPositionsAreEmpty(): void {
        this.validator.confirmAllPositionsAreEmpty(this.ensureResult().stdout)
    }

    public confirmMoveCompleted(): void {
        this.validator.confirmMoveCompleted(this.ensureResult().stdout)
    }

    public confirmMoveRejected(): void {
        const result = this.ensureResult()
        if (result.code === 0) {
            expect.fail("Expected move rejection (non-zero exit code)")
        }
    }

    public getLastResult(): CliResult {
        return this.ensureResult()
    }

    private ensureResult(): CliResult {
        if (!this.lastResult) {
            expect.fail(
                "No CLI result captured. Did you execute an action first?"
            )
        }
        return this.lastResult
    }
}
