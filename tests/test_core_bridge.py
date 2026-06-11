from __future__ import annotations

from pathlib import Path


def test_report_parser_extracts_metrics_fields_and_daily_rows() -> None:
    from elvquant_front.core_bridge import parse_report_text

    parsed = parse_report_text(
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


def test_metric_formatting_matches_quant_dashboard_expectations() -> None:
    from elvquant_front.core_bridge import format_metric

    assert format_metric("total_return", 0.046212) == "4.62%"
    assert format_metric("test_momentum_max_drawdown", -0.1234) == "-12.34%"
    assert format_metric("risk_rejections", 2) == "2"
    assert format_metric("ending_equity", 10462.115657) == "10,462.12"
    assert format_metric("sharpe", 1.234567) == "1.234567"


def test_stooq_raw_file_names_match_core_cache_convention() -> None:
    from elvquant_front.core_bridge import stooq_raw_file_names

    assert stooq_raw_file_names(
        ("SPY.US", "QQQ.US", "IWM.US", "TLT.US", "GLD.US"),
        "2015-01-01",
        "2025-12-31",
    ) == [
        "spy_us_2015-01-01_2025-12-31.csv",
        "qqq_us_2015-01-01_2025-12-31.csv",
        "iwm_us_2015-01-01_2025-12-31.csv",
        "tlt_us_2015-01-01_2025-12-31.csv",
        "gld_us_2015-01-01_2025-12-31.csv",
    ]


def test_missing_stooq_data_report_is_user_friendly(tmp_path: Path) -> None:
    from elvquant_front.core_bridge import stooq_missing_data_report

    report = stooq_missing_data_report(
        core_root=tmp_path,
        config_path=tmp_path / "configs/stooq_etf_momentum.example.toml",
        data_path=tmp_path / "data/processed/stooq_etf_eod.csv",
        raw_file_names=["spy_us_2015-01-01_2025-12-31.csv"],
    )

    assert "真实数据文件未就绪" in report
    assert "data/processed/stooq_etf_eod.csv" in report
    assert "spy_us_2015-01-01_2025-12-31.csv" in report
    assert "STOOQ_API_KEY" in report
    assert "业务逻辑仍在 elvquant_core" in report


def test_artifact_candidates_are_recent_markdown_files(tmp_path: Path) -> None:
    from elvquant_front.core_bridge import artifact_candidates

    old_report = tmp_path / "reports" / "old.md"
    new_report = tmp_path / "paper_runs" / "run" / "new.md"
    ignored = tmp_path / "reports" / "raw.txt"
    old_report.parent.mkdir(parents=True)
    new_report.parent.mkdir(parents=True)
    ignored.write_text("ignore", encoding="utf-8")
    old_report.write_text("old", encoding="utf-8")
    new_report.write_text("new", encoding="utf-8")

    candidates = artifact_candidates(tmp_path)

    assert candidates[0].name == "new.md"
    assert {path.name for path in candidates} == {"new.md", "old.md"}

