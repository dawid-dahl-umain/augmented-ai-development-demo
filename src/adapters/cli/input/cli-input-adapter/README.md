# CLI Input Adapter

Purpose: Parse CLI lines (e.g., `start`, `move 5`, `help`, `quit`), call the TicTacToe domain accordingly, and notify a presenter/output port about results. No direct I/O; rendering is delegated to the presenter.

## Responsibilities

-   Parse and normalize commands from raw input lines
-   Maintain current `GameState` and evolve it via domain calls
-   Translate domain errors to presenter error messages
-   Notify presenter of state changes and game end

## Contract

-   Depends on `Presenter` port: `src/domain/tic-tac-toe/ports.ts`
-   Implements `CliInputAdapter` in `src/adapters/cli/input/cli-input-adapter.ts`

```ts
import type { Presenter } from "@/domain/tic-tac-toe/ports"
import { CliInputAdapter } from "./cli-input-adapter"

const presenter: Presenter = {
    presentState: state => {
        /* render state */
    },
    presentError: message => {
        /* render error */
    },
    presentHelp: () => {
        /* render help */
    },
    presentGameOver: state => {
        /* render final outcome */
    },
    presentQuit: () => {
        /* stop loop */
    }
}

const cli = new CliInputAdapter(presenter)
cli.handle("start")
cli.handle("move 5")
```

## Tests

-   See `src/adapters/cli/input/cli-input-adapter.spec.ts`

## Roadmap

-   Technical roadmap: `ai-roadmaps/technical/tictactoe-cli-input-adapter.md`
