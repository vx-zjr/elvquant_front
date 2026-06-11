# Iteration Log

This log records decisions and validation for each task. Keep it current so future work starts from
evidence rather than memory.

## 2026-06-11 - React Institutional Dashboard Rebuild

### Intent

Rebuild `elvquant_front` from a Streamlit thin client into a React + TypeScript + FastAPI research
cockpit, while preserving the rule that all strategy, data, risk, accounting, and secret handling
stays in `elvquant_core`.

### Decisions

- Use Vite + React + TypeScript for the browser UI.
- Use FastAPI as a thin local API layer over public `qts.*` runner/config functions.
- Add repository rules in `AGENTS.md` so each future task reads and updates durable docs.
- Keep design direction high-density and operational: no landing page, no marketing hero, no
  decorative card stacks, and no broad single-hue palette.

### Validation Notes

- Initial repository state: clean `main`, then feature branch `codex/react-institutional-dashboard`.
- System `npm` is not on `PATH`; bundled Node exists at
  `C:\Users\Administrator\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe`.
- Bundled Python exists at
  `C:\Users\Administrator\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe`.
- Created repo-local `.nodeenv` with Node 24.14.0 because Windows PATH had a restricted `node.exe`
  and no global `npm`.
- `python -m pytest -q`: 18 passed, 1 FastAPI/Starlette deprecation warning.
- `python -m ruff check`: all checks passed.
- `npm.cmd run build`: Vite build passed after prepending `.nodeenv\Scripts` to `PATH`.

### Completed

- Added durable workflow docs: `AGENTS.md`, `docs/PROJECT_MEMORY.md`, active Superpowers plan, and
  this iteration log.
- Replaced the Streamlit implementation with a FastAPI bridge in `elvquant_front/api.py` and public
  core integration in `elvquant_front/core_bridge.py`.
- Built a Vite + React + TypeScript cockpit with workflow rail, run command, health/status tiles,
  metric cards, Stooq readiness, report tabs, raw output, and artifact list.
- Added Python contract tests for docs, API shape, core bridge behavior, report parsing, and boundary
  enforcement.
- Added npm lockfile and CI steps for React build.

### Open Items

- Push branch to `vx-zjr/elvquant_front` using proxy `localhost:7890`.
- Start local debugging server for user review.
