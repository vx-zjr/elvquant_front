import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { EquityChart } from "@/components/equity-chart";
import type { StructuredReport } from "@/lib/contracts";

describe("EquityChart", () => {
  it("does not render NaN when first equity is zero", () => {
    const report: StructuredReport = {
      run_id: "zero-start",
      workflow: "synthetic_demo",
      status: "completed",
      metadata: {},
      config_summary: {},
      metrics: {},
      final_positions: {},
      artifacts: [],
      warnings: [],
      equity_curve: [
        { as_of: "2026-01-01", cash: 0, positions: {}, equity: 0, cumulative_cost: 0 },
        { as_of: "2026-01-02", cash: 0, positions: {}, equity: 10, cumulative_cost: 0 },
      ],
    };

    const { container } = render(<EquityChart report={report} locale="en" />);

    expect(container.textContent).not.toContain("NaN");
    expect(screen.getByText("n/a")).toBeTruthy();
  });
});
