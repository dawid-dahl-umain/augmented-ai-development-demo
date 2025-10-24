# Technical Implementation Roadmap: Generic CLI Text Renderer

## Overview

Output adapter that formats arbitrary view models into plain text and writes to an injected sink. It is domain-agnostic; behavior is provided by injected templates and options. Domain-specific presenter adapters map domain events/state to renderer view models.

## Element Type

Output Adapter

## System View

No diagram needed – presenter adapter emits view models → renderer selects template → writes to sink.

## Integration Points

- **Connects to Domain**: Via a presenter adapter implementing the domain `Presenter` port; the adapter maps domain events/state to renderer view models
- **External Dependencies**: Writable sink (e.g., `process.stdout.write`) injected for testability
- **Data Flow**: ViewModel → template(view, options) → string → sink.write

## Spec References

- Rendering behavior guided by product/UX docs (e.g., ASCII layout, prompts)
- Domain specifications are referenced by the presenter adapter, not by the renderer

## Test Sequence

1. renders a simple view with a provided template to exact text (newline policy respected)
2. renders multiple sequential views preserving order and without extra whitespace
3. uses fallback template for unknown view types (configurable: error or noop)
4. supports grid/table-style layout via a template (stable ASCII spacing)
5. supports prompts/errors/messages with consistent formatting (via templates)
6. optional ANSI styling toggle (off by default) does not change content when disabled
7. does not hold state between calls; idempotent formatting given same input
8. handles writer failure gracefully (does not throw to caller)
9. handles template exceptions via fallback/error strategy
10. multi-line renders come from templates; renderer does not inject prefixes

## Test Strategy

**Primary approach**: Integration Tests

- Inject a fake writer to capture output; assert exact formatting and ordering
- Provide minimal template set in tests; verify renderer applies them faithfully
- Snapshot tests for complex layouts; string equality for simple cases

## Technical Constraints

- **Performance**: Millisecond rendering
- **Compatibility**: Node.js (ESM), plain ASCII (opt-in ANSI)
- **Security**: None (local I/O)

## Dependencies

- **Depends on**: Template registry and writer abstraction
- **Enables**: Domain-specific presenter adapters (e.g., TicTacToe) and consistent CLI UX

## Notes

- Keep renderer stateless and pure; side effects isolated to the injected writer
- Templates are pure functions `(view) => string` (or `string[]`)
- Centralize message text in the presenter adapter/templates; do not duplicate domain constants inside the renderer
