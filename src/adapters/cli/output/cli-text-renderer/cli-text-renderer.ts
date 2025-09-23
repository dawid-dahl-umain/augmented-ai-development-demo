export type ViewModel = { type: string; payload?: unknown }
export type Template = (
    view: ViewModel,
    options?: Record<string, unknown>
) => string | string[]
export type Templates = Record<string, Template>
export type Writer = { write: (text: string) => void }

export type Renderer = { render: (view: ViewModel) => void }

const ANSI_PATTERN = new RegExp(String.raw`\u001B\[[0-9;]*m`, "g")

type RendererOptions = Record<string, unknown> & {
    fallback?: (view: ViewModel) => string
    newline?: string
    ansi?: boolean
}

type CreateRendererArgs = {
    writer: Writer
    templates: Templates
    options?: RendererOptions
}

export class CliTextRenderer implements Renderer {
    private readonly writer: Writer
    private readonly templates: Templates
    private readonly options?: RendererOptions

    /**
     * Create a CLI text renderer.
     * Renders view models using injected templates and writes to the provided writer.
     * Optional behavior like newline suffixing and unknown-type fallback is configured via options.
     */
    public constructor({ writer, templates, options }: CreateRendererArgs) {
        this.writer = writer
        this.templates = templates
        this.options = options
    }

    /**
     * Render a single view model.
     * - If a template exists for the view type, it is used to format output (string or string[]).
     * - If the template throws, or is missing, a configured fallback(view) is used when available.
     * - When options.newline is provided, it is appended after each rendered line.
     */
    public render(view: ViewModel): void {
        const template = this.templates[view.type]

        if (!template) {
            const fallback = this.options?.fallback

            if (!fallback) return

            try {
                const suffix = this.options?.newline ?? ""
                const text = fallback(view)
                const out =
                    (this.options?.ansi === false
                        ? text.replace(ANSI_PATTERN, "")
                        : text) + suffix
                this.writer.write(out)
            } catch {
                // ignore writer errors
            }

            return
        }

        try {
            const suffix = this.options?.newline ?? ""
            const rendered = template(view, this.options)
            const strip = (s: string) =>
                this.options?.ansi === false ? s.replace(ANSI_PATTERN, "") : s
            const output = Array.isArray(rendered)
                ? rendered.map(line => strip(String(line)) + suffix).join("")
                : strip(String(rendered)) + suffix
            this.writer.write(output)
        } catch {
            const fallback = this.options?.fallback

            if (!fallback) return

            try {
                const suffix = this.options?.newline ?? ""
                const text = fallback(view)
                const out =
                    (this.options?.ansi === false
                        ? text.replace(ANSI_PATTERN, "")
                        : text) + suffix
                this.writer.write(out)
            } catch {
                // ignore writer errors
            }
        }
    }
}

/**
 * Factory helper that constructs a CliTextRenderer and returns it as a minimal Renderer interface.
 */
export const createCliTextRenderer = (args: CreateRendererArgs): Renderer => {
    const instance = new CliTextRenderer(args)

    return { render: view => instance.render(view) }
}
