import type { StructuredReport } from "@/lib/contracts";

export type ChartPoint = {
  x: number;
  y: number;
  label: string;
  value: number;
};

export function equityChartPoints(report: StructuredReport): ChartPoint[] {
  const values = report.equity_curve.map((point) => point.equity);
  if (values.length === 0) return [];
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const denominator = Math.max(values.length - 1, 1);
  return report.equity_curve.map((point, index) => ({
    x: (index / denominator) * 100,
    y: 100 - ((point.equity - min) / span) * 100,
    label: point.as_of.slice(0, 10),
    value: point.equity,
  }));
}

export function chartPolyline(points: ChartPoint[]): string {
  return points.map((point) => `${point.x.toFixed(2)},${point.y.toFixed(2)}`).join(" ");
}
