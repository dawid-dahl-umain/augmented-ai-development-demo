# Generic CLI Text Renderer

Purpose: Format domain-agnostic view models into plain text using injected templates, and write to an injected sink (e.g., `process.stdout`). Stateless and reusable across domains.

## Responsibilities

-   Accept view models from a presenter adapter
-   Select and execute a template per `view.type`
-   Write formatted text to an injected writer
-   Provide sane fallback for unknown types

## Contract (planned)

```ts
type ViewModel = { type: string; payload?: unknown }
type Template = (view: ViewModel, options?: Record<string, unknown>) => string
type Templates = Record<string, Template>
type Writer = { write: (text: string) => void }

type Renderer = { render: (view: ViewModel) => void }

// createCliTextRenderer({ writer, templates, options }): Renderer
```

Presenter adapter (configurable mapping):

```ts
import type { Presenter } from "@/adapters/ports/presenter"

type ViewModel = { type: string; payload?: unknown }
type Renderer = { render: (view: ViewModel) => void }

type PresenterMap = {
    presentState: (state: unknown) => ViewModel
    presentError?: (msg: string) => ViewModel
    presentHelp?: () => ViewModel
    presentGameOver?: (state: unknown) => ViewModel
    prompt?: (next: unknown) => ViewModel
    presentQuit?: () => ViewModel
}

export const createPresenter = (
    renderer: Renderer,
    map: PresenterMap
): Presenter => ({
    presentState: s => renderer.render(map.presentState(s)),
    presentError: m => map.presentError && renderer.render(map.presentError(m)),
    presentHelp: () => map.presentHelp && renderer.render(map.presentHelp()),
    presentGameOver: s =>
        map.presentGameOver && renderer.render(map.presentGameOver(s)),
    prompt: n => map.prompt && renderer.render(map.prompt(n)),
    presentQuit: () => map.presentQuit && renderer.render(map.presentQuit())
})

// Example mapping (TicTacToe). Another project would choose different types.
export const tictactoeMap: PresenterMap = {
    presentState: state => ({ type: "board", payload: state }),
    presentError: msg => ({ type: "error", payload: msg }),
    presentHelp: () => ({ type: "help" }),
    presentGameOver: state => ({ type: "gameOver", payload: state }),
    presentQuit: () => ({ type: "quit" })
}
```

## Tests

-   See `src/adapters/cli/output/cli-text-renderer.spec.ts` (currently RED/skip-list under AAID TDD)

## Roadmap

-   Technical roadmap: `ai-roadmaps/technical/cli-text-renderer-generic.md`

## Writer examples

```ts
// Production: write to console
const writer: Writer = { write: t => process.stdout.write(t) }

// Tests: capture output for assertions
const writes: string[] = []
const testWriter: Writer = { write: t => writes.push(t) }
```
