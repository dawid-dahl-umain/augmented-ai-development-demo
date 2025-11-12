/**
 * WorkerIdProvider supplies a unique identifier for the current test worker process.
 *
 * This abstraction allows DslContext to remain test-runner agnostic while supporting
 * parallel test execution across multiple processes. Different test runners can provide
 * their own worker ID implementations.
 */
export type WorkerIdProvider = () => string

/**
 * Vitest-specific worker ID provider.
 *
 * Uses VITEST_POOL_ID (worker thread number) when available, falling back to process ID.
 * This ensures unique aliases when test files run in parallel Vitest workers.
 *
 * @example
 * // Worker 1: VITEST_POOL_ID="1" → returns "1"
 * // Worker 2: VITEST_POOL_ID="2" → returns "2"
 * // No Vitest: returns process.pid (e.g., "12345")
 */
export const vitestWorkerIdProvider: WorkerIdProvider = () =>
    process.env.VITEST_POOL_ID ?? process.pid.toString()
