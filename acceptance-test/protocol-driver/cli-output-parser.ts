type StateBlock = ReadonlyArray<string>

export class CliOutputParser {
    public extractBoardRows(
        stdout: string,
        which: "initial" | "latest"
    ): ReadonlyArray<string> {
        const blocks = this.parseStateBlocks(stdout)
        if (blocks.length === 0) {
            throw new Error("No game state output captured")
        }

        const block =
            which === "initial" ? blocks[0] : blocks[blocks.length - 1]
        return block.filter(
            line => line.startsWith("  ") || line.startsWith(" ---")
        )
    }

    public getCurrentPlayer(
        stdout: string,
        which: "first" | "latest"
    ): string | undefined {
        const blocks = this.parseStateBlocks(stdout)
        if (blocks.length === 0) return undefined

        const block = which === "first" ? blocks[0] : blocks[blocks.length - 1]
        const line = block.find(entry => entry.endsWith("to move"))
        const match = line?.match(/^([XO]) to move$/)
        return match?.[1]
    }

    public getCellValue(rows: ReadonlyArray<string>, position: number): string {
        const rowIndex = Math.floor((position - 1) / 3)
        const colIndex = (position - 1) % 3
        const rowLineIndex = rowIndex * 2
        const rowLine = rows[rowLineIndex]

        if (!rowLine) {
            throw new Error(`Missing board row for position ${position}`)
        }

        const cells = rowLine.split("|").map(cell => cell.trim())
        const value = cells[colIndex]

        if (value === undefined) {
            throw new Error(`Missing board cell for position ${position}`)
        }

        return value
    }

    private parseStateBlocks(stdout: string): ReadonlyArray<StateBlock> {
        const chunks = stdout.split(/(Round \d+)/).slice(1)
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
}
