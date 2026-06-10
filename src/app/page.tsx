import { LanguageSwitcher } from "@/components/language-switcher";
import { MetricGrid } from "@/components/metric-grid";
import { RunTable } from "@/components/run-table";
import { StooqStatus } from "@/components/stooq-status";
import { SystemTelemetry } from "@/components/system-telemetry";
import { WorkflowBoard } from "@/components/workflow-board";
import { getRuns, getWorkflows } from "@/lib/core-api";
import { currentOwnerUserId } from "@/lib/auth";
import { dictionaries, normalizeLocale, statusLabel } from "@/lib/i18n";

type DashboardPageProps = {
  searchParams: Promise<{ lang?: string }>;
};

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const locale = normalizeLocale((await searchParams).lang);
  const dictionary = dictionaries[locale];
  const userId = await currentOwnerUserId();
  const [workflows, runs] = await Promise.all([getWorkflows(userId), getRuns(userId)]);
  const latestRun = runs[0];
  const completedCount = runs.filter((run) => run.status === "completed").length;
  const blockedCount = runs.filter((run) => run.status === "blocked").length;

  return (
    <main className="page-stack">
      <section className="hero-panel">
        <div>
          <span className="eyebrow">elvquant</span>
          <h1>{dictionary.dashboardTitle}</h1>
          <p>{dictionary.dashboardSubtitle}</p>
        </div>
        <div className="hero-actions">
          <LanguageSwitcher locale={locale} pathname="/" />
          <div className="owner-chip">{dictionary.owner}: {userId}</div>
        </div>
      </section>

      <section className="kpi-strip">
        <div className="metric"><span className="muted">{dictionary.runCount}</span><strong>{runs.length}</strong></div>
        <div className="metric"><span className="muted">{dictionary.workflowCount}</span><strong>{workflows.length}</strong></div>
        <div className="metric"><span className="muted">{dictionary.completedRuns}</span><strong>{completedCount}</strong></div>
        <div className="metric"><span className="muted">{dictionary.blockedRuns}</span><strong>{blockedCount}</strong></div>
      </section>

      <SystemTelemetry workflows={workflows} runs={runs} locale={locale} />

      <div className="dashboard-grid">
        <WorkflowBoard workflows={workflows} locale={locale} />
        <section className="insight-panel">
          <span className="eyebrow">{dictionary.latestRun}</span>
          {latestRun ? (
            <>
              <h2>{latestRun.runId}</h2>
              <p>{latestRun.workflow} · {statusLabel(latestRun.status, locale)}</p>
              <MetricGrid metrics={latestRun.metrics} locale={locale} />
            </>
          ) : (
            <p className="muted">{dictionary.noRuns}</p>
          )}
        </section>
      </div>

      <StooqStatus workflows={workflows} locale={locale} />

      <RunTable runs={runs} locale={locale} />
    </main>
  );
}
