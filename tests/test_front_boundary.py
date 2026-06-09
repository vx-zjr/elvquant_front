from __future__ import annotations

import ast
from pathlib import Path

APP = Path("app.py")

ALLOWED_QTS_IMPORTS = {
    ("qts.historical", "run_historical_smoke"),
    ("qts.ml", "compare_ml_to_momentum"),
    ("qts.paper", "run_synthetic_paper_demo"),
    ("qts.simple", "run_synthetic_demo"),
    ("qts.strategies", "compare_momentum_to_equal_weight"),
}

FORBIDDEN_CORE_NAMES = {
    "AccountingLedger",
    "BasicRiskManager",
    "Broker",
    "DataSnapshot",
    "ExecutionSimulator",
    "Fill",
    "ManualOrderWorkflow",
    "Order",
    "RiskDecision",
    "SignalModel",
    "TargetPortfolio",
}


def test_frontend_imports_only_public_core_runners() -> None:
    tree = ast.parse(APP.read_text(encoding="utf-8"))
    imports: set[tuple[str, str]] = set()

    for node in ast.walk(tree):
        if isinstance(node, ast.ImportFrom) and node.module and node.module.startswith("qts."):
            for alias in node.names:
                imports.add((node.module, alias.name))

    assert imports == ALLOWED_QTS_IMPORTS


def test_frontend_does_not_construct_core_business_objects() -> None:
    tree = ast.parse(APP.read_text(encoding="utf-8"))
    names = {node.id for node in ast.walk(tree) if isinstance(node, ast.Name)}

    assert names.isdisjoint(FORBIDDEN_CORE_NAMES)


def test_frontend_does_not_contain_secret_values() -> None:
    text = APP.read_text(encoding="utf-8").lower()

    assert "api_key =" not in text
    assert "secret =" not in text
    assert "password =" not in text


def test_frontend_uses_chinese_dashboard_copy() -> None:
    text = APP.read_text(encoding="utf-8")

    assert "本地交易驾驶舱" in text
    assert "运行所选流程" in text
    assert "本地模拟盘" in text
    assert "关键指标" in text


def test_report_parser_extracts_metrics_and_daily_rows() -> None:
    from app import _parse_report_text

    parsed = _parse_report_text(
        "\n".join(
            [
                "run_id: paper-synthetic-20260101-20260105",
                "broker_submission: disabled",
                "ending_equity: 10462.115657",
                "total_return: 0.046212",
                "risk_rejections: 0",
                "",
                "| date | equity | orders | risk_allowed | daily_report |",
                "| --- | ---: | ---: | --- | --- |",
                "| 2026-01-05 | 10462.115657 | 2 | true | C:/tmp/report.md |",
            ]
        )
    )

    assert parsed["metrics"]["ending_equity"] == 10462.115657
    assert parsed["metrics"]["total_return"] == 0.046212
    assert parsed["fields"]["broker_submission"] == "disabled"
    assert parsed["daily_rows"] == [
        {
            "date": "2026-01-05",
            "equity": 10462.115657,
            "orders": 2.0,
            "risk_allowed": True,
            "daily_report": "C:/tmp/report.md",
        }
    ]
