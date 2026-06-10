import { describe, expect, it } from "vitest";
import { chartPolyline, equityChartPoints } from "./chart";
import type { StructuredReport } from "./contracts";

const report = {
  run_id: "run-1",
  workflow: "synthetic_demo",
  status: "completed",
  metadata: {},
  config_summary: {},
  metrics: {},
  equity_curve: [
    { as_of: "2026-01-01T00:00:00+00:00", cash: 100, positions: {}, equity: 100, cumulative_cost: 0 },
    { as_of: "2026-01-02T00:00:00+00:00", cash: 100, positions: {}, equity: 120, cumulative_cost: 0 },
  ],
  final_positions: {},
  artifacts: [],
  warnings: [],
} satisfies StructuredReport;

describe("chart helpers", () => {
  it("maps equity values into svg coordinates", () => {
    expect(equityChartPoints(report)).toEqual([
      { x: 0, y: 100, label: "2026-01-01", value: 100 },
      { x: 100, y: 0, label: "2026-01-02", value: 120 },
    ]);
  });

  it("creates a polyline string", () => {
    expect(chartPolyline(equityChartPoints(report))).toBe("0.00,100.00 100.00,0.00");
  });
});
