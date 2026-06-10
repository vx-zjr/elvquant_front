import Link from "next/link";
import { ArtifactViewer } from "@/components/artifact-viewer";
import { EquityChart } from "@/components/equity-chart";
import { LanguageSwitcher } from "@/components/language-switcher";
import { MetricGrid } from "@/components/metric-grid";
import { currentOwnerUserId } from "@/lib/auth";
import { getRun } from "@/lib/core-api";
import { dictionaries, normalizeLocale, statusLabel } from "@/lib/i18n";

type RunPageProps = {
  params: Promise<{ runId: string }>;
  searchParams: Promise<{ lang?: string }>;
};

export default async function RunPage({ params, searchParams }: RunPageProps) {
  const locale = normalizeLocale((await searchParams).lang);
  const dictionary = dictionaries[locale];
  const userId = await currentOwnerUserId();
  const { runId } = await params;
  const run = await getRun(userId, runId);
  const finalPositions = Object.entries(run.final_positions);
  const metadata = Object.entries(run.metadata);

  return (
    <main className="page-stack">
      <section className="hero-panel compact">
        <div>
          <Link className="muted" href={`/?lang=${locale}`}>{dictionary.backToRuns}</Link>
          <h1>{run.run_id}</h1>
          <p>{run.workflow} · {statusLabel(run.status, locale)}</p>
        </div>
        <LanguageSwitcher locale={locale} pathname={`/runs/${run.run_id}`} />
      </section>

      <MetricGrid metrics={run.metrics} locale={locale} />

      <div className="detail-grid">
        <section className="panel visual-panel">
          <div className="section-heading">
            <span className="eyebrow">{dictionary.visualSummary}</span>
            <h2>{dictionary.equityCurve}</h2>
          </div>
          <EquityChart report={run} locale={locale} />
        </section>
        <section className="panel">
          <div className="section-heading">
            <span className="eyebrow">{dictionary.reportMetadata}</span>
            <h2>{dictionary.overview}</h2>
          </div>
          <dl className="key-value-list">
            {metadata.map(([key, value]) => (
              <div key={key}><dt>{key}</dt><dd>{value}</dd></div>
            ))}
          </dl>
        </section>
      </div>

      <div className="detail-grid secondary">
        <section className="panel">
          <div className="section-heading">
            <span className="eyebrow">{dictionary.positions}</span>
            <h2>{dictionary.finalPositions}</h2>
          </div>
          <dl className="key-value-list">
            {finalPositions.length ? finalPositions.map(([asset, value]) => (
              <div key={asset}><dt>{asset}</dt><dd>{value.toFixed(4)}</dd></div>
            )) : <div><dt>--</dt><dd>{dictionary.noPositions}</dd></div>}
          </dl>
        </section>
        <section className="panel artifact-panel">
          <div className="section-heading">
            <span className="eyebrow">{dictionary.reportBrowser}</span>
            <h2>{dictionary.artifacts}</h2>
          </div>
          <ArtifactViewer artifacts={run.artifacts} locale={locale} />
        </section>
      </div>

      <section className="panel table-panel">
        <div className="section-heading">
          <span className="eyebrow">{dictionary.timeline}</span>
          <h2>{dictionary.equityCurve}</h2>
        </div>
        {run.equity_curve.length ? (
          <table>
            <thead>
              <tr>
                <th>{dictionary.date}</th>
                <th>{dictionary.equity}</th>
                <th>{dictionary.cash}</th>
                <th>{dictionary.cost}</th>
              </tr>
            </thead>
            <tbody>
              {run.equity_curve.map((point) => (
                <tr key={point.as_of}>
                  <td>{point.as_of.slice(0, 10)}</td>
                  <td>{point.equity.toFixed(2)}</td>
                  <td>{point.cash.toFixed(2)}</td>
                  <td>{point.cumulative_cost.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : <p className="muted">{dictionary.equityCurveEmpty}</p>}
      </section>

      {run.warnings.length > 0 && (
        <section className="panel">
          <h2>{dictionary.warnings}</h2>
          {run.warnings.map((warning) => <p key={warning}>{warning}</p>)}
        </section>
      )}
    </main>
  );
}
