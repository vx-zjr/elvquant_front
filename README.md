# elvquant_front

Chinese Streamlit thin client for local debugging of `elvquant_core`.

This repository is intentionally not a trading engine. It may select configs,
call public core entrypoints, and render reports. Strategy, risk, data provider
validation, order generation, accounting, metrics, broker routing, and secret
handling belong in `elvquant_core`.

The UI is now presented as `elvquant 本地交易驾驶舱`. It renders core outputs as
Chinese workflow labels, metric cards, charts, tables, Markdown reports, and raw
text. These visualizations are display logic only; any new trading behavior must
first be added as a public core entrypoint.

## Local Setup

Install the core next to this repository:

```powershell
cd ..\elvquant_core
.venv\Scripts\python -m pip install -e .
```

Install this frontend:

```powershell
cd ..\elvquant_front
py -m venv .venv
.venv\Scripts\python -m pip install --upgrade pip
.venv\Scripts\python -m pip install -e ".[dev]"
```

Run the local UI:

```powershell
.venv\Scripts\python -m streamlit run app.py
```

By default the UI looks for the core at `../elvquant_core`. Override with
`ELVQUANT_CORE_PATH` if your local checkout uses a different path.

## Quality Checks

```powershell
.venv\Scripts\python -m pytest
.venv\Scripts\python -m ruff check
```

## Boundary Rule

If this app needs a new business action, add it to `elvquant_core` first and
expose it through a public core entrypoint. Then call that entrypoint here.

The local paper workflow follows this rule by calling
`qts.paper.run_synthetic_paper_demo`; the UI does not construct trading engine,
risk, order, execution, or ledger objects.
