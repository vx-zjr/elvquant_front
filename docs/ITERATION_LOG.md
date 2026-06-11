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

## 2026-06-11 - Institutional UI/UX Upgrade

### Intent

Second-pass design upgrade after review feedback: the current React cockpit is functional but still
not professional enough for the bar of a top-tier quantitative institution. This pass prioritizes
front-end experience, information architecture, motion, and workstation completeness over strict
visual alignment with current backend/core breadth.

### Decisions

- Keep the FastAPI/core bridge intact.
- Let the frontend expose professional research-workstation surfaces first: execution ladder, risk
  board, scenario matrix, latency/heartbeat, audit stream, workflow search, denser metric deck, and
  stronger report console.
- Use CSS transitions and keyframes for subtle operational motion without adding animation libraries.

### Validation Notes

- Red check: `python -m pytest tests/test_front_boundary.py -q` failed until professional
  workstation surfaces were added.
- Browser QA: desktop viewport 1440x900 renders command deck, tape, system grid, metric deck,
  Execution Ladder, Risk Board, Scenario Matrix, and Audit Stream without first-viewport overlap.
- `python -m pytest -q`: 19 passed, 1 FastAPI/Starlette deprecation warning.
- `python -m ruff check`: all checks passed.
- `npm.cmd run build`: Vite build passed.

### Completed

- Rebuilt the cockpit shell into a denser institutional workstation.
- Added workflow search, market/status tape, expanded system telemetry, professional metric deck,
  Execution Ladder, Risk Board, Scenario Matrix, Report Surface, and Audit Stream.
- Added hover/active transitions, live pulse animation, panel entrance motion, animated loading icon,
  richer responsive layout, and stronger hierarchy.

### Main Branch Publish

- User clarified that the GitHub main branch should be updated directly, not only the feature branch.
- Publish strategy: fast-forward `main` to this branch and push `origin/main` through proxy
  `http://localhost:7890`; do not force-push or rewrite remote history.
- Validation basis before direct publish: `python -m pytest -q` passed with 19 tests, `python -m
  ruff check` passed, and `npm.cmd run build` produced a successful Vite production build.
