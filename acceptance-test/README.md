# Acceptance Test Suite

Structure follows the four-layer model:

- executable-specs: business-facing tests
- dsl: domain-specific language exposing business actions
- drivers: connect DSL to SUT (CLI)
- sut: notes about the production-like target under test

Run sequence: build first, then run tests.
