import { AlertTriangle, Shield, ShieldAlert } from "lucide-react";
import type { CSSProperties } from "react";
import { runHealth } from "@/lib/analytics";
import type { StructuredReport } from "@/lib/contracts";
import { dictionaries, type Locale } from "@/lib/i18n";

type RiskPostureProps = {
  report: StructuredReport;
  locale: Locale;
};

export function RiskPosture({ report, locale }: RiskPostureProps) {
  const dictionary = dictionaries[locale];
  const health = runHealth(report);
  const Icon = health.level === "healthy" ? Shield : health.level === "warning" ? AlertTriangle : ShieldAlert;
  return (
    <section className={`panel risk-posture ${health.level}`}>
      <div className="section-heading horizontal">
        <div>
          <span className="eyebrow">{dictionary.riskPosture}</span>
          <h2>{dictionary.systemReadiness}</h2>
        </div>
        <Icon size={24} />
      </div>
      <div className="health-ring" style={{ "--score": `${health.score}%` } as CSSProperties}>
        <strong>{health.score}</strong>
        <span>{dictionary.healthScore}</span>
      </div>
      <div className="risk-signal-row">
        <span>{dictionary.riskSignals}</span>
        <strong>{health.signals}</strong>
      </div>
    </section>
  );
}
