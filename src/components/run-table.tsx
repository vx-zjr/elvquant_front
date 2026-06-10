"use client";

import Link from "next/link";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { MetricGrid } from "@/components/metric-grid";
import type { RunSummary } from "@/lib/contracts";
import { dictionaries, statusLabel, type Locale } from "@/lib/i18n";

type RunTableProps = {
  runs: RunSummary[];
  locale: Locale;
};

export function RunTable({ runs, locale }: RunTableProps) {
  const dictionary = dictionaries[locale];
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const filteredRuns = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return runs.filter((run) => {
      const matchesStatus = status === "all" || run.status === status;
      const matchesQuery =
        normalized.length === 0 ||
        run.runId.toLowerCase().includes(normalized) ||
        run.workflow.toLowerCase().includes(normalized);
      return matchesStatus && matchesQuery;
    });
  }, [query, runs, status]);

  return (
    <section className="panel table-panel">
      <div className="section-heading horizontal">
        <div>
          <span className="eyebrow">{dictionary.visualSummary}</span>
          <h2>{dictionary.run}</h2>
        </div>
        <div className="table-tools">
          <label className="search-box">
            <Search size={16} />
            <input
              aria-label={dictionary.searchRuns}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={dictionary.searchRuns}
              value={query}
            />
          </label>
          <select aria-label={dictionary.status} onChange={(event) => setStatus(event.target.value)} value={status}>
            <option value="all">{dictionary.allStatuses}</option>
            <option value="completed">{dictionary.completed}</option>
            <option value="failed">{dictionary.failed}</option>
            <option value="blocked">{dictionary.blocked}</option>
          </select>
        </div>
      </div>
      {filteredRuns.length === 0 ? (
        <div className="empty-state">{dictionary.noRuns}</div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>{dictionary.run}</th>
              <th>{dictionary.workflow}</th>
              <th>{dictionary.status}</th>
              <th>{dictionary.metrics}</th>
            </tr>
          </thead>
          <tbody>
            {filteredRuns.map((run) => (
              <tr key={run.runId}>
                <td><Link href={`/runs/${run.runId}?lang=${locale}`}>{run.runId}</Link></td>
                <td>{run.workflow}</td>
                <td><span className={`status-badge ${run.status}`}>{statusLabel(run.status, locale)}</span></td>
                <td><MetricGrid metrics={run.metrics} compact locale={locale} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
