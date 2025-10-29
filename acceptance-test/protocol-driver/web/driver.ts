import type { BrowserContext, Page } from "playwright"
import type { PlayerMark, ProtocolDriver } from "../interface"
import { getWebBaseUrl, prepareWebPage } from "./runtime"

export class WebDriver implements ProtocolDriver {
    private readonly pagePromise: Promise<Page>
    private readonly contextPromise: Promise<BrowserContext>

    public constructor() {
        const setup = prepareWebPage()
        this.pagePromise = setup.then(result => result.page)
        this.contextPromise = setup.then(result => result.context)
    }

    private async page(): Promise<Page> {
        return this.pagePromise
    }

    private async context(): Promise<BrowserContext> {
        return this.contextPromise
    }

    public async resetScenario(): Promise<void> {
        const page = await this.page()
        await page.goto(getWebBaseUrl(), { waitUntil: "load" })
        await this.confirmBoardHasNineCells(page)
        await this.waitForIdle(page)
    }

    public async startNewGame(): Promise<void> {
        const page = await this.page()
        await page.locator("#restart").click()
        await this.waitForIdle(page)
        await this.confirmBoardHasNineCells(page)
    }

    public async playMoves(moves: ReadonlyArray<number>): Promise<void> {
        for (const move of moves) {
            await this.placeMark(move)
        }
    }

    public async playMovesFromCsv(sequence: string): Promise<void> {
        const entries = sequence
            .split(",")
            .map(entry => entry.trim())
            .filter(entry => entry.length > 0)

        if (entries.length === 0) {
            await this.resetScenario()
            return
        }

        const moves = entries.map(entry => {
            const position = Number(entry)
            if (Number.isNaN(position)) {
                throw new Error(`Invalid move value: "${entry}"`)
            }
            return position
        })

        await this.playMoves(moves)
    }

    public async placeMark(position: number): Promise<void> {
        const page = await this.page()
        const cell = this.cellLocator(page, position)
        if ((await cell.count()) === 0) {
            throw new Error(`Could not find cell for position ${position}`)
        }

        await cell.click()
        await this.waitForIdle(page)
    }

    public async submitInvalidInput(value: string): Promise<void> {
        throw new Error(
            `submitInvalidInput is not supported for the web protocol (value: ${value})`
        )
    }

    public async confirmInitialPlayer(expected: PlayerMark): Promise<void> {
        const page = await this.page()
        await this.confirmStatus(page, `Player ${expected} to move`)
    }

    public async confirmCurrentPlayer(expected: PlayerMark): Promise<void> {
        const page = await this.page()
        await this.confirmStatus(page, `Player ${expected} to move`)
    }

    public async confirmPositionEmpty(position: number): Promise<void> {
        const page = await this.page()
        await this.confirmCellContains(page, position, "")
    }

    public async confirmPositionContains(
        position: number,
        mark: PlayerMark
    ): Promise<void> {
        const page = await this.page()
        await this.confirmCellContains(page, position, mark)
    }

    public async confirmWinner(mark: PlayerMark): Promise<void> {
        const page = await this.page()
        await this.confirmStatus(page, `Player ${mark} wins!`)
    }

    public async confirmDraw(): Promise<void> {
        const page = await this.page()
        const drawTextVariants = ["It’s a draw!", "It's a draw!"]
        const actual = await this.getStatusText(page)
        if (!drawTextVariants.includes(actual)) {
            throw new Error(`Expected draw status but found "${actual}"`)
        }
    }

    public async confirmMoveRejected(): Promise<void> {
        const page = await this.page()
        const message = await this.getMessageText(page)
        if (!message) {
            throw new Error("Expected rejection message to be displayed")
        }
    }

    public async confirmMoveCompleted(): Promise<void> {
        const page = await this.page()
        const message = await this.getMessageText(page)
        if (message) {
            throw new Error(
                `Expected no error message after move completion but found "${message}"`
            )
        }
    }

    public async confirmBoardTemplate(): Promise<void> {
        const page = await this.page()
        await this.confirmBoardHasNineCells(page)
    }

    public async confirmBoardIsEmpty(): Promise<void> {
        const page = await this.page()
        await this.confirmBoardHasNineCells(page)
        await this.confirmAllCellsEmpty(page)
    }

    public async confirmAllPositionsAreEmpty(): Promise<void> {
        const page = await this.page()
        await this.confirmAllCellsEmpty(page)
    }

    public async confirmTextInOutput(text: string): Promise<void> {
        const page = await this.page()
        await this.confirmMessageIncludes(page, text)
    }

    public async confirmExitCode(code: number): Promise<void> {
        throw new Error(
            `confirmExitCode(${code}) is not applicable for web protocol`
        )
    }

    public async dispose(): Promise<void> {
        const context = await this.context()
        await context.close()
    }

    private async getStatusText(page: Page): Promise<string> {
        const content = await page.locator("#status").textContent()
        return content?.trim() ?? ""
    }

    private async getMessageText(page: Page): Promise<string> {
        const content = await page.locator("#message").textContent()
        return content?.trim() ?? ""
    }

    private async confirmStatus(page: Page, expected: string): Promise<void> {
        const actual = await this.getStatusText(page)
        if (actual !== expected) {
            throw new Error(
                `Expected status "${expected}" but found "${
                    actual || "<empty>"
                }"`
            )
        }
    }

    private async confirmMessageIncludes(
        page: Page,
        text: string
    ): Promise<void> {
        const message = await this.getMessageText(page)
        const status = await this.getStatusText(page)
        if (!message.includes(text) && !status.includes(text)) {
            throw new Error(`Expected UI to include "${text}"`)
        }
    }

    private async confirmBoardHasNineCells(page: Page): Promise<void> {
        const cells = page.locator("#board .cell")
        const count = await cells.count()
        if (count !== 9) {
            throw new Error(`Expected 9 cells but found ${count}`)
        }
    }

    private cellLocator(page: Page, position: number) {
        return page.locator(`#board .cell[data-position="${position}"]`)
    }

    private async confirmCellContains(
        page: Page,
        position: number,
        expected: string
    ): Promise<void> {
        const cell = this.cellLocator(page, position)
        if ((await cell.count()) === 0) {
            throw new Error(`Could not find cell for position ${position}`)
        }

        const text = (await cell.textContent())?.trim() ?? ""
        if (text !== expected) {
            throw new Error(
                `Expected position ${position} to contain "${expected}" but found "${text}"`
            )
        }
    }

    private async confirmAllCellsEmpty(page: Page): Promise<void> {
        const cells = page.locator("#board .cell")
        const count = await cells.count()
        for (let index = 0; index < count; index += 1) {
            const text = (await cells.nth(index).textContent())?.trim() ?? ""
            if (text.length > 0) {
                throw new Error(
                    `Expected empty board but found value "${text}" at index ${index}`
                )
            }
        }
    }

    private async waitForIdle(page: Page): Promise<void> {
        await page.waitForTimeout(50)
    }
}
