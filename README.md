# elvquant_front

`elvquant_front` is the local React research cockpit for `elvquant_core`. It is an institutional-style
thin client: dense, operational, and built for local research/debugging workflows.

It is not a trading engine. The frontend only does three things:

- select local workflows and inspect readiness
- call public APIs exposed by `elvquant_core`
- render metrics, charts, reports, status, and raw output

Strategy logic, risk controls, data preparation, order modeling, broker routing, accounting, and
secret handling stay in `elvquant_core`.

## Architecture

```text
elvquant_front/
  elvquant_front/
    api.py          # FastAPI app and JSON endpoints
    core_bridge.py  # only public qts.* imports, report parsing, artifact discovery
  web/src/          # Vite + React + TypeScript cockpit
  docs/             # durable project memory, plans, and iteration log
```

The React app talks to `/api/*`. In development, Vite proxies `/api` to FastAPI on port `8000`. In
production/local single-server mode, FastAPI serves `web/dist` after `npm run build`.

## Durable Project Memory

Every task should start by reading:

- `AGENTS.md`
- `docs/PROJECT_MEMORY.md`
- the active plan in `docs/superpowers/plans/`
- `docs/ITERATION_LOG.md`

Update those docs whenever architecture, workflow, validation, or known gaps change. The project is
intentionally managed through repo documents instead of relying on model memory alone.

## Local Setup

Default sibling layout:

```text
work/
  elvquant_core/
  elvquant_front/
```

Install core first:

```powershell
cd ..\elvquant_core
py -m venv .venv
.\.venv\Scripts\python -m pip install --upgrade pip
.\.venv\Scripts\python -m pip install -e .
```

Install this frontend API:

```powershell
cd ..\elvquant_front
py -m venv .venv
.\.venv\Scripts\python -m pip install --upgrade pip
.\.venv\Scripts\python -m pip install -e ".[dev]"
.\.venv\Scripts\python -m pip install -e ..\elvquant_core
```

Install web dependencies:

```powershell
npm ci
```

If Windows has no usable `npm` on `PATH`, create a repo-local Node/npm with `nodeenv`:

```powershell
.\.venv\Scripts\python -m pip install nodeenv
.\.venv\Scripts\python -m nodeenv --node=24.14.0 --force .nodeenv
$env:PATH=(Resolve-Path .nodeenv\Scripts).Path + ";" + $env:PATH
npm.cmd ci
```

When using a local proxy, set it before installs or pushes:

```powershell
$env:HTTP_PROXY="http://localhost:7890"
$env:HTTPS_PROXY="http://localhost:7890"
```

If core is not in the default sibling directory, set:

```powershell
$env:ELVQUANT_CORE_PATH="C:\path\to\elvquant_core"
```

## Run Locally

Terminal 1, start the FastAPI bridge:

```powershell
.\.venv\Scripts\python -m uvicorn elvquant_front.api:app --host 127.0.0.1 --port 8000 --reload
```

Terminal 2, start the React dev server:

```powershell
npm.cmd run dev
```

Open:

```text
http://127.0.0.1:5173
```

Single-server build mode:

```powershell
npm.cmd run build
.\.venv\Scripts\python -m uvicorn elvquant_front.api:app --host 127.0.0.1 --port 8000
```

Open:

```text
http://127.0.0.1:8000
```

## Stooq Real Data Research

The cockpit exposes the Stooq real-data research workflow, but real data preparation remains in core.

The frontend checks:

```text
elvquant_core/configs/stooq_etf_momentum.example.toml
elvquant_core/data/processed/stooq_etf_eod.csv
```

If the processed file is missing, the UI displays Chinese operator-safe status and expected raw CSV
cache names. Downloading, standardization, point-in-time validation, and research calculation stay in
`elvquant_core`.

If Stooq requires an API key, set `STOOQ_API_KEY` only in the core runtime environment or a core-side
gitignored `.env`. Do not commit keys or write them into frontend files.

## Quality Gates

```powershell
python -m pytest
python -m ruff check
npm.cmd run build
```

On this Codex desktop host, the npm build may need the repo-local Node/npm first:

```powershell
$env:PATH=(Resolve-Path .nodeenv\Scripts).Path + ";" + $env:PATH
npm.cmd run build
```

The tests verify:

- durable documentation exists and points future work to project memory
- only allowed public `qts.*` runner/config APIs are imported
- forbidden core business objects are not constructed in the frontend bridge
- no obvious secret assignment strings exist in frontend/bridge files
- report parsing, Stooq missing-data messaging, artifact discovery, and API shapes stay stable

## Boundary Rule

If the frontend needs a new business action, implement and expose it in `elvquant_core` first. Then
consume that public entrypoint from `elvquant_front/core_bridge.py`.
