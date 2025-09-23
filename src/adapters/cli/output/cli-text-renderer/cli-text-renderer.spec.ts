import { describe, it, expect } from "vitest"
import { createCliTextRenderer } from "./cli-text-renderer"

type ViewModel = { type: string; payload?: unknown }
type Template = (
    view: ViewModel,
    options?: Record<string, unknown>
) => string | string[]
type Templates = Record<string, Template>
type Writer = { write: (text: string) => void }

type GenericCliTextRenderer = { render: (view: ViewModel) => void }

describe("Generic CLI Text Renderer", () => {
    it("renders a simple view with a provided template to exact text", () => {
        // Given
        const writes: string[] = []
        const writer: Writer = { write: t => writes.push(t) }
        const templates: Templates = {
            message: v => String(v.payload)
        }

        // When
        const renderer: GenericCliTextRenderer = createCliTextRenderer({
            writer,
            templates
        })
        renderer.render({ type: "message", payload: "Hello" })

        // Then
        expect(writes.join("")).toBe("Hello")
    })

    it("renders multiple sequential views preserving order without extra whitespace", () => {
        // Given
        const writes: string[] = []
        const writer: Writer = { write: t => writes.push(t) }
        const templates: Templates = {
            message: v => String(v.payload)
        }

        // When
        const renderer: GenericCliTextRenderer = createCliTextRenderer({
            writer,
            templates,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            options: { newline: "\n" } as any
        })
        renderer.render({ type: "message", payload: "A" })
        renderer.render({ type: "message", payload: "B" })

        // Then
        expect(writes.join("")).toBe("A\nB\n")
    })

    it("uses fallback for unknown view types (configurable error or noop)", () => {
        // Given
        const writes: string[] = []
        const writer: Writer = { write: t => writes.push(t) }
        const templates: Templates = {
            message: v => String(v.payload)
        }

        const fallback = (v: ViewModel) => `unknown:${v.type}`

        // When
        const renderer: GenericCliTextRenderer = createCliTextRenderer({
            writer,
            templates,
            // using an options field expected to be ignored until implemented
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            options: { fallback } as any
        })
        renderer.render({ type: "does-not-exist" })

        // Then
        expect(writes.join("")).toBe("unknown:does-not-exist")
    })

    it("supports grid/table-style layout via a template with stable ASCII spacing", () => {
        // Given
        const writes: string[] = []
        const writer: Writer = { write: t => writes.push(t) }
        const templates: Templates = {
            grid: v => {
                const rows = v.payload as string[][]
                return rows.map(
                    r => ` ${r[0]} | ${r[1]} | ${r[2]} ` as unknown as string
                )
            }
        }

        // When
        const renderer: GenericCliTextRenderer = createCliTextRenderer({
            writer,
            templates,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            options: { newline: "\n" } as any
        })
        const payload = [
            ["1", "2", "3"],
            ["4", "5", "6"],
            ["7", "8", "9"]
        ]
        renderer.render({ type: "grid", payload })

        // Then
        const expected = [
            " 1 | 2 | 3 \n",
            " 4 | 5 | 6 \n",
            " 7 | 8 | 9 \n"
        ].join("")
        expect(writes.join("")).toBe(expected)
    })

    it.each([
        {
            type: "prompt",
            payload: "X to move (1-9):",
            expected: ">> X to move (1-9):\n"
        },
        {
            type: "error",
            payload: "Invalid input",
            expected: "ERROR: Invalid input\n"
        },
        {
            type: "message",
            payload: "Type 'help' for commands",
            expected: "Type 'help' for commands\n"
        }
    ])("formats %s consistently", ({ type, payload, expected }) => {
        // Given
        const writes: string[] = []
        const writer: Writer = { write: t => writes.push(t) }
        const templates: Templates = {
            prompt: v => ">> " + String(v.payload),
            error: v => "ERROR: " + String(v.payload),
            message: v => String(v.payload)
        }

        // When
        const renderer: GenericCliTextRenderer = createCliTextRenderer({
            writer,
            templates,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            options: { newline: "\n" } as any
        })
        renderer.render({ type, payload })

        // Then
        expect(writes.join("")).toBe(expected)
    })

    it("toggles ANSI styling off by default without altering content", () => {
        // Given
        const writes: string[] = []
        const writer: Writer = { write: t => writes.push(t) }
        const templates: Templates = {
            message: () => "\u001b[31mRed\u001b[0m"
        }

        // When
        const renderer: GenericCliTextRenderer = createCliTextRenderer({
            writer,
            templates,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            options: { newline: "\n", ansi: false } as any
        })
        renderer.render({ type: "message" })

        // Then
        expect(writes.join("")).toBe("Red\n")
    })

    it("is stateless and idempotent across calls", () => {
        // Given
        const writes: string[] = []
        const writer: Writer = { write: t => writes.push(t) }
        const templates: Templates = { message: v => String(v.payload) }

        // When
        const renderer: GenericCliTextRenderer = createCliTextRenderer({
            writer,
            templates,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            options: { newline: "\n" } as any
        })
        renderer.render({ type: "message", payload: "Hello" })
        renderer.render({ type: "message", payload: "Hello" })

        // Then
        expect(writes.join("")).toBe("Hello\nHello\n")
    })

    it("handles writer failure gracefully (does not throw to caller)", () => {
        // Given
        const writer: Writer = {
            write: () => {
                throw new Error("io")
            }
        }
        const templates: Templates = {}
        const fallback = (v: ViewModel) => `fallback:${v.type}`

        // When
        const act = () =>
            createCliTextRenderer({
                writer,
                templates,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                options: { fallback } as any
            }).render({ type: "unknown-type" })

        // Then
        expect(act).not.toThrow()
    })

    it("handles template exceptions via fallback/error strategy", () => {
        // Given
        const writes: string[] = []
        const writer: Writer = { write: t => writes.push(t) }
        const templates: Templates = {
            message: () => {
                throw new Error("boom")
            }
        }
        const fallback = (v: ViewModel) => `tmpl-error:${v.type}`

        // When
        const act = () =>
            createCliTextRenderer({
                writer,
                templates,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                options: { fallback } as any
            }).render({ type: "message", payload: "Hi" })

        // Then
        expect(act).not.toThrow()
        expect(writes.join("")).toBe("tmpl-error:message")
    })

    it("fallback formatting is controlled by fallback, not renderer", () => {
        // Given
        const writes: string[] = []
        const writer: Writer = { write: t => writes.push(t) }
        const templates: Templates = {}
        const fallback = (v: ViewModel) => `PFX fallback:${v.type}`

        // When
        const renderer: GenericCliTextRenderer = createCliTextRenderer({
            writer,
            templates,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            options: { newline: "\n", fallback } as any
        })
        renderer.render({ type: "unknown", payload: "ignored" })

        // Then
        expect(writes.join("")).toBe("PFX fallback:unknown\n")
    })

    it("multi-line formatting is template-controlled (no renderer prefixes)", () => {
        // Given
        const writes: string[] = []
        const writer: Writer = { write: t => writes.push(t) }
        const templates: Templates = {
            message: () => ["Line1", "Line2"] as unknown as string
        }

        // When
        const renderer: GenericCliTextRenderer = createCliTextRenderer({
            writer,
            templates,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            options: { newline: "\n" } as any
        })
        renderer.render({ type: "message" })

        // Then
        expect(writes.join("")).toBe("Line1\nLine2\n")
    })
})
