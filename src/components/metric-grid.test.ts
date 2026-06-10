import { describe, expect, it } from "vitest";
import { formatMetric } from "./metric-grid";

describe("formatMetric", () => {
  it("formats returns as percentages", () => {
    expect(formatMetric("total_return", 0.1234)).toBe("12.34%");
  });

  it("formats counts as integers", () => {
    expect(formatMetric("risk_rejections", 2.2)).toBe("2");
  });
});
