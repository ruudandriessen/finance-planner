# AGENTS.md

## Cursor Cloud specific instructions

### Product

Finance Planner is a **client-side** React SPA. All data persists in browser `localStorage` via TanStack React DB. There is no backend, database, or `.env` configuration.

### Runtime

- **Bun** is the package manager and script runner (`bun.lock`). Ensure `~/.bun/bin` is on `PATH` (installed via `curl -fsSL https://bun.sh/install | bash`).
- See `README.md` for architecture overview and `agent.md` for detailed agent/dev guide.

### Services

| Service         | Command       | Port | Required                   |
| --------------- | ------------- | ---- | -------------------------- |
| Vite dev server | `bun run dev` | 5173 | Yes (only runtime service) |

Start the dev server in a tmux session so it stays running across commands.

### Common commands

All commands are defined in `package.json`:

- **Install deps**: `bun install`
- **Dev server**: `bun run dev`
- **Lint**: `bun run lint` (oxlint)
- **Format check**: `bun run format:check` (oxfmt)
- **Lint + format**: `bun run check`
- **Test**: `bun run test -- --run` (Vitest; simulator unit tests only)
- **Build**: `bun run build`
- **Preview prod build**: `bun run preview`

CI runs build, lint, test, and knip — see `.github/workflows/ci.yml`.

### Gotchas

- Vite binds to `localhost:5173` by default; use `--host` only if external access is needed.
- The dev server runs TypeScript checking via `vite-plugin-checker`; TS errors appear in the terminal alongside HMR.
- No Playwright/Cypress E2E framework is configured; manual browser testing is required for UI flows.
- `bun run depcruise:visual` requires system `graphviz` (`dot`); not needed for normal development.
