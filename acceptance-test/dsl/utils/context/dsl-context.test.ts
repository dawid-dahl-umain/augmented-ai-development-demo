import { describe, it, expect } from "vitest"
import { DslContext } from "./dsl-context"
import { DslContext as ReExport } from "./index"

describe("DslContext", () => {
    it("should supply incremented alias across contexts", () => {
        // Given
        const context1 = new DslContext()
        const context2 = new DslContext()

        // When
        const alias1 = context1.alias("name")
        const alias2 = context2.alias("name")

        // Then
        expect(alias1).not.toBe(alias2)
    })

    it("should supply consistent alias within context", () => {
        // Given
        const context = new DslContext()

        // When
        const alias1 = context.alias("name")
        const alias2 = context.alias("name")

        // Then
        expect(alias1).toBe(alias2)
    })

    it("should increment per-context sequence without affecting other contexts", () => {
        // Given
        const context1 = new DslContext()
        const context2 = new DslContext()

        // When
        const first = context1.sequenceNumberForName("invoice", 10)
        const next = context1.sequenceNumberForName("invoice", 10)
        const isolated = context2.sequenceNumberForName("invoice", 10)

        // Then
        expect(first).toBe("10")
        expect(next).toBe("11")
        expect(isolated).toBe("10")
    })

    it("should keep alias deterministic within a context", () => {
        // Given
        const context = new DslContext()

        // When
        const first = context.alias("Buy milk")
        const second = context.alias("Buy milk")

        // Then
        expect(first).toBe("Buy milk1")
        expect(second).toBe("Buy milk1")
    })

    it("should re-export DslContext from index", () => {
        // Given
        const contextViaDirectImport = new DslContext()
        const contextViaReExport = new ReExport()

        // When
        const aliasFromDirect = contextViaDirectImport.alias("name")
        const aliasFromReExport = contextViaReExport.alias("name")

        // Then
        expect(aliasFromReExport.startsWith("name")).toBe(true)
        expect(typeof aliasFromReExport).toBe("string")
        expect(aliasFromReExport).not.toBe(aliasFromDirect)
    })

    describe("Worker isolation", () => {
        it("prevents collisions between different workers using the same name", () => {
            // Given
            const worker1Context = new DslContext("1")
            const worker2Context = new DslContext("2")

            // When
            const aliasFromWorker1 = worker1Context.alias("Acme Corp")
            const aliasFromWorker2 = worker2Context.alias("Acme Corp")

            // Then
            expect(aliasFromWorker1).toBe("Acme Corp-w1-1")
            expect(aliasFromWorker2).toBe("Acme Corp-w2-1")
            expect(aliasFromWorker1).not.toBe(aliasFromWorker2)
        })

        it("increments sequence per name within the same worker", () => {
            // Given
            const context = new DslContext("1")

            // When
            const first = context.alias("Client")
            const second = context.alias("Client")
            const thirdDifferentName = context.alias("Project")

            // Then
            expect(first).toBe("Client-w1-1")
            expect(second).toBe("Client-w1-1")
            expect(thirdDifferentName).toBe("Project-w1-1")
        })

        it("keeps sequences isolated per name per worker", () => {
            // Given
            const worker1Context = new DslContext("1")
            const worker2Context = new DslContext("2")

            // When
            const worker1Company = worker1Context.alias("Company")
            const worker1CompanyAgain = worker1Context.alias("Company")
            const worker2Company = worker2Context.alias("Company")

            // Then
            expect(worker1Company).toBe("Company-w1-1")
            expect(worker1CompanyAgain).toBe("Company-w1-1")
            expect(worker2Company).toBe("Company-w2-1")
        })
    })
})
