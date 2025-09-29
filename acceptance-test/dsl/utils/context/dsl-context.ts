export class DslContext {
    private static readonly globalSequenceNumbers = new Map<string, number>()
    private readonly sequenceNumbers = new Map<string, number>()
    private readonly aliases = new Map<string, string>()

    /**
     * Returns a sequence number scoped to the current DSL context.
     * Ensures new data per test without affecting global aliasing.
     * @example context.sequenceNumberForName("invoice", 1)
     */
    sequenceNumberForName = (name: string, start: number): string =>
        this.seqForName(name, start, this.sequenceNumbers)

    /**
     * Allocates a globally unique alias while keeping it stable within the context.
     * Combines functional and temporal isolation via deterministic suffixes.
     * @example context.alias("name")
     */
    alias = (name: string): string => {
        const existing = this.aliases.get(name)

        if (existing !== undefined) {
            return existing
        }

        return this.recordAlias(name)
    }

    private seqForName = (
        name: string,
        start: number,
        store: Map<string, number>
    ): string => {
        const current = store.get(name) ?? start

        store.set(name, current + 1)

        return String(current)
    }

    private recordAlias = (name: string): string => {
        const sequenceNo = this.seqForName(
            name,
            1,
            DslContext.globalSequenceNumbers
        )

        const value = `${name}${sequenceNo}`

        this.aliases.set(name, value)

        return value
    }
}
