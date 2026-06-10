import type { RunSummary, StructuredReport, Workflow } from "@/lib/contracts";

export type DrawdownPoint = {
  label: string;
  value: number;
};

export type AllocationSegment = {
  asset: string;
  quantity: number;
  share: number;
};

export type TimelineBar = {
  label: string;
  cash: number;
  cost: number;
  equity: number;
};

export type RunHealth = {
  level: "healthy" | "warning" | "blocked";
  score: number;
  signals: number;
};

export function drawdownSeries(report: StructuredReport): DrawdownPoint[] {
  let peak = Number.NEGATIVE_INFINITY;
  return report.equity_curve.map((point) => {
    peak = Math.max(peak, point.equity);
    const value = peak > 0 ? point.equity / peak - 1 : 0;
    return { label: point.as_of.slice(0, 10), value };
  });
}

export function allocationSegments(report: StructuredReport): AllocationSegment[] {
  const entries = Object.entries(report.final_positions)
    .filter(([, quantity]) => Math.abs(quantity) > 0)
    .sort(([left], [right]) => left.localeCompare(right));
  const total = entries.reduce((sum, [, quantity]) => sum + Math.abs(quantity), 0);
  if (total === 0) return [];
  return entries.map(([asset, quantity]) => ({
    asset,
    quantity,
    share: Math.abs(quantity) / total,
  }));
}

export function timelineBars(report: StructuredReport): TimelineBar[] {
  return report.equity_curve.map((point) => ({
    label: point.as_of.slice(0, 10),
    cash: point.cash,
    cost: point.cumulative_cost,
    equity: point.equity,
  }));
}

export function runHealth(report: StructuredReport): RunHealth {
  const riskRejections = report.metrics.risk_rejections ?? 0;
  const drawdownSignal = (report.metrics.max_drawdown ?? 0) <= -0.2 ? 1 : 0;
  const warningSignals = report.warnings.length + riskRejections + drawdownSignal;
  if (report.status === "blocked" || report.status === "failed") {
    return { level: "blocked", score: 24, signals: Math.max(1, warningSignals) };
  }
  if (warningSignals > 0) {
    return { level: "warning", score: Math.max(35, 70 - warningSignals * 4), signals: warningSignals };
  }
  return { level: "healthy", score: 92, signals: 0 };
}

export function workflowMix(workflows: Workflow[], runs: RunSummary[]) {
  return {
    local: workflows.filter((workflow) => !workflow.requiresData).length,
    data: workflows.filter((workflow) => workflow.requiresData).length,
    completed: runs.filter((run) => run.status === "completed").length,
    blocked: runs.filter((run) => run.status === "blocked").length,
  };
}

export function latestEquityDelta(report: StructuredReport): number | null {
  const first = report.equity_curve[0]?.equity;
  const latest = report.equity_curve.at(-1)?.equity;
  if (first === undefined || latest === undefined || first === 0) return null;
  return latest / first - 1;
}
