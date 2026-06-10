import { dictionaries, type Locale } from "@/lib/i18n";

type MetricGridProps = {
  metrics: Record<string, number>;
  compact?: boolean;
  locale?: Locale;
};

const METRIC_LABELS = {
  zh: {
    net_value: "净值",
    total_return: "总收益",
    max_drawdown: "最大回撤",
    turnover: "换手率",
    total_cost: "总成本",
    cost_to_return: "成本/收益",
    risk_rejections: "风控拒绝",
  },
  en: {
    net_value: "Net Value",
    total_return: "Total Return",
    max_drawdown: "Max Drawdown",
    turnover: "Turnover",
    total_cost: "Total Cost",
    cost_to_return: "Cost / Return",
    risk_rejections: "Risk Rejections",
  },
} as const;

export function MetricGrid({ metrics, compact = false, locale = "zh" }: MetricGridProps) {
  const entries = Object.entries(metrics).slice(0, compact ? 3 : 12);
  if (entries.length === 0) return <span className="muted">{dictionaries[locale].noMetrics}</span>;
  return (
    <div className={compact ? "" : "grid metrics"}>
      {entries.map(([key, value]) => (
        <div className={compact ? "" : "metric"} key={key}>
          <div className="muted">{metricLabel(key, locale)}</div>
          <strong>{formatMetric(key, value)}</strong>
        </div>
      ))}
    </div>
  );
}

export function metricLabel(key: string, locale: Locale): string {
  const labels: Record<string, string> = METRIC_LABELS[locale];
  return labels[key] ?? key.replaceAll("_", " ");
}

export function formatMetric(key: string, value: number): string {
  if (key.endsWith("_return") || key.endsWith("_drawdown") || key === "turnover") {
    return `${(value * 100).toFixed(2)}%`;
  }
  if (key.endsWith("_count") || key === "risk_rejections") {
    return value.toFixed(0);
  }
  return Math.abs(value) >= 100
    ? value.toLocaleString(undefined, { maximumFractionDigits: 2 })
    : value.toFixed(6);
}
