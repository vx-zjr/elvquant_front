"""Streamlit thin client for elvquant_core local debugging."""

from __future__ import annotations

import os
from collections.abc import Callable
from pathlib import Path

import streamlit as st

ReportRunner = Callable[[], str]


def main() -> None:
    st.set_page_config(page_title="elvquant front", layout="wide")
    st.title("elvquant")
    st.caption("Thin local client over elvquant_core")

    runners = _core_runners()
    if not runners:
        st.error("elvquant_core is not installed in this Python environment.")
        st.code("python -m pip install -e ../quant-trading-agent", language="powershell")
        return

    workflow = st.sidebar.radio("Workflow", tuple(runners), index=0)
    st.sidebar.info(
        "This UI only calls public core entrypoints. Strategy, risk, data, metrics, "
        "orders, and secrets stay in elvquant_core."
    )
    st.sidebar.caption(f"Core path: {_core_root()}")

    if st.button("Run", type="primary"):
        with st.spinner(f"Running {workflow}..."):
            output = runners[workflow]()
        st.subheader(workflow)
        st.code(output, language="text")

    st.divider()
    _artifact_viewer()


def _core_runners() -> dict[str, ReportRunner]:
    try:
        from qts.historical import run_historical_smoke
        from qts.ml import compare_ml_to_momentum
        from qts.simple import run_synthetic_demo
        from qts.strategies import compare_momentum_to_equal_weight
    except ImportError:
        return {}

    core_root = _core_root()
    fred_sample = core_root / "data/historical/fred_index_sample.csv"
    readiness_report = core_root / "reports/readiness/live_readiness.md"

    return {
        "Synthetic demo": lambda: run_synthetic_demo().text,
        "Historical smoke": lambda: run_historical_smoke(fred_sample).text,
        "Momentum vs equal weight": lambda: compare_momentum_to_equal_weight(fred_sample).text,
        "ML vs momentum": lambda: compare_ml_to_momentum(fred_sample).text,
        "Readiness report": lambda: readiness_report.read_text(encoding="utf-8"),
    }


def _artifact_viewer() -> None:
    st.subheader("Local artifacts")
    default_artifact = _core_root() / "reports/readiness/live_readiness.md"
    artifact_path = st.text_input("Artifact path", value=str(default_artifact))
    path = Path(artifact_path)
    if st.button("Load artifact"):
        if not path.exists():
            st.warning(f"File not found: {path}")
            return
        st.markdown(path.read_text(encoding="utf-8"))


def _core_root() -> Path:
    return Path(os.environ.get("ELVQUANT_CORE_PATH", "../quant-trading-agent")).resolve()


if __name__ == "__main__":
    main()
