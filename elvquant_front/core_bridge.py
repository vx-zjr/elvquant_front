"""Thin bridge between the React cockpit and public elvquant_core runners."""

from __future__ import annotations

import os
from collections.abc import Callable, Sequence
from dataclasses import dataclass, replace
from pathlib import Path
from typing import Any

ReportRunner = Callable[[], str]

STOOQ_WORKFLOW_ID = "stooq-research"
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


@dataclass(frozen=True)
class Workflow:
    id: str
    name: str
    description: str
    category: str
    runner: ReportRunner

    def public_dict(self) -> dict[str, str]:
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "category": self.category,
        }


@dataclass(frozen=True)
class CoreState:
    available: bool
    core_root: Path
    workflows: tuple[Workflow, ...]
    message: str


def core_root() -> Path:
    return Path(os.environ.get("ELVQUANT_CORE_PATH", "../elvquant_core")).resolve()


def load_core_state(root: Path | None = None) -> CoreState:
    root = root or core_root()
    try:
        from qts.historical import run_historical_smoke
        from qts.ml import compare_ml_to_momentum
        from qts.paper import run_synthetic_paper_demo
        from qts.simple import run_synthetic_demo
        from qts.stooq import load_stooq_research_config, run_stooq_etf_momentum_research
        from qts.strategies import compare_momentum_to_equal_weight
    except ImportError as exc:
        return CoreState(
            available=False,
            core_root=root,
            workflows=(),
            message=f"当前 Python 环境无法导入 elvquant_core：{exc}",
        )

    fred_sample = root / "data/historical/fred_index_sample.csv"
    readiness_report = root / "reports/readiness/live_readiness.md"
    paper_output = root / "paper_runs/streamlit-synthetic-paper-demo"

    workflows = (
        Workflow(
            id="synthetic-backtest",
            name="合成数据回测",
            description="运行 core 暴露的合成数据研究流程，快速检查指标解析和报告渲染。",
            category="Research",
            runner=lambda: run_synthetic_demo().text,
        ),
        Workflow(
            id="historical-smoke",
            name="历史数据烟雾测试",
            description="读取 FRED 样本数据并生成历史研究冒烟报告。",
            category="Data QA",
            runner=lambda: run_historical_smoke(fred_sample).text,
        ),
        Workflow(
            id="momentum-vs-equal-weight",
            name="动量 vs 等权",
            description="比较公开 core 策略研究入口输出的动量与等权结果。",
            category="Strategy Research",
            runner=lambda: compare_momentum_to_equal_weight(fred_sample).text,
        ),
        Workflow(
            id="ml-vs-momentum",
            name="ML 研究 vs 动量",
            description="调用 core 的 ML 对比研究入口，不在前端实现任何模型逻辑。",
            category="Strategy Research",
            runner=lambda: compare_ml_to_momentum(fred_sample).text,
        ),
        Workflow(
            id="synthetic-paper",
            name="本地模拟盘",
            description="运行本地合成模拟盘公开入口，检查订单摘要、风控状态和日度报告链接。",
            category="Paper Ops",
            runner=lambda: run_synthetic_paper_demo(output_dir=paper_output).text,
        ),
        Workflow(
            id=STOOQ_WORKFLOW_ID,
            name=STOOQ_WORKFLOW_NAME,
            description="读取 Stooq 配置和标准化数据，运行 ETF 动量真实数据研究。",
            category="Data Research",
            runner=lambda: run_stooq_research_report(
                core_root=root,
                load_config=load_stooq_research_config,
                run_research=run_stooq_etf_momentum_research,
            ),
        ),
        Workflow(
            id="live-readiness",
            name="上线准备报告",
            description="展示 core 生成的 live readiness markdown 报告。",
            category="Readiness",
            runner=lambda: readiness_report.read_text(encoding="utf-8"),
        ),
    )
    return CoreState(available=True, core_root=root, workflows=workflows, message="core ready")


def workflow_summaries(root: Path | None = None) -> dict[str, Any]:
    state = load_core_state(root)
    return {
        "core_available": state.available,
        "core_root": str(state.core_root),
        "message": state.message,
        "workflows": [workflow.public_dict() for workflow in state.workflows],
    }


def run_workflow(workflow_id: str, root: Path | None = None) -> dict[str, Any]:
    state = load_core_state(root)
    if not state.available:
        return {
            "ok": False,
            "workflow_id": workflow_id,
            "title": "core 不可用",
            "text": state.message,
            "parsed": parse_report_text(state.message),
        }

    workflows = {workflow.id: workflow for workflow in state.workflows}
    workflow = workflows.get(workflow_id)
    if workflow is None:
        return {
            "ok": False,
            "workflow_id": workflow_id,
            "title": "未知流程",
            "text": f"没有找到流程：{workflow_id}",
            "parsed": parse_report_text(""),
        }

    try:
        text = workflow.runner()
    except FileNotFoundError as exc:
        text = exception_report("core 所需文件不存在", exc)
        return _workflow_result(False, workflow, text)
    except Exception as exc:  # noqa: BLE001 - local UI must stay usable when core rejects input.
        text = exception_report(f"{workflow.name} 运行失败", exc)
        return _workflow_result(False, workflow, text)

    return _workflow_result(True, workflow, text)


def _workflow_result(ok: bool, workflow: Workflow, text: str) -> dict[str, Any]:
    parsed = parse_report_text(text)
    return {
        "ok": ok,
        "workflow_id": workflow.id,
        "title": workflow.name,
        "text": text,
        "parsed": parsed,
        "metric_cards": metric_cards(parsed["metrics"]),
    }


def run_stooq_research_report(
    core_root: Path,
    load_config: Callable[[Path], Any],
    run_research: Callable[[Any], Any],
) -> str:
    config_path = core_root / STOOQ_CONFIG_RELATIVE_PATH
    if not config_path.exists():
        return (
            "# Stooq 真实数据研究\n\n"
            "配置文件未找到。\n\n"
            f"- 需要的配置文件：{display_path(config_path, core_root)}\n"
            "- 这份配置应该提交在 elvquant_core 中，密钥仍然不进入仓库。\n"
        )

    try:
        config = resolve_stooq_config_paths(load_config(config_path), core_root)
    except Exception as exc:  # noqa: BLE001 - display-only boundary for local debugging.
        return exception_report("Stooq 配置读取失败", exc)

    raw_file_names = stooq_raw_file_names(config.asset_ids, config.start, config.end)
    if not config.data_path.exists():
        return stooq_missing_data_report(
            core_root=core_root,
            config_path=config_path,
            data_path=config.data_path,
            raw_file_names=raw_file_names,
        )

    try:
        return run_research(config).text
    except FileNotFoundError:
        return stooq_missing_data_report(
            core_root=core_root,
            config_path=config_path,
            data_path=config.data_path,
            raw_file_names=raw_file_names,
        )
    except Exception as exc:  # noqa: BLE001 - keep API usable when core rejects data.
        return exception_report("Stooq 真实数据研究运行失败", exc)


def stooq_status(root: Path | None = None) -> dict[str, Any]:
    root = root or core_root()
    state = load_core_state(root)
    if not state.available:
        return {
            "available": False,
            "message": state.message,
            "core_root": str(root),
            "config_path": str(root / STOOQ_CONFIG_RELATIVE_PATH),
            "data_path": "",
            "raw_files": [],
        }

    try:
        from qts.stooq import load_stooq_research_config
    except ImportError as exc:
        return {
            "available": False,
            "message": f"当前环境无法导入 Stooq core 入口：{exc}",
            "core_root": str(root),
            "config_path": str(root / STOOQ_CONFIG_RELATIVE_PATH),
            "data_path": "",
            "raw_files": [],
        }

    config_path = root / STOOQ_CONFIG_RELATIVE_PATH
    if not config_path.exists():
        return {
            "available": False,
            "message": "没有找到 Stooq 配置文件。",
            "core_root": str(root),
            "config_path": display_path(config_path, root),
            "data_path": "",
            "raw_files": [],
        }

    try:
        config = resolve_stooq_config_paths(load_stooq_research_config(config_path), root)
    except Exception as exc:  # noqa: BLE001 - status endpoint should not expose traceback.
        return {
            "available": False,
            "message": f"Stooq 配置读取失败：{exc}",
            "core_root": str(root),
            "config_path": display_path(config_path, root),
            "data_path": "",
            "raw_files": [],
        }

    raw_file_names = stooq_raw_file_names(config.asset_ids, config.start, config.end)
    raw_dir = root / STOOQ_RAW_CACHE_RELATIVE_PATH
    data_ready = config.data_path.exists()
    return {
        "available": data_ready,
        "message": "标准化数据已就绪。" if data_ready else "真实数据文件未就绪。",
        "core_root": str(root),
        "config_path": display_path(config_path, root),
        "data_path": display_path(config.data_path, root),
        "raw_files": [display_path(raw_dir / file_name, root) for file_name in raw_file_names],
        "asset_count": len(config.asset_ids),
        "start": str(config.start),
        "end": str(config.end),
    }


def resolve_stooq_config_paths(config: Any, root: Path) -> Any:
    data_path = Path(config.data_path)
    reports_dir = Path(config.reports_dir)
    return replace(
        config,
        data_path=data_path if data_path.is_absolute() else root / data_path,
        reports_dir=reports_dir if reports_dir.is_absolute() else root / reports_dir,
    )


def stooq_raw_file_names(asset_ids: Sequence[str], start: str, end: str) -> list[str]:
    return [f"{asset_id.lower().replace('.', '_')}_{start}_{end}.csv" for asset_id in asset_ids]


def stooq_missing_data_report(
    core_root: Path,
    config_path: Path,
    data_path: Path,
    raw_file_names: Sequence[str],
) -> str:
    raw_dir = core_root / STOOQ_RAW_CACHE_RELATIVE_PATH
    raw_files = "\n".join(
        f"- {display_path(raw_dir / file_name, core_root)}" for file_name in raw_file_names
    )
    return (
        "# Stooq 真实数据研究\n\n"
        "真实数据文件未就绪。\n\n"
        f"- 配置文件：{display_path(config_path, core_root)}\n"
        f"- 需要的标准化数据：{display_path(data_path, core_root)}\n"
        "- 预计原始 CSV 缓存：\n"
        f"{raw_files}\n\n"
        "请先在 elvquant_core 中准备原始 Stooq CSV，并调用 core 的标准化函数生成 "
        "`data/processed/stooq_etf_eod.csv`。如果 Stooq 要求 apikey，请只在 core "
        "运行环境设置 `STOOQ_API_KEY` 或使用 gitignored `.env`，不要写入前端或提交配置。"
        "业务逻辑仍在 elvquant_core，前端只负责显示状态、触发公开入口和渲染报告。"
    )


def exception_report(title: str, exc: Exception) -> str:
    return (
        f"# {title}\n\n"
        "core 拒绝了这次运行，前端没有吞掉错误。请优先检查配置、数据文件和 "
        "DATA_POLICY 约束。\n\n"
        "```text\n"
        f"{type(exc).__name__}: {exc}\n"
        "```"
    )


def parse_report_text(text: str) -> dict[str, Any]:
    fields: dict[str, str] = {}
    metrics: dict[str, float] = {}
    daily_rows: list[dict[str, Any]] = []

    for line in text.splitlines():
        clean = line.strip()
        if not clean:
            continue
        if clean.startswith("|"):
            row = parse_daily_row(clean)
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
        numeric_value = as_float(value)
        if numeric_value is not None:
            metrics[key] = numeric_value

    return {"fields": fields, "metrics": metrics, "daily_rows": daily_rows}


def parse_daily_row(line: str) -> dict[str, Any] | None:
    cells = [cell.strip() for cell in line.strip("|").split("|")]
    if len(cells) < 5 or cells[0] == "date" or cells[0].startswith("---"):
        return None
    equity = as_float(cells[1])
    orders = as_float(cells[2])
    if equity is None or orders is None:
        return None
    return {
        "date": cells[0],
        "equity": equity,
        "orders": orders,
        "risk_allowed": cells[3].lower() == "true",
        "daily_report": cells[4],
    }


def as_float(value: str) -> float | None:
    try:
        return float(value)
    except ValueError:
        return None


def metric_cards(metrics: dict[str, float]) -> list[dict[str, Any]]:
    ordered_keys = [key for key in METRIC_LABELS if key in metrics]
    if not ordered_keys:
        ordered_keys = list(metrics)[:8]
    return [
        {
            "key": key,
            "label": METRIC_LABELS.get(key, key),
            "value": metrics[key],
            "formatted": format_metric(key, metrics[key]),
        }
        for key in ordered_keys[:8]
    ]


def format_metric(key: str, value: float) -> str:
    if is_percent_metric(key):
        return f"{value:.2%}"
    if key.endswith("_decision_count") or key in {"risk_rejections", "total_orders"}:
        return f"{value:.0f}"
    if abs(value) >= 100:
        return f"{value:,.2f}"
    return f"{value:.6f}"


def is_percent_metric(key: str) -> bool:
    return key in PERCENT_METRICS or key.endswith(PERCENT_METRIC_SUFFIXES)


def artifact_candidates(root: Path | None = None) -> list[Path]:
    root = root or core_root()
    roots = [root / "paper_runs", root / "reports"]
    files: list[Path] = []
    for candidate_root in roots:
        if candidate_root.exists():
            files.extend(path for path in candidate_root.rglob("*.md") if path.is_file())
    return sorted(files, key=lambda path: path.stat().st_mtime, reverse=True)[:30]


def artifact_payload(root: Path | None = None) -> list[dict[str, Any]]:
    root = root or core_root()
    payload = []
    for path in artifact_candidates(root):
        stat = path.stat()
        payload.append(
            {
                "path": str(path),
                "display_path": display_path(path, root),
                "name": path.name,
                "modified_at": stat.st_mtime,
                "size": stat.st_size,
            }
        )
    return payload


def read_artifact(path: str, root: Path | None = None) -> dict[str, Any]:
    root = root or core_root()
    artifact_path = Path(path)
    if not artifact_path.is_absolute():
        artifact_path = root / artifact_path
    if not artifact_path.exists() or not artifact_path.is_file():
        return {"ok": False, "text": "没有找到报告文件。", "parsed": parse_report_text("")}
    if artifact_path.suffix.lower() != ".md":
        return {
            "ok": False,
            "text": "只能读取 markdown 报告文件。",
            "parsed": parse_report_text(""),
        }
    text = artifact_path.read_text(encoding="utf-8")
    return {"ok": True, "text": text, "parsed": parse_report_text(text)}


def display_path(path: Path, base: Path) -> str:
    try:
        return path.resolve().relative_to(base.resolve()).as_posix()
    except ValueError:
        return str(path)

