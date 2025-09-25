# Driver Layer Overview

The Tic Tac Toe CLI under test is **stateless**: every invocation accepts the
flag `--moves <csv>` and returns the entire transcript for that sequence. It
never persists game data between runs. The protocol drivers therefore provide
the state handling needed by acceptance tests:

-   `GameDriver.moveHistory` accumulates the moves collected via the DSL. Each
    action replays the entire history by calling the CLI with the joined CSV.
-   The CLI response (`stdout`, `code`) is stored in `lastResult`. All
    confirmations read from this cached result so we only parse once per action.
-   Rejections are recognised via the non-zero exit code while success keeps the
    exit code at zero.
-   When DSL code calls `reset`, the driver clears both `moveHistory` and
    `lastResult`, ensuring each scenario starts from an empty transcript.

This design keeps the driver API declarative while respecting the functional
style of the CLI. No global process state leaks between tests; replaying the
full history guarantees deterministic outputs for every scenario.
