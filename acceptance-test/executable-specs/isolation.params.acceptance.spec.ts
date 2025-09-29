import { beforeEach, describe, expect, it } from "vitest"
import { createDsl, type Dsl } from "../dsl"

// Imaginary Spec Package: Player Handle Isolation
//
// Feature: Player handle minting for tournament rosters
//
//   Scenario: Player registers twice for the same roster
//     Given the organiser adds "Test Player" to a roster
//     When they add "Test Player" again for the same roster
//     Then the player handle should match the previous registration
//
//   Scenario: Player registers for two separate tournaments
//     Given the organiser opens two independent tournaments
//     When they add "Isolation Demo" to each tournament
//     Then the player handles should differ between tournaments

describe("Feature: Player handle minting for tournament rosters", () => {
    let dsl: Dsl

    beforeEach(() => {
        dsl = createDsl()
    })

    describe("Scenario: Player registers twice for the same roster", () => {
        it("should reuse the existing player handle", () => {
            // Given
            const first = dsl.player.registerPlayer({ name: "Test Player" })

            // When
            const second = dsl.player.registerPlayer({ name: "Test Player" })

            // Then
            expect(second).toEqual(first)
            expect(second.startsWith("Test Player")).toBe(true)
        })
    })

    describe("Scenario: Player registers for two separate tournaments", () => {
        it("should mint distinct player handles", () => {
            // Given
            const firstTournament = createDsl()
            const firstHandle = firstTournament.player.registerPlayer({
                name: "Isolation Demo"
            })

            // When
            const secondTournament = createDsl()
            const secondHandle = secondTournament.player.registerPlayer({
                name: "Isolation Demo"
            })

            // Then
            expect(secondHandle).not.toEqual(firstHandle)
            expect(secondHandle.startsWith("Isolation Demo")).toBe(true)
        })
    })
})
