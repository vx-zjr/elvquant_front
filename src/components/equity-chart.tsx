import type { StructuredReport } from "@/lib/contracts";
import { chartPolyline, equityChartPoints } from "@/lib/chart";
import type { Locale } from "@/lib/i18n";

type EquityChartProps = {
  report: StructuredReport;
  locale: Locale;
};

export function EquityChart({ report, locale }: EquityChartProps) {
  const points = equityChartPoints(report);
  if (points.length === 0) {
    return <div className="empty-chart">{locale === "zh" ? "暂无权益曲线" : "No equity curve"}</div>;
  }
  const latest = points[points.length - 1];
  const first = points[0];
  const delta = first.value === 0 ? null : latest.value / first.value - 1;
  return (
    <div className="chart-card">
      <div className="chart-header">
        <div>
          <span className="eyebrow">{locale === "zh" ? "净值轨迹" : "Equity path"}</span>
          <strong>{latest.value.toLocaleString(undefined, { maximumFractionDigits: 2 })}</strong>
        </div>
        <span className={delta === null || delta >= 0 ? "pill positive" : "pill negative"}>
          {delta === null ? "n/a" : `${(delta * 100).toFixed(2)}%`}
        </span>
      </div>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="equity-svg" role="img">
        <defs>
          <linearGradient id="equity-fill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="rgba(85, 194, 162, 0.35)" />
            <stop offset="100%" stopColor="rgba(85, 194, 162, 0.02)" />
          </linearGradient>
        </defs>
        <polyline points={`0,100 ${chartPolyline(points)} 100,100`} className="equity-area" />
        <polyline points={chartPolyline(points)} className="equity-line" />
      </svg>
      <div className="chart-axis">
        <span>{first.label}</span>
        <span>{latest.label}</span>
      </div>
    </div>
  );
}
