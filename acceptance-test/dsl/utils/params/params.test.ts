import { describe, expect, it } from "vitest"
import { DslContext } from "../context/dsl-context"
import { Params } from "./params"

describe("Params", () => {
    describe("optional", () => {
        it("returns default when key missing", () => {
            // Given
            const context = new DslContext()
            const params = new Params(context, {
                One: "1",
                Two: "2"
            })

            // When
            const result = params.optional("Three", "3")

            // Then
            expect(result).toBe("3")
        })

        it("returns supplied value when key present", () => {
            // Given
            const context = new DslContext()
            const params = new Params(context, {
                One: "1",
                Two: "2"
            })

            // When
            const result = params.optional("One", "3")

            // Then
            expect(result).toBe("1")
        })

        it("ignores whitespace only entries", () => {
            // Given
            const context = new DslContext()
            const params = new Params(context, {
                name: "   "
            })

            // When
            const result = params.optional("name", "fallback")

            // Then
            expect(result).toBe("fallback")
        })
    })

    describe("optionalSequence", () => {
        it("returns provided sequence when present", () => {
            // Given
            const context = new DslContext()
            const params = new Params(context, {
                One: "1",
                Two: "2"
            })

            // When
            const result = params.optionalSequence("One", 3)

            // Then
            expect(result).toBe("1")
        })

        it("returns start value when key missing", () => {
            // Given
            const context = new DslContext()
            const params = new Params(context, {
                One: "1",
                Two: "2"
            })

            // When
            const result = params.optionalSequence("Three", 3)

            // Then
            expect(result).toBe("3")
        })

        it("increments sequence for repeated calls", () => {
            // Given
            const context = new DslContext()
            const params = new Params(context, {
                One: "1",
                Two: "2"
            })

            // When
            params.optionalSequence("Three", 5)
            const result = params.optionalSequence("Three", 5)

            // Then
            expect(result).toBe("6")
        })
    })

    describe("optionalList", () => {
        it("returns array values when provided", () => {
            // Given
            const context = new DslContext()
            const params = new Params(context, {
                item: ["invoice1", "invoice2"]
            })

            // When
            const result = params.optionalList("item", ["default"])

            // Then
            expect(result).toEqual(["invoice1", "invoice2"])
        })

        it("splits comma separated values", () => {
            // Given
            const context = new DslContext()
            const params = new Params(context, {
                item: "invoice1, invoice2"
            })

            // When
            const result = params.optionalList("item", ["default"])

            // Then
            expect(result).toEqual(["invoice1", "invoice2"])
        })

        it("falls back to default when key missing", () => {
            // Given
            const context = new DslContext()
            const params = new Params(context, {
                name: "test"
            })

            // When
            const result = params.optionalList("item", ["default"])

            // Then
            expect(result).toEqual(["default"])
        })

        it("filters array values that normalize to empty", () => {
            // Given
            const context = new DslContext()
            const params = new Params(context, {
                item: ["  ", "invoice2"],
                "  ": "ignored"
            })

            // When
            const result = params.optionalList("item", ["default"])

            // Then
            expect(result).toEqual(["invoice2"])
        })

        it("filters blank entries from array", () => {
            // Given
            const context = new DslContext()
            const params = new Params(context, {
                item: ["  ", ""]
            })

            // When
            const result = params.optionalList("item", ["default"])

            // Then
            expect(result).toEqual(["default"])
        })
    })

    describe("alias", () => {
        it("throws when alias key missing", () => {
            // Given
            const context = new DslContext()
            const params = new Params(context, {
                name: "nameTest"
            })

            // When
            const act = () => params.alias("name2")

            // Then
            expect(act).toThrowError("No 'name2' supplied for alias")
        })

        it("mints unique aliases across contexts", () => {
            // Given
            const firstContext = new DslContext()
            const secondContext = new DslContext()
            const paramsInFirst = new Params(firstContext, {
                name: "nameTest"
            })
            const paramsInSecond = new Params(secondContext, {
                name: "nameTest"
            })

            // When
            const firstAlias = paramsInFirst.alias("name")
            const secondAlias = paramsInSecond.alias("name")

            // Then
            expect(firstAlias).not.toBe(secondAlias)
        })

        it("returns same alias within a context", () => {
            // Given
            const context = new DslContext()
            const params = new Params(context, {
                name: "nameTest"
            })

            // When
            const firstAlias = params.alias("name")
            const secondAlias = params.alias("name")

            // Then
            expect(firstAlias).toBe(secondAlias)
        })
    })
})
