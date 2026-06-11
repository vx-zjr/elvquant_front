# React Institutional Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Streamlit thin client with a React + TypeScript institutional research cockpit backed by a thin FastAPI bridge to public `elvquant_core` APIs.

**Architecture:** Python owns the local API and all `qts.*` integration in a narrow core bridge. React owns only rendering, interaction state, and API calls. Durable project memory in `AGENTS.md`, `docs/PROJECT_MEMORY.md`, and this plan governs future iterations.

**Tech Stack:** FastAPI, Pydantic, Uvicorn, Vite, React, TypeScript, lucide-react, pytest, ruff.

---

## File Structure

- Create `AGENTS.md`: repository-level instruction to read/update durable docs every task.
- Create `docs/PROJECT_MEMORY.md`: product direction, architecture, boundary rules, workflow, validation commands.
- Create `docs/ITERATION_LOG.md`: task log, decisions, validation state, and open items.
- Create `elvquant_front/core_bridge.py`: public core imports, workflow runners, Stooq status, artifact discovery, report parsing, display formatting.
- Create `elvquant_front/api.py`: FastAPI app and JSON endpoints for the React client.
- Create `elvquant_front/__init__.py`: package marker.
- Replace `app.py`: compatibility entrypoint that runs the FastAPI app instead of Streamlit.
- Create `web/`: Vite React application.
- Modify `pyproject.toml`: package metadata, FastAPI dependencies, dev tools, ruff include rules.
- Modify `.circleci/config.yml`: Python QA plus frontend install/build.
- Modify `README.md`: new setup, run, validation, architecture, and boundary docs.
- Replace/update `tests/`: contract tests for docs, core bridge, API behavior, and boundary rules.

## Tasks

### Task 1: Durable Documentation Contract

**Files:**
- Create: `AGENTS.md`
- Create: `docs/PROJECT_MEMORY.md`
- Create: `docs/ITERATION_LOG.md`
- Create: `docs/superpowers/plans/2026-06-11-react-institutional-dashboard.md`
- Test: `tests/test_documentation_contract.py`

- [x] **Step 1: Write the documentation files**

Add repository rules, project memory, iteration log, and this plan.

- [x] **Step 2: Write the failing documentation contract test**

Test that the durable docs exist and contain the required workflow phrases.

- [x] **Step 3: Run the test to verify it fails before the test target exists**

Run: `python -m pytest tests/test_documentation_contract.py -q`

Expected before implementation: FAIL if the contract test is added before all required content exists.

- [x] **Step 4: Update docs until the test passes**

Run: `python -m pytest tests/test_documentation_contract.py -q`

Expected after implementation: PASS.

### Task 2: Core Bridge Contract

**Files:**
- Create: `elvquant_front/core_bridge.py`
- Create: `elvquant_front/__init__.py`
- Test: `tests/test_core_bridge.py`
- Modify: `tests/test_front_boundary.py`

- [x] **Step 1: Write failing tests**

Cover report parsing, metric formatting, Stooq missing data reporting, artifact discovery, and allowed public `qts.*` imports.

- [x] **Step 2: Verify red**

Run: `python -m pytest tests/test_core_bridge.py tests/test_front_boundary.py -q`

Expected: FAIL because `elvquant_front.core_bridge` does not exist yet.

- [x] **Step 3: Implement bridge**

Implement workflow metadata, runner lookup, parser, Stooq status/report helpers, artifact helpers, and core availability handling.

- [x] **Step 4: Verify green**

Run: `python -m pytest tests/test_core_bridge.py tests/test_front_boundary.py -q`

Expected: PASS.

### Task 3: FastAPI Contract

**Files:**
- Create: `elvquant_front/api.py`
- Replace: `app.py`
- Modify: `pyproject.toml`
- Test: `tests/test_api_contract.py`

- [x] **Step 1: Write failing API tests**

Use FastAPI `TestClient` to cover `/api/health`, `/api/workflows`, `/api/stooq/status`, `/api/artifacts`, and static fallback behavior.

- [x] **Step 2: Verify red**

Run: `python -m pytest tests/test_api_contract.py -q`

Expected: FAIL because the FastAPI app does not exist yet.

- [x] **Step 3: Implement API app**

Expose JSON endpoints, catch core exceptions as user-safe API errors, and serve `web/dist` when present.

- [x] **Step 4: Verify green**

Run: `python -m pytest tests/test_api_contract.py -q`

Expected: PASS.

### Task 4: React Cockpit

**Files:**
- Create: `package.json`
- Create: `package-lock.json`
- Create: `index.html`
- Create: `vite.config.ts`
- Create: `tsconfig.json`
- Create: `tsconfig.node.json`
- Create: `web/src/main.tsx`
- Create: `web/src/App.tsx`
- Create: `web/src/api.ts`
- Create: `web/src/types.ts`
- Create: `web/src/styles.css`

- [x] **Step 1: Create the frontend shell**

Build a full-screen dashboard, not a landing page: sidebar workflow rail, command bar, metric strip, chart panels, Stooq status, report tabs, raw output, and artifact browser.

- [x] **Step 2: Add API client and resilient states**

Implement loading, empty, unavailable-core, running, success, and error states.

- [x] **Step 3: Verify TypeScript and build**

Run: `npm run build`

Expected: Vite build exits 0.

### Task 5: Documentation, CI, and Handoff

**Files:**
- Modify: `README.md`
- Modify: `.circleci/config.yml`
- Modify: `docs/ITERATION_LOG.md`
- Modify: `docs/PROJECT_MEMORY.md`

- [x] **Step 1: Update README**

Document architecture, install, dev server, API server, build, tests, proxy note, and boundary rules.

- [x] **Step 2: Update CI**

Run Python QA and frontend build in CircleCI.

- [x] **Step 3: Run full validation**

Run: `python -m pytest`, `python -m ruff check`, and `npm run build`.

- [ ] **Step 4: Push and start local debug**

Commit, push branch to GitHub with proxy `http://localhost:7890`, then start the local API/frontend debug process and share the local URL.
