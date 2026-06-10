"use client";

import { useMemo, useState } from "react";
import { allocationSegments, drawdownSeries, timelineBars } from "@/lib/analytics";
import type { StructuredReport } from "@/lib/contracts";
import { dictionaries, type Locale } from "@/lib/i18n";

type QuantVisualsProps = {
  report: StructuredReport;
  locale: Locale;
};

export function QuantVisuals({ report, locale }: QuantVisualsProps) {
  const dictionary = dictionaries[locale];
  const [mode, setMode] = useState<"drawdown" | "allocation" | "cash">("drawdown");
  const drawdowns = useMemo(() => drawdownSeries(report), [report]);
  const allocations = useMemo(() => allocationSegments(report), [report]);
  const timeline = useMemo(() => timelineBars(report), [report]);
  return (
    <section className="panel quant-visual-panel">
      <div className="section-heading horizontal">
        <div>
          <span className="eyebrow">{dictionary.dynamicVisuals}</span>
          <h2>{dictionary.quantLens}</h2>
        </div>
        <div className="segmented-control">
          <button className={mode === "drawdown" ? "active" : ""} onClick={() => setMode("drawdown")} type="button">{dictionary.drawdown}</button>
          <button className={mode === "allocation" ? "active" : ""} onClick={() => setMode("allocation")} type="button">{dictionary.allocation}</button>
          <button className={mode === "cash" ? "active" : ""} onClick={() => setMode("cash")} type="button">{dictionary.cashCost}</button>
        </div>
      </div>
      {mode === "drawdown" ? <DrawdownBars points={drawdowns} /> : null}
      {mode === "allocation" ? <AllocationMap segments={allocations} /> : null}
      {mode === "cash" ? <CashCostTimeline bars={timeline} /> : null}
    </section>
  );
}

function DrawdownBars({ points }: { points: ReturnType<typeof drawdownSeries> }) {
  const min = Math.min(0, ...points.map((point) => point.value));
  return (
    <div className="drawdown-bars">
      {points.map((point) => {
        const height = min === 0 ? 2 : Math.max(2, Math.abs(point.value / min) * 100);
        return <span key={point.label} style={{ height: `${height}%` }} title={`${point.label}: ${(point.value * 100).toFixed(2)}%`} />;
      })}
    </div>
  );
}

function AllocationMap({ segments }: { segments: ReturnType<typeof allocationSegments> }) {
  if (segments.length === 0) return <div className="empty-state">No allocation</div>;
  return (
    <div className="allocation-map">
      {segments.map((segment) => (
        <div className="allocation-row" key={segment.asset}>
          <span>{segment.asset}</span>
          <div><i style={{ width: `${segment.share * 100}%` }} /></div>
          <strong>{(segment.share * 100).toFixed(1)}%</strong>
        </div>
      ))}
    </div>
  );
}

function CashCostTimeline({ bars }: { bars: ReturnType<typeof timelineBars> }) {
  const max = Math.max(1, ...bars.flatMap((bar) => [Math.abs(bar.cash), Math.abs(bar.cost), Math.abs(bar.equity)]));
  return (
    <div className="cash-cost-timeline">
      {bars.map((bar) => (
        <div className="timeline-column" key={bar.label} title={`${bar.label} cash ${bar.cash.toFixed(2)} cost ${bar.cost.toFixed(2)}`}>
          <span className="equity" style={{ height: `${Math.max(4, Math.abs(bar.equity / max) * 100)}%` }} />
          <span className="cash" style={{ height: `${Math.max(4, Math.abs(bar.cash / max) * 100)}%` }} />
          <span className="cost" style={{ height: `${Math.max(3, Math.abs(bar.cost / max) * 100)}%` }} />
        </div>
      ))}
    </div>
  );
}
