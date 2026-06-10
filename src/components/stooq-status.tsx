import { Database } from "lucide-react";
import type { Workflow } from "@/lib/contracts";
import { dictionaries, type Locale } from "@/lib/i18n";

type StooqStatusProps = {
  workflows: Workflow[];
  locale: Locale;
};

export function StooqStatus({ workflows, locale }: StooqStatusProps) {
  const dictionary = dictionaries[locale];
  const stooq = workflows.find((workflow) => workflow.id.includes("stooq"));
  return (
    <section className="panel stooq-panel">
      <div className="section-heading horizontal">
        <div>
          <span className="eyebrow">{dictionary.navData}</span>
          <h2>{dictionary.stooqStatus}</h2>
        </div>
        <Database size={22} />
      </div>
      <p>{dictionary.stooqReady}</p>
      <div className="data-status-row">
        <span className={stooq?.requiresData ? "status-badge blocked" : "status-badge completed"}>
          {stooq ? (stooq.requiresData ? dictionary.dataRequired : dictionary.localOnly) : dictionary.blocked}
        </span>
        <span className="muted">{stooq?.label ?? "stooq_research"}</span>
      </div>
    </section>
  );
}
