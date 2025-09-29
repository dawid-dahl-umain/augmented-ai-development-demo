# Acceptance Test Suite

Structure follows the four-layer model:

-   executable-specs: business-facing tests
-   dsl: domain-specific language exposing business actions
-   drivers: connect DSL to SUT (CLI)
-   sut: notes about the production-like target under test

Run sequence: build first, then run tests.

## Isolation Utilities

-   Each `createDsl()` call builds a fresh `DslContext` and new drivers before every test, matching Dave Farley’s per-test setup.
-   DSL classes accept that context so helpers like `Params` can allocate unique aliases.
    The TicTacToe specs don’t depend on aliases yet, but `player.registerPlayer()` shows how to mint them for future scenarios (see `executable-specs/isolation.params.acceptance.spec.ts`).
