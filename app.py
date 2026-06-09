"""Chinese Streamlit thin client for elvquant_core local debugging."""

from __future__ import annotations

import os
from collections.abc import Callable
from pathlib import Path
from typing import Any

import pandas as pd
import streamlit as st

ReportRunner = Callable[[], str]

METRIC_LABELS = {
    "net_value": "净值",
    "total_return": "总收益",
    "max_drawdown": "最大回撤",
    "turnover": "换手率",
    "total_cost": "总成本",
    "cost_to_return": "成本/收益",
    "risk_rejections": "风控拒绝",
    "ending_equity": "期末权益",
    "total_orders": "订单数",
}

PERCENT_METRICS = {"total_return", "max_drawdown", "turnover", "cost_to_return"}


def main() -> None:
    st.set_page_config(page_title="elvquant 本地交易驾驶舱", layout="wide")
    _inject_styles()

    st.title("elvquant 本地交易驾驶舱")
    st.caption("核心之上的中文薄客户端：选择参数、调用公开入口、渲染结果。")

    runners = _core_runners()
    if not runners:
        st.error("当前 Python 环境没有安装 elvquant_core。")
        st.code("python -m pip install -e ../elvquant_core", language="powershell")
        return

    workflow_names = tuple(runners)
    default_workflow = workflow_names.index("本地模拟盘") if "本地模拟盘" in workflow_names else 0
    workflow = st.sidebar.radio("工作流", workflow_names, index=default_workflow)
    show_raw = st.sidebar.checkbox("显示原始输出", value=True)
    st.sidebar.info(
        "UI 只负责选择、触发和展示。策略、风控、数据、订单、记账、密钥都留在 "
        "elvquant_core。"
    )
    st.sidebar.caption(f"核心目录：{_core_root()}")

    controls, status = st.columns([1, 3])
    with controls:
        run_clicked = st.button("运行所选流程", type="primary", use_container_width=True)
    with status:
        st.write(f"当前流程：**{workflow}**")

    if run_clicked:
        with st.spinner(f"正在运行：{workflow}"):
            st.session_state["last_workflow"] = workflow
            st.session_state["last_output"] = runners[workflow]()

    output = st.session_state.get("last_output")
    if isinstance(output, str):
        _render_report(
            title=str(st.session_state.get("last_workflow", workflow)),
            text=output,
            show_raw=show_raw,
        )

    st.divider()
    _artifact_viewer()


def _core_runners() -> dict[str, ReportRunner]:
    try:
        from qts.historical import run_historical_smoke
        from qts.ml import compare_ml_to_momentum
        from qts.paper import run_synthetic_paper_demo
        from qts.simple import run_synthetic_demo
        from qts.strategies import compare_momentum_to_equal_weight
    except ImportError:
        return {}

    core_root = _core_root()
    fred_sample = core_root / "data/historical/fred_index_sample.csv"
    readiness_report = core_root / "reports/readiness/live_readiness.md"
    paper_output = core_root / "paper_runs/streamlit-synthetic-paper-demo"

    return {
        "合成数据回测": lambda: run_synthetic_demo().text,
        "历史数据烟雾测试": lambda: run_historical_smoke(fred_sample).text,
        "动量 vs 等权": lambda: compare_momentum_to_equal_weight(fred_sample).text,
        "ML 研究 vs 动量": lambda: compare_ml_to_momentum(fred_sample).text,
        "本地模拟盘": lambda: run_synthetic_paper_demo(output_dir=paper_output).text,
        "上线准备报告": lambda: readiness_report.read_text(encoding="utf-8"),
    }


def _render_report(title: str, text: str, show_raw: bool) -> None:
    parsed = _parse_report_text(text)
    metrics = parsed["metrics"]
    daily_rows = parsed["daily_rows"]

    st.subheader(title)
    if metrics:
        _render_metric_grid(metrics)

    tabs = st.tabs(["关键指标", "图表", "报告文本", "原始输出"])
    with tabs[0]:
        if metrics:
            _render_metric_table(metrics)
        else:
            st.markdown(text)
    with tabs[1]:
        if daily_rows:
            _render_daily_rows(daily_rows)
        elif metrics:
            _render_metric_chart(metrics)
        else:
            st.info("这个报告没有可绘制的数值序列。")
    with tabs[2]:
        st.markdown(text)
    with tabs[3]:
        if show_raw:
            st.code(text, language="text")
        else:
            st.caption("原始输出已在侧边栏隐藏。")


def _render_metric_grid(metrics: dict[str, float]) -> None:
    ordered_keys = [key for key in METRIC_LABELS if key in metrics]
    if not ordered_keys:
        ordered_keys = list(metrics)[:6]

    columns = st.columns(min(3, max(1, len(ordered_keys))))
    for index, key in enumerate(ordered_keys[:8]):
        columns[index % len(columns)].metric(
            METRIC_LABELS.get(key, key),
            _format_metric(key, metrics[key]),
        )


def _render_metric_table(metrics: dict[str, float]) -> None:
    rows = [
        {"指标": METRIC_LABELS.get(key, key), "值": _format_metric(key, value)}
        for key, value in metrics.items()
    ]
    st.dataframe(rows, use_container_width=True, hide_index=True)


def _render_metric_chart(metrics: dict[str, float]) -> None:
    rows = [
        {"指标": METRIC_LABELS.get(key, key), "数值": value}
        for key, value in metrics.items()
        if key not in {"run_id"}
    ]
    if rows:
        st.bar_chart(pd.DataFrame(rows), x="指标", y="数值", use_container_width=True)


def _render_daily_rows(rows: list[dict[str, Any]]) -> None:
    frame = pd.DataFrame(rows)
    chart_frame = frame[["date", "equity"]].copy()
    st.line_chart(chart_frame, x="date", y="equity", use_container_width=True)
    display_rows = [
        {
            "日期": row["date"],
            "权益": f"{row['equity']:,.2f}",
            "订单数": f"{row['orders']:.0f}",
            "风控": "通过" if row["risk_allowed"] else "拒绝",
        }
        for row in rows
    ]
    st.table(display_rows)


def _artifact_viewer() -> None:
    st.subheader("本地报告")
    candidates = _artifact_candidates(_core_root())
    default_artifact = str(candidates[0]) if candidates else str(
        _core_root() / "reports/readiness/live_readiness.md"
    )
    selected = st.selectbox("报告文件", [str(path) for path in candidates] or [default_artifact])
    artifact_path = st.text_input("报告路径", value=selected)
    path = Path(artifact_path)
    if st.button("加载报告", use_container_width=False):
        if not path.exists():
            st.warning(f"没有找到文件：{path}")
            return
        _render_report(title=path.name, text=path.read_text(encoding="utf-8"), show_raw=True)


def _artifact_candidates(core_root: Path) -> list[Path]:
    roots = [core_root / "paper_runs", core_root / "reports"]
    files: list[Path] = []
    for root in roots:
        if root.exists():
            files.extend(path for path in root.rglob("*.md") if path.is_file())
    return sorted(files, key=lambda path: path.stat().st_mtime, reverse=True)[:30]


def _parse_report_text(text: str) -> dict[str, Any]:
    fields: dict[str, str] = {}
    metrics: dict[str, float] = {}
    daily_rows: list[dict[str, Any]] = []

    for line in text.splitlines():
        clean = line.strip()
        if not clean:
            continue
        if clean.startswith("|"):
            row = _parse_daily_row(clean)
            if row:
                daily_rows.append(row)
            continue
        if clean.startswith("#"):
            continue
        normalized = clean[2:].strip() if clean.startswith("- ") else clean
        if ":" not in normalized:
            continue
        key, value = normalized.split(":", 1)
        key = key.strip()
        value = value.strip()
        fields[key] = value
        numeric_value = _as_float(value)
        if numeric_value is not None:
            metrics[key] = numeric_value

    return {"fields": fields, "metrics": metrics, "daily_rows": daily_rows}


def _parse_daily_row(line: str) -> dict[str, Any] | None:
    cells = [cell.strip() for cell in line.strip("|").split("|")]
    if len(cells) < 5 or cells[0] == "date" or cells[0].startswith("---"):
        return None
    equity = _as_float(cells[1])
    orders = _as_float(cells[2])
    if equity is None or orders is None:
        return None
    return {
        "date": cells[0],
        "equity": equity,
        "orders": orders,
        "risk_allowed": cells[3].lower() == "true",
        "daily_report": cells[4],
    }


def _as_float(value: str) -> float | None:
    try:
        return float(value)
    except ValueError:
        return None


def _format_metric(key: str, value: float) -> str:
    if key in PERCENT_METRICS:
        return f"{value:.2%}"
    if key in {"risk_rejections", "total_orders"}:
        return f"{value:.0f}"
    if abs(value) >= 100:
        return f"{value:,.2f}"
    return f"{value:.6f}"


def _core_root() -> Path:
    return Path(os.environ.get("ELVQUANT_CORE_PATH", "../elvquant_core")).resolve()


def _inject_styles() -> None:
    st.markdown(
        """
        <style>
        .block-container {
            padding-top: 3rem;
            max-width: 1180px;
        }
        h1, h2, h3, p, label, button, [data-testid="stMetricLabel"] {
            letter-spacing: 0;
        }
        [data-testid="stMetric"] {
            border: 1px solid rgba(255, 255, 255, 0.10);
            border-radius: 8px;
            padding: 14px 16px;
            background: rgba(255, 255, 255, 0.035);
        }
        [data-testid="stSidebar"] [data-testid="stMarkdownContainer"] {
            line-height: 1.65;
        }
        </style>
        """,
        unsafe_allow_html=True,
    )


if __name__ == "__main__":
    main()
