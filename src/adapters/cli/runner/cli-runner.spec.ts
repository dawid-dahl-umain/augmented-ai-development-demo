import { describe, it, expect, vi } from "vitest"
import { CliRunner } from "#src/adapters/cli/runner/cli-runner"

describe("CliRunner", () => {
    const collectOutputs = () =>
        (vi.mocked(console.log).mock.calls as unknown as Array<[unknown]>).map(
            c => String(c[0])
        )

    it("parses --moves and forwards start + each move to the input adapter", () => {
        // Given
        const spy = vi.spyOn(console, "log").mockImplementation(() => {})
        const runner = new CliRunner()

        // When
        const code = runner.run(["--moves", "1,4,2,5,3"])

        // Then
        expect(code).toBe(0)
        const outputs = collectOutputs()
        expect(outputs.some(line => line.includes("Player X wins!"))).toBe(true)

        spy.mockRestore()
    })

    it("rejects out-of-range positions and informs the player", () => {
        // Given
        const spy = vi.spyOn(console, "log").mockImplementation(() => {})
        const runner = new CliRunner()

        // When
        const code = runner.run(["--moves", "1,10"])

        // Then
        expect(code).toBe(3)
        const outputs = collectOutputs()
        expect(
            outputs.some(line => line.includes("Invalid position: choose 1-9"))
        ).toBe(true)

        spy.mockRestore()
    })

    it("returns exit code 0 for normal completion", () => {
        // Given
        const runner = new CliRunner()

        // When
        const code = runner.run(["--moves", "1,4,2,5,3"])

        // Then
        expect(code).toBe(0)
    })

    it("ignores extra moves after game over (no additional output)", () => {
        // Given
        const spy = vi.spyOn(console, "log").mockImplementation(() => {})
        const runner = new CliRunner()

        // When
        runner.run(["--moves", "1,4,2,5,3,6"])

        // Then
        const lines = collectOutputs()
        const winnerIndex = lines.findIndex(l => l.includes("Player X wins!"))
        expect(winnerIndex).toBeGreaterThanOrEqual(0)
        const afterWinner = lines.slice(winnerIndex + 1)
        expect(
            afterWinner.every(
                line =>
                    !line.includes("Round") &&
                    !line.includes("---+---+---") &&
                    !line.includes(" | ")
            )
        ).toBe(true)

        spy.mockRestore()
    })

    it("handles missing --moves gracefully (no output, exit 0)", () => {
        // Given
        const spy = vi.spyOn(console, "log").mockImplementation(() => {})
        const runner = new CliRunner()

        // When
        const code1 = runner.run(["play"])
        const code2 = runner.run([])

        // Then
        expect(code1).toBe(0)
        expect(code2).toBe(0)
        expect(spy).not.toHaveBeenCalled()

        spy.mockReset()
        spy.mockRestore()
    })

    it("trims and parses whitespace in --moves (e.g., '1, 4, 2')", () => {
        // Given
        const spy = vi.spyOn(console, "log").mockImplementation(() => {})
        const runner = new CliRunner()

        // When
        const code = runner.run(["--moves", "1, 4, 2, 5, 3"])

        // Then
        expect(code).toBe(0)
        const outputs = collectOutputs()
        expect(outputs.some(line => line.includes("Player X wins!"))).toBe(true)

        spy.mockRestore()
    })

    it("rejects non-numeric move input and informs the player", () => {
        // Given
        const spy = vi.spyOn(console, "log").mockImplementation(() => {})
        const runner = new CliRunner()

        // When
        const code = runner.run(["--moves", "abc"])

        // Then
        expect(code).toBe(2)
        expect(spy).toHaveBeenCalled()

        spy.mockRestore()
    })

    it("prints only outcome messages when verbose output is disabled", () => {
        // Given
        const spy = vi.spyOn(console, "log").mockImplementation(() => {})
        const runner = new CliRunner()

        // When
        const code = runner.run(["--moves", "1,4,2,5,3", "--no-verbose"])

        // Then
        expect(code).toBe(0)
        const outputs = collectOutputs()
        expect(outputs.some(line => line.includes("---+---+---"))).toBe(false)
        expect(outputs.some(line => line.includes("Player X wins!"))).toBe(true)

        spy.mockRestore()
    })

    it("renders a board state after applying moves via --moves", () => {
        // Given
        const spy = vi.spyOn(console, "log").mockImplementation(() => {})
        const runner = new CliRunner()

        // When
        const code = runner.run(["--moves", "1,5,9"]) // simple moves, no win

        // Then
        expect(code).toBe(0)
        const outputs = collectOutputs()
        expect(outputs.some(line => line.includes("---+---+---"))).toBe(true)

        spy.mockRestore()
    })

    it("prints a round/turn indicator with each state render", () => {
        // Given
        const spy = vi.spyOn(console, "log").mockImplementation(() => {})
        const runner = new CliRunner()

        // When
        const code = runner.run(["--moves", "1,9"]) // after O moves, Round 2 expected

        // Then
        expect(code).toBe(0)
        const outputs = collectOutputs()
        expect(outputs.some(line => line.includes("Round 2"))).toBe(true)

        spy.mockRestore()
    })

    it("includes the current player in the round indicator", () => {
        // Given
        const spy = vi.spyOn(console, "log").mockImplementation(() => {})
        const runner = new CliRunner()

        // When
        const code = runner.run(["--moves", "1,9"]) // Round 2 done, next is X

        // Then
        expect(code).toBe(0)
        const outputs = spy.mock.calls.map(c => String(c[0]))
        const hasRound = outputs.some(line => /Round\s*2/.test(line))
        const hasTurn = outputs.some(line => /X\s+to move/.test(line))
        expect(hasRound).toBe(true)
        expect(hasTurn).toBe(true)

        spy.mockRestore()
    })

    it("returns exit code 2 for non-numeric input in --moves (e.g., 'abc')", () => {
        // Given
        const spy = vi.spyOn(console, "log").mockImplementation(() => {})
        const runner = new CliRunner()

        // When
        const code = runner.run(["--moves", "abc"])

        // Then
        expect(code).toBe(2)
        spy.mockRestore()
    })

    it("returns exit code 3 for out-of-range position in --moves (e.g., '10')", () => {
        // Given
        const spy = vi.spyOn(console, "log").mockImplementation(() => {})
        const runner = new CliRunner()

        // When
        const code = runner.run(["--moves", "10"])

        // Then
        expect(code).toBe(3)
        spy.mockRestore()
    })

    it("returns exit code 4 for taken position in --moves (e.g., '1,1')", () => {
        // Given
        const spy = vi.spyOn(console, "log").mockImplementation(() => {})
        const runner = new CliRunner()

        // When
        const code = runner.run(["--moves", "1,1"]) // second 1 is taken

        // Then
        expect(code).toBe(4)
        spy.mockRestore()
    })
})
