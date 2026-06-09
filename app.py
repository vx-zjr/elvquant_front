"""Chinese Streamlit thin client for elvquant_core local debugging."""

from __future__ import annotations

import os
from collections.abc import Callable, Sequence
from dataclasses import replace
from pathlib import Path
from typing import Any

import pandas as pd
import streamlit as st

ReportRunner = Callable[[], str]

STOOQ_WORKFLOW_NAME = "Stooq 真实数据研究"
STOOQ_CONFIG_RELATIVE_PATH = Path("configs/stooq_etf_momentum.example.toml")
STOOQ_RAW_CACHE_RELATIVE_PATH = Path("data/raw/stooq")

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
    "train_decision_count": "训练期决策次数",
    "train_equal_weight_total_return": "训练期等权收益",
    "train_momentum_total_return": "训练期动量收益",
    "train_momentum_minus_equal_weight_return": "训练期超额收益",
    "train_momentum_max_drawdown": "训练期动量最大回撤",
    "validation_decision_count": "验证期决策次数",
    "validation_equal_weight_total_return": "验证期等权收益",
    "validation_momentum_total_return": "验证期动量收益",
    "validation_momentum_minus_equal_weight_return": "验证期超额收益",
    "validation_momentum_max_drawdown": "验证期动量最大回撤",
    "test_decision_count": "样本外决策次数",
    "test_equal_weight_total_return": "样本外等权收益",
    "test_momentum_total_return": "样本外动量收益",
    "test_momentum_minus_equal_weight_return": "样本外超额收益",
    "test_momentum_max_drawdown": "样本外动量最大回撤",
    "test_momentum_turnover": "样本外动量换手",
    "test_momentum_total_cost": "样本外动量成本",
}

PERCENT_METRIC_SUFFIXES = (
    "_total_return",
    "_max_drawdown",
    "_turnover",
    "_cost_to_return",
    "_minus_equal_weight_return",
)
PERCENT_METRICS = {"total_return", "max_drawdown", "turnover", "cost_to_return"}


def main() -> None:
    st.set_page_config(page_title="elvquant 本地交易驾驶舱", layout="wide")
    _inject_styles()

    st.title("elvquant 本地交易驾驶舱")
    st.caption(
        "核心之上的中文薄客户端：选择参数、触发公开入口、渲染结果。"
        "策略、数据、风控、记账和密钥都留在 elvquant_core。"
    )

    runners = _core_runners()
    if not runners:
        st.error("当前 Python 环境没有安装 elvquant_core。")
        st.code("python -m pip install -e ../elvquant_core", language="powershell")
        return

    workflow_names = tuple(runners)
    default_workflow = (
        workflow_names.index(STOOQ_WORKFLOW_NAME)
        if STOOQ_WORKFLOW_NAME in workflow_names
        else workflow_names.index("本地模拟盘")
        if "本地模拟盘" in workflow_names
        else 0
    )
    workflow = st.sidebar.radio("工作流", workflow_names, index=default_workflow)
    show_raw = st.sidebar.checkbox("显示原始输出", value=True)
    st.sidebar.info(
        "UI 只负责选择、触发和展示。策略、风控、数据、订单、记账、密钥都留在 "
        "elvquant_core；新增能力必须先从 core 暴露公开入口。"
    )
    st.sidebar.caption(f"核心目录：{_core_root()}")

    if workflow == STOOQ_WORKFLOW_NAME:
        _render_stooq_status_panel(_core_root())

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
        from qts.stooq import load_stooq_research_config, run_stooq_etf_momentum_research
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
        STOOQ_WORKFLOW_NAME: lambda: _run_stooq_research_report(
            core_root=core_root,
            load_config=load_stooq_research_config,
            run_research=run_stooq_etf_momentum_research,
        ),
        "上线准备报告": lambda: readiness_report.read_text(encoding="utf-8"),
    }


def _run_stooq_research_report(
    core_root: Path,
    load_config: Callable[[Path], Any],
    run_research: Callable[[Any], Any],
) -> str:
    config_path = core_root / STOOQ_CONFIG_RELATIVE_PATH
    if not config_path.exists():
        return (
            "# Stooq 真实数据研究\n\n"
            "配置文件未找到。\n\n"
            f"- 需要的配置文件：{_display_path(config_path, core_root)}\n"
            "- 这份配置应该提交在 elvquant_core 中，密钥仍然不进入仓库。\n"
        )

    try:
        config = _resolve_stooq_config_paths(load_config(config_path), core_root)
    except Exception as exc:  # noqa: BLE001 - display-only boundary for local debugging.
        return _exception_report("Stooq 配置读取失败", exc)

    raw_file_names = _stooq_raw_file_names(config.asset_ids, config.start, config.end)
    if not config.data_path.exists():
        return _stooq_missing_data_report(
            core_root=core_root,
            config_path=config_path,
            data_path=config.data_path,
            raw_file_names=raw_file_names,
        )

    try:
        return run_research(config).text
    except FileNotFoundError:
        return _stooq_missing_data_report(
            core_root=core_root,
            config_path=config_path,
            data_path=config.data_path,
            raw_file_names=raw_file_names,
        )
    except Exception as exc:  # noqa: BLE001 - keep Streamlit usable when core rejects data.
        return _exception_report("Stooq 真实数据研究运行失败", exc)


def _render_stooq_status_panel(core_root: Path) -> None:
    try:
        from qts.stooq import load_stooq_research_config
    except ImportError:
        st.warning("当前环境无法导入 Stooq core 入口。")
        return

    config_path = core_root / STOOQ_CONFIG_RELATIVE_PATH
    if not config_path.exists():
        st.warning(f"没有找到 Stooq 配置文件：{_display_path(config_path, core_root)}")
        return

    try:
        config = _resolve_stooq_config_paths(load_stooq_research_config(config_path), core_root)
    except Exception as exc:  # noqa: BLE001 - status panel should not crash the dashboard.
        st.warning(f"Stooq 配置读取失败：{exc}")
        return

    data_ready = config.data_path.exists()
    raw_file_names = _stooq_raw_file_names(config.asset_ids, config.start, config.end)
    raw_dir = core_root / STOOQ_RAW_CACHE_RELATIVE_PATH

    st.subheader("Stooq 真实数据状态")
    cards = st.columns(4)
    cards[0].metric("配置", "已找到")
    cards[1].metric("标准化数据", "已就绪" if data_ready else "未就绪")
    cards[2].metric("资产数", str(len(config.asset_ids)))
    cards[3].metric("研究区间", f"{config.start} 至 {config.end}")

    with st.expander("本地文件与缓存约定", expanded=not data_ready):
        st.code(
            "\n".join(
                [
                    f"核心目录: {core_root}",
                    f"配置文件: {_display_path(config_path, core_root)}",
                    f"标准化数据: {_display_path(config.data_path, core_root)}",
                    f"原始 CSV 缓存目录: {_display_path(raw_dir, core_root)}",
                ]
            ),
            language="text",
        )
        st.dataframe(
            [{"预计原始文件": name} for name in raw_file_names],
            use_container_width=True,
            hide_index=True,
        )

    if not data_ready:
        st.info(
            "真实数据文件未就绪。请先在 elvquant_core 中准备原始 Stooq CSV，"
            "并通过 core 的标准化函数生成 data/processed/stooq_etf_eod.csv；"
            "如果 Stooq 要求 apikey，请只在 core 运行环境设置 STOOQ_API_KEY。"
            "前端不会下载、改写研究数据或读取密钥。"
        )


def _resolve_stooq_config_paths(config: Any, core_root: Path) -> Any:
    data_path = Path(config.data_path)
    reports_dir = Path(config.reports_dir)
    return replace(
        config,
        data_path=data_path if data_path.is_absolute() else core_root / data_path,
        reports_dir=reports_dir if reports_dir.is_absolute() else core_root / reports_dir,
    )


def _stooq_raw_file_names(asset_ids: Sequence[str], start: str, end: str) -> list[str]:
    return [f"{asset_id.lower().replace('.', '_')}_{start}_{end}.csv" for asset_id in asset_ids]


def _stooq_missing_data_report(
    core_root: Path,
    config_path: Path,
    data_path: Path,
    raw_file_names: Sequence[str],
) -> str:
    raw_dir = core_root / STOOQ_RAW_CACHE_RELATIVE_PATH
    raw_files = "\n".join(
        f"- {_display_path(raw_dir / file_name, core_root)}" for file_name in raw_file_names
    )
    return (
        "# Stooq 真实数据研究\n\n"
        "真实数据文件未就绪。\n\n"
        f"- 配置文件：{_display_path(config_path, core_root)}\n"
        f"- 需要的标准化数据：{_display_path(data_path, core_root)}\n"
        "- 预计原始 CSV 缓存：\n"
        f"{raw_files}\n\n"
        "请先在 elvquant_core 中准备原始 Stooq CSV，并调用 core 的标准化函数生成"
        " `data/processed/stooq_etf_eod.csv`。如果 Stooq 要求 apikey，请只在 core "
        "运行环境设置 `STOOQ_API_KEY` 或使用 gitignored `.env`，不要写入前端或提交配置。"
        "业务逻辑仍在 elvquant_core，"
        "Streamlit 前端只负责显示状态、触发公开入口和渲染报告。"
    )


def _exception_report(title: str, exc: Exception) -> str:
    return (
        f"# {title}\n\n"
        "core 拒绝了这次运行，前端没有吞掉错误。请优先检查配置、数据文件和 "
        "DATA_POLICY 约束。\n\n"
        "```text\n"
        f"{type(exc).__name__}: {exc}\n"
        "```"
    )


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

    columns = st.columns(min(4, max(1, len(ordered_keys))))
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
    if _is_percent_metric(key):
        return f"{value:.2%}"
    if key.endswith("_decision_count") or key in {"risk_rejections", "total_orders"}:
        return f"{value:.0f}"
    if abs(value) >= 100:
        return f"{value:,.2f}"
    return f"{value:.6f}"


def _is_percent_metric(key: str) -> bool:
    return key in PERCENT_METRICS or key.endswith(PERCENT_METRIC_SUFFIXES)


def _display_path(path: Path, base: Path) -> str:
    try:
        return path.resolve().relative_to(base.resolve()).as_posix()
    except ValueError:
        return str(path)


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
