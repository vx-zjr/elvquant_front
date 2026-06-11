# Institutional UI/UX Upgrade Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade the React cockpit from a functional dashboard into a polished, high-density institutional quant workstation with stronger layout, richer operator surfaces, clearer hierarchy, and motion.

**Architecture:** Keep the existing FastAPI/core bridge untouched. Frontend may introduce UI-only professional workstation surfaces derived from current API responses, parsed metrics, status, and deterministic placeholder states when backend data is not yet available.

**Tech Stack:** React, TypeScript, Vite, lucide-react, CSS transitions/keyframes, pytest frontend contract checks.

---

## File Structure

- Modify `web/src/App.tsx`: redesign shell, workflow search, command center, market/status tape, metric deck, execution ladder, risk board, scenario matrix, audit stream, improved tabs.
- Modify `web/src/styles.css`: rebuild visual system, responsive grid, motion, hover states, dense institutional spacing, better typography and color balance.
- Modify `tests/test_front_boundary.py`: assert professional UI surfaces are present.
- Modify `docs/ITERATION_LOG.md`: record the second-pass design intent and validation.
- Modify `docs/PROJECT_MEMORY.md`: record that front-end design quality can lead backend alignment for this phase.

## Tasks

### Task 1: Professional UI Contract

**Files:**
- Modify: `tests/test_front_boundary.py`

- [x] **Step 1: Write failing professional-surface checks**

Assert that the React source includes `Execution Ladder`, `Risk Board`, `Scenario Matrix`, `Audit Stream`, `Latency`, and `workflow-search`.

- [x] **Step 2: Verify red**

Run: `python -m pytest tests/test_front_boundary.py -q`

Expected before implementation: FAIL because the current cockpit does not expose these surfaces.

### Task 2: React Workstation Redesign

**Files:**
- Modify: `web/src/App.tsx`
- Modify: `web/src/styles.css`

- [x] **Step 1: Implement the workstation shell**

Add a left rail with workflow search, top command/status deck, animated market tape, professional metric deck, execution ladder, risk board, scenario matrix, report console, and audit/artifact stream.

- [x] **Step 2: Add interaction and motion**

Add hover/active transitions, animated progress steps, skeleton shimmer while loading/running, tab/section transitions, and resilient empty states.

- [x] **Step 3: Verify green**

Run: `python -m pytest tests/test_front_boundary.py -q` and `npm.cmd run build`.

Expected after implementation: PASS.

### Task 3: Browser QA and Handoff

**Files:**
- Modify: `docs/ITERATION_LOG.md`
- Modify: `docs/PROJECT_MEMORY.md`

- [x] **Step 1: Rebuild and inspect locally**

Run the React build, reload `http://127.0.0.1:8000`, verify the page is nonblank, core connected, and key surfaces render without overlap.

- [x] **Step 2: Run full validation**

Run: `python -m pytest -q`, `python -m ruff check`, `npm.cmd run build`.

- [ ] **Step 3: Commit and push**

Commit the UI/UX upgrade and push to `origin/codex/react-institutional-dashboard` through the local proxy.
