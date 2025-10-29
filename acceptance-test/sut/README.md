# System Under Test

The system under test is the compiled game artifacts produced by `pnpm build`:

- The **CLI protocol driver** spawns `node dist/index.js` and validates the textual transcript.
- The **web protocol driver** serves `public/` with `dist/` assets via `dist/adapters/web/server.js` and interacts with the DOM through Playwright.

Both drivers exercise the same production build; tests never hit TypeScript sources directly.
