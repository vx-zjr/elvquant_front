import { Activity, Gauge, RadioTower, ShieldCheck } from "lucide-react";
import { workflowMix } from "@/lib/analytics";
import type { RunSummary, Workflow } from "@/lib/contracts";
import { dictionaries, type Locale } from "@/lib/i18n";

type SystemTelemetryProps = {
  workflows: Workflow[];
  runs: RunSummary[];
  locale: Locale;
};

export function SystemTelemetry({ workflows, runs, locale }: SystemTelemetryProps) {
  const dictionary = dictionaries[locale];
  const mix = workflowMix(workflows, runs);
  const latest = runs[0];
  const latestReturn = latest?.metrics.total_return;
  const drawdown = latest?.metrics.max_drawdown;
  const items = [
    {
      icon: RadioTower,
      label: dictionary.apiBoundary,
      value: "ONLINE",
      tone: "healthy",
    },
    {
      icon: Activity,
      label: dictionary.workflowMix,
      value: `${mix.local}/${mix.data}`,
      tone: "neutral",
    },
    {
      icon: Gauge,
      label: dictionary.latestReturn,
      value: latestReturn === undefined ? "--" : `${(latestReturn * 100).toFixed(2)}%`,
      tone: latestReturn === undefined || latestReturn >= 0 ? "healthy" : "danger",
    },
    {
      icon: ShieldCheck,
      label: dictionary.drawdownGuard,
      value: drawdown === undefined ? "--" : `${(drawdown * 100).toFixed(2)}%`,
      tone: drawdown !== undefined && drawdown < -0.1 ? "warning" : "healthy",
    },
  ];

  return (
    <section className="telemetry-strip" aria-label={dictionary.systemTelemetry}>
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <div className={`telemetry-card ${item.tone}`} key={item.label}>
            <div className="telemetry-icon"><Icon size={18} /></div>
            <div>
              <span>{item.label}</span>
              <strong>{item.value}</strong>
            </div>
            <i aria-hidden="true" />
          </div>
        );
      })}
    </section>
  );
}
