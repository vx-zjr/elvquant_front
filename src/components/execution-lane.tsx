import { CheckCircle2, CircleDot, Database, FileJson, PlayCircle, ShieldCheck } from "lucide-react";
import type { Workflow } from "@/lib/contracts";
import { dictionaries, type Locale } from "@/lib/i18n";

type ExecutionLaneProps = {
  selected?: Workflow;
  locale: Locale;
  isPending?: boolean;
};

export function ExecutionLane({ selected, locale, isPending = false }: ExecutionLaneProps) {
  const dictionary = dictionaries[locale];
  const steps = [
    { icon: PlayCircle, label: dictionary.queueStep, active: true },
    { icon: Database, label: selected?.requiresData ? dictionary.dataStep : dictionary.localStep, active: true },
    { icon: ShieldCheck, label: dictionary.riskStep, active: true },
    { icon: FileJson, label: dictionary.reportStep, active: !isPending },
  ];
  return (
    <div className="execution-lane" aria-label={dictionary.executionLane}>
      {steps.map((step, index) => {
        const Icon = step.icon;
        return (
          <div className={step.active ? "execution-step active" : "execution-step"} key={step.label}>
            <div className="step-node">
              {isPending && index === 0 ? <CircleDot size={16} /> : <Icon size={16} />}
            </div>
            <span>{step.label}</span>
            {index < steps.length - 1 ? <CheckCircle2 className="step-connector" size={14} /> : null}
          </div>
        );
      })}
    </div>
  );
}
