<!-- 52fa78bb-1a50-4664-966e-fa1d64836c15 e8baede6-6443-43d1-ab02-466f7ac4afe1 -->
# Web Acceptance Specs Rollout

## Summary

Mirror the CLI executable specifications in `acceptance-test/executable-specs/web.acceptance.spec.ts`, progressing epic by epic so we can validate Playwright support and catch issues early.

## Steps

1. **map-cli-coverage** – Enumerate the BDD scenarios already implemented in `acceptance-test/executable-specs/cli.acceptance.spec.ts` and confirm the corresponding DSL calls (e.g., `dsl.game.startNewGame()`, `dsl.game.playMoves()`, `dsl.board.confirmUpdatedBoardDisplayed()`), noting any async usage differences relevant for the web protocol.
2. **extend-web-epic1** – Implement Epic 1 “Game Initialization” scenarios in the web executable spec, mirroring CLI structure, then run `TEST_PROTOCOL=web pnpm exec vitest run acceptance-test/executable-specs/web.acceptance.spec.ts` to verify.
3. **extend-web-epic2** – Add Epic 2 “Making Moves” scenarios, ensure required DSL methods are awaited correctly for the web driver, and rerun the targeted web acceptance tests.
4. **extend-web-epic3** – Implement Epic 3 “Win Detection” scenarios, confirm Playwright driver coverage, and rerun the web suite.
5. **extend-web-epic4** – Add Epic 4 “Game End States” scenarios and the technical feedback cases, adjust driver support if needed, and execute the final web acceptance test run.
6. **validate-driver-support** – After each epic is added, review `acceptance-test/protocol-driver/web/driver.ts` (and shared interfaces) to address any DSL gaps or Playwright interaction issues uncovered by the tests.

## Test Runs

- After each epic update, run `TEST_PROTOCOL=web pnpm exec vitest run acceptance-test/executable-specs/web.acceptance.spec.ts` to detect regressions immediately.

### To-dos

- [ ] Cross-reference CLI specs with BDD scenarios and note the DSL method usage patterns.
- [ ] Add the missing web acceptance scenarios mirroring the CLI executable specs with proper awaits.
- [ ] Ensure the web protocol driver fully supports the DSL calls used by the new tests, updating driver logic where needed.
- [ ] Run the web acceptance suite with TEST_PROTOCOL=web to verify all tests pass.