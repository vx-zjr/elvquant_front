# Repository Operating Rules

This repository is managed through durable project memory, not assistant memory alone.

Before starting any task in this repository:

1. Read `docs/PROJECT_MEMORY.md`.
2. Read the active plan under `docs/superpowers/plans/` when one exists.
3. Check `docs/ITERATION_LOG.md` for the latest decisions, known gaps, and validation state.

During every task:

- Keep frontend behavior aligned with the thin-client boundary: business logic, strategy logic,
  risk checks, data preparation, order modeling, accounting, routing, and secrets stay in
  `elvquant_core`.
- Update the relevant docs when architecture, workflow, trade-offs, setup, or validation changes.
- Prefer test-first changes for Python API behavior and contract-sensitive frontend behavior.
- Do not commit secrets, API keys, local `.env` files, generated virtualenvs, build outputs, or
  local cache directories.

Before finishing every task:

1. Run the documented validation commands.
2. Update `docs/ITERATION_LOG.md` with what changed and what remains.
3. Make sure `README.md` still reflects how to install, run, test, and develop the app.

