import { WorkerIdProvider } from "../worker-id-provider"

/**
 * DslContext manages test data isolation through unique aliasing.
 *
 * Default behavior (Dave Farley's pattern):
 * - Creates simple sequential aliases: "Acme Corp" → "Acme Corp1", "Acme Corp2", etc.
 * - Works for single-process test execution (sequential or thread-parallel within one process)
 *
 * Optional worker isolation (for multi-process parallel execution):
 * - Namespaces aliases by worker ID to prevent collisions across separate processes
 * - "Acme Corp" → "Acme Corp-w1-1" (worker 1), "Acme Corp-w2-1" (worker 2)
 * - Required when test files run in separate processes (e.g., Vitest parallel mode)
 *
 * @example
 * // Default (Dave's original pattern)
 * const context = new DslContext()
 * context.alias('Acme Corp') // → "Acme Corp1"
 *
 * @example
 * // With worker isolation (for parallel test files)
 * import { vitestWorkerIdProvider } from './worker-id-provider'
 * const context = new DslContext(vitestWorkerIdProvider)
 * context.alias('Acme Corp') // → "Acme Corp-w1-1"
 *
 * @example
 * // With explicit worker ID (for testing)
 * const context = new DslContext('test-worker')
 * context.alias('Acme Corp') // → "Acme Corp-wtest-worker-1"
 */
export class DslContext {
    /**
     * Static = ONE map shared by ALL DslContext instances across all tests/files.
     * Each test creates `new Dsl()` → `new DslContext()`, but they all use this same counter.
     * Ensures unique sequential suffixes for temporal isolation (test 1 → "1", test 2 → "2", etc).
     */
    private static readonly globalSequenceNumbers = new Map<string, number>()
    private readonly workerId: string | null
    private readonly sequenceNumbers = new Map<string, number>()
    private readonly aliases = new Map<string, string>()

    constructor(workerIdOrProvider?: string | WorkerIdProvider) {
        if (!workerIdOrProvider) {
            this.workerId = null
        } else if (typeof workerIdOrProvider === "function") {
            this.workerId = workerIdOrProvider()
        } else {
            this.workerId = workerIdOrProvider
        }
    }

    public sequenceNumberForName = (name: string, start: number): string =>
        this.seqForName(name, start, this.sequenceNumbers)

    public alias = (name: string): string => {
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
        const namespacedKey = this.workerId ? `${this.workerId}:${name}` : name
        const sequenceNo = this.seqForName(
            namespacedKey,
            1,
            DslContext.globalSequenceNumbers
        )

        const value = this.workerId
            ? `${name}-w${this.workerId}-${sequenceNo}`
            : `${name}${sequenceNo}`

        this.aliases.set(name, value)

        return value
    }
}
