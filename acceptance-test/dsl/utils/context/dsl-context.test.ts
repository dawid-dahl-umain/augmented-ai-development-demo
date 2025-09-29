import { describe, expect, it } from "vitest"
import { DslContext } from "./dsl-context"
import { DslContext as ReExport } from "./dsl-context"

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
})
