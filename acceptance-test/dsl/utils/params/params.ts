import { DslContext } from "../context"

/**
 * Maps DSL arguments to named values for acceptance tests.
 * @example const params = new Params(new DslContext(), { name: "Alison" })
 */
export class Params {
    private readonly context: DslContext
    private readonly values: Map<string, string[]>

    constructor(context: DslContext, args: ParamsArgs) {
        this.context = context
        this.values = Params.normalizeArgs(args)
    }

    /**
     * Retrieves a value or falls back to the supplied default.
     * @example params.optional("role", "Accountant")
     */
    optional = (name: string, defaultValue: string): string =>
        this.getFirstValue(name) ?? defaultValue

    /**
     * Creates or retrieves a unique alias for a name.
     * Functional isolation: prevents tests sharing logical entities.
     * Temporal isolation: repeat runs yield consistent aliases (e.g. "Buy milk" ⇒ "Buy milk1").
     * @example params.alias("name")
     */
    alias = (name: string): string => {
        const value = this.getFirstValue(name)

        if (value === undefined) {
            throw new Error(`No '${name}' supplied for alias`)
        }

        return this.context.alias(value)
    }

    /**
     * Retrieves a value or synthesizes a per-context sequence entry.
     * Supports functional isolation by generating fresh identifiers when omitted.
     * @example params.optionalSequence("invoice", 1)
     */
    optionalSequence = (name: string, start: number): string =>
        this.getFirstValue(name) ??
        this.context.sequenceNumberForName(name, start)

    /**
     * Retrieves zero or more values or falls back to defaults.
     * Useful for DSL steps that accept multi-valued inputs without extra conditional logic.
     * @example params.optionalList("item", ["item1", "item2"])
     */
    optionalList = (name: string, defaults: string[]): string[] => {
        const list = this.values.get(name)
        return list?.length ? [...list] : [...defaults]
    }

    private getFirstValue = (name: string): string | undefined =>
        this.values.get(name)?.[0]

    private static normalizeArgs = (args: ParamsArgs): Map<string, string[]> =>
        Object.entries(args).reduce((map, [key, value]) => {
            const normalizedKey = key.trim()

            if (!normalizedKey) {
                return map
            }

            const normalizedValues = Params.normalizeValue(value)

            if (normalizedValues.length === 0) {
                return map
            }

            map.set(normalizedKey, normalizedValues)

            return map
        }, new Map<string, string[]>())

    private static normalizeValue = (value: string | string[]): string[] => {
        if (Array.isArray(value)) {
            return value
                .map(item => item.trim())
                .filter(item => item.length > 0)
        }

        return value
            .split(",")
            .map(item => item.trim())
            .filter(item => item.length > 0)
    }
}

export type ParamsArgs = Record<string, string | string[]>
