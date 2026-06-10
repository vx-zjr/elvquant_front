import { describe, expect, it } from "vitest";
import {
  allocationSegments,
  drawdownSeries,
  runHealth,
  timelineBars,
  workflowMix,
} from "./analytics";
import type { RunSummary, StructuredReport, Workflow } from "./contracts";

const report = {
  run_id: "run-1",
  workflow: "synthetic_demo",
  status: "completed",
  metadata: {},
  config_summary: {},
  metrics: { max_drawdown: -0.25, risk_rejections: 1 },
  equity_curve: [
    { as_of: "2026-01-01", cash: 100, positions: {}, equity: 100, cumulative_cost: 0 },
    { as_of: "2026-01-02", cash: 20, positions: { AAA: 2, BBB: 1 }, equity: 120, cumulative_cost: 1 },
    { as_of: "2026-01-03", cash: 30, positions: { AAA: 1 }, equity: 90, cumulative_cost: 2 },
  ],
  final_positions: { AAA: 3, BBB: 1 },
  artifacts: [],
  warnings: ["review required"],
} satisfies StructuredReport;

describe("analytics helpers", () => {
  it("computes drawdown from equity peaks", () => {
    expect(drawdownSeries(report)).toEqual([
      { label: "2026-01-01", value: 0 },
      { label: "2026-01-02", value: 0 },
      { label: "2026-01-03", value: -0.25 },
    ]);
  });

  it("normalizes final allocation segments", () => {
    expect(allocationSegments(report)).toEqual([
      { asset: "AAA", quantity: 3, share: 0.75 },
      { asset: "BBB", quantity: 1, share: 0.25 },
    ]);
  });

  it("maps cash and cost timeline bars", () => {
    expect(timelineBars(report)).toEqual([
      { label: "2026-01-01", cash: 100, cost: 0, equity: 100 },
      { label: "2026-01-02", cash: 20, cost: 1, equity: 120 },
      { label: "2026-01-03", cash: 30, cost: 2, equity: 90 },
    ]);
  });

  it("summarizes run health from status, warnings, and risk rejections", () => {
    expect(runHealth(report)).toEqual({ level: "warning", score: 58, signals: 3 });
  });

  it("summarizes workflow mix for dashboard telemetry", () => {
    const workflows: Workflow[] = [
      { id: "synthetic_demo", label: "Synthetic", description: "", requiresData: false },
      { id: "stooq_research", label: "Stooq", description: "", requiresData: true },
    ];
    const runs: RunSummary[] = [
      { runId: "a", workflow: "synthetic_demo", status: "completed", metrics: {} },
      { runId: "b", workflow: "readiness_report", status: "blocked", metrics: {} },
    ];

    expect(workflowMix(workflows, runs)).toEqual({ local: 1, data: 1, completed: 1, blocked: 1 });
  });
});
