from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def test_repository_uses_durable_project_memory() -> None:
    agents = (ROOT / "AGENTS.md").read_text(encoding="utf-8")
    memory = (ROOT / "docs/PROJECT_MEMORY.md").read_text(encoding="utf-8")
    log = (ROOT / "docs/ITERATION_LOG.md").read_text(encoding="utf-8")

    assert "Read `docs/PROJECT_MEMORY.md`" in agents
    assert "durable working memory" in memory
    assert "thin-client boundary" in agents
    assert "React + TypeScript" in memory
    assert "FastAPI" in memory
    assert "2026-06-11 - React Institutional Dashboard Rebuild" in log


def test_active_superpowers_plan_is_checked_listed_and_actionable() -> None:
    plan_path = ROOT / "docs/superpowers/plans/2026-06-11-react-institutional-dashboard.md"
    plan = plan_path.read_text(encoding="utf-8")

    assert "REQUIRED SUB-SKILL" in plan
    assert "Task 1: Durable Documentation Contract" in plan
    assert "Task 5: Documentation, CI, and Handoff" in plan
    assert "python -m pytest" in plan
    assert "npm run build" in plan
    assert "proxy `http://localhost:7890`" in plan

