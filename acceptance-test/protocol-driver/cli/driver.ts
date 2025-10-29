import { cliDriver as cliExecutor, type CliResult } from "./cli"
import { CliResponseValidator } from "./response-validator"
import type { PlayerMark, ProtocolDriver } from "../interface"

export class CliDriver implements ProtocolDriver {
    private lastResult: CliResult | null = null
    private moveHistory: string[] = []

    public constructor(private readonly validator: CliResponseValidator) {}

    public async resetScenario(): Promise<void> {
        this.moveHistory = []
        this.lastResult = null
    }

    public async startNewGame(): Promise<void> {
        await this.resetScenario()
        await this.executeMoves([])
    }

    public async playMoves(moves: ReadonlyArray<number>): Promise<void> {
        const sequence = moves.map(String)
        await this.executeMoves(sequence)
    }

    public async playMovesFromCsv(sequence: string): Promise<void> {
        const normalizedSequence = sequence
            .split(",")
            .map(entry => entry.trim())
            .filter(entry => entry.length > 0)

        if (normalizedSequence.length === 0) {
            await this.executeMoves([])
            return
        }

        await this.executeMoves(normalizedSequence)
    }

    public async placeMark(position: number): Promise<void> {
        const nextHistory = [...this.moveHistory, String(position)]
        await this.executeMoves(nextHistory)
    }

    public async submitInvalidInput(value: string): Promise<void> {
        const nextHistory = [...this.moveHistory, value]
        await this.executeMoves(nextHistory)
    }

    public async confirmInitialPlayer(expected: PlayerMark): Promise<void> {
        this.validator.confirmInitialPlayer(
            this.ensureResult().stdout,
            expected
        )
    }

    public async confirmCurrentPlayer(expected: PlayerMark): Promise<void> {
        this.validator.confirmCurrentPlayer(
            this.ensureResult().stdout,
            expected
        )
    }

    public async confirmPositionEmpty(position: number): Promise<void> {
        this.validator.isPositionEmpty(this.ensureResult().stdout, position)
    }

    public async confirmPositionContains(
        position: number,
        mark: PlayerMark
    ): Promise<void> {
        this.validator.confirmPositionContains(
            this.ensureResult().stdout,
            position,
            mark
        )
    }

    public async confirmWinner(mark: PlayerMark): Promise<void> {
        this.validator.confirmWinner(this.ensureResult().stdout, mark)
    }

    public async confirmDraw(): Promise<void> {
        this.validator.confirmDraw(this.ensureResult().stdout)
    }

    public async confirmMoveRejected(): Promise<void> {
        const result = this.ensureResult()
        if (result.code === 0) {
            throw new Error("Expected move rejection (non-zero exit code)")
        }
    }

    public async confirmMoveCompleted(): Promise<void> {
        this.validator.confirmMoveCompleted(this.ensureResult().stdout)
    }

    public async confirmBoardTemplate(): Promise<void> {
        this.validator.confirmBoardDisplayed(this.ensureResult().stdout)
    }

    public async confirmBoardIsEmpty(): Promise<void> {
        await this.confirmBoardTemplate()
        await this.confirmAllPositionsAreEmpty()
    }

    public async confirmAllPositionsAreEmpty(): Promise<void> {
        this.validator.confirmAllPositionsAreEmpty(this.ensureResult().stdout)
    }

    public async confirmTextInOutput(text: string): Promise<void> {
        this.validator.confirmTextInOutput(this.ensureResult().stdout, text)
    }

    public async confirmExitCode(code: number): Promise<void> {
        this.validator.confirmExitCode(this.ensureResult(), code)
    }

    private async executeMoves(moves: ReadonlyArray<string>): Promise<void> {
        const csv = moves.join(",")
        const args = moves.length === 0 ? ["--moves", ""] : ["--moves", csv]
        this.lastResult = await cliExecutor.run(["play", ...args])
        this.moveHistory = [...moves]
    }

    private ensureResult(): CliResult {
        if (!this.lastResult) {
            throw new Error(
                "No CLI result captured. Did you execute an action first?"
            )
        }

        return this.lastResult
    }
}
