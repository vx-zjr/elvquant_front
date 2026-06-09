from __future__ import annotations

import ast
from pathlib import Path

APP = Path("app.py")

ALLOWED_QTS_IMPORTS = {
    ("qts.historical", "run_historical_smoke"),
    ("qts.ml", "compare_ml_to_momentum"),
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
