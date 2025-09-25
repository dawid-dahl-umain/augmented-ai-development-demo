export class DslContext {
    private static globalSequences = new Map<string, number>()
    private sequences = new Map<string, number>()
    private aliases = new Map<string, string>()

    public sequence(name: string, start = 1): string {
        const current = this.sequences.get(name) ?? start
        this.sequences.set(name, current + 1)
        return String(current)
    }

    public alias(name: string): string {
        if (!this.aliases.has(name)) {
            const sequence = this.globalSequence(name)
            this.aliases.set(name, `${name}${sequence}`)
        }
        return this.aliases.get(name) as string
    }

    public reset(): void {
        this.sequences.clear()
        this.aliases.clear()
    }

    private globalSequence(name: string): number {
        const current = DslContext.globalSequences.get(name) ?? 1
        DslContext.globalSequences.set(name, current + 1)
        return current
    }
}
