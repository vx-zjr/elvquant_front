import { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  BarChart3,
  Braces,
  CheckCircle2,
  Database,
  FileText,
  Gauge,
  Loader2,
  Play,
  RefreshCw,
  ShieldCheck,
  TerminalSquare
} from 'lucide-react';
import { api } from './api';
import type { Artifact, HealthPayload, RunPayload, StooqStatus, Workflow } from './types';

const EMPTY_RUN: RunPayload = {
  ok: true,
  workflow_id: '',
  title: '等待运行',
  text: '选择一个公开 core 流程后运行。',
  parsed: { fields: {}, metrics: {}, daily_rows: [] },
  metric_cards: []
};

export function App() {
  const [health, setHealth] = useState<HealthPayload | null>(null);
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState('');
  const [stooq, setStooq] = useState<StooqStatus | null>(null);
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [run, setRun] = useState<RunPayload>(EMPTY_RUN);
  const [activeTab, setActiveTab] = useState<'metrics' | 'chart' | 'report' | 'raw'>('metrics');
  const [showRaw, setShowRaw] = useState(true);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState('');

  async function refresh() {
    setLoading(true);
    setError('');
    try {
      const [healthPayload, workflowsPayload, stooqPayload, artifactsPayload] = await Promise.all([
        api.health(),
        api.workflows(),
        api.stooqStatus(),
        api.artifacts()
      ]);
      setHealth(healthPayload);
      setWorkflows(workflowsPayload.workflows);
      setSelectedWorkflow((current) => current || workflowsPayload.workflows[0]?.id || '');
      setStooq(stooqPayload);
      setArtifacts(artifactsPayload.artifacts);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : '加载本地 API 失败');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  async function runSelectedWorkflow() {
    if (!selectedWorkflow) return;
    setRunning(true);
    setError('');
    try {
      const payload = await api.runWorkflow(selectedWorkflow);
      setRun(payload);
      setActiveTab(payload.parsed.daily_rows.length ? 'chart' : 'metrics');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : '运行流程失败');
    } finally {
      setRunning(false);
    }
  }

  const selected = workflows.find((workflow) => workflow.id === selectedWorkflow);
  const metrics = run.metric_cards ?? [];
  const allMetricRows = useMemo(
    () => Object.entries(run.parsed.metrics).map(([key, value]) => ({ key, value })),
    [run.parsed.metrics]
  );

  return (
    <main className="shell">
      <aside className="rail" aria-label="工作流">
        <div className="brand-lockup">
          <div className="brand-mark">EQ</div>
          <div>
            <p className="eyebrow">elvquant</p>
            <h1>研究驾驶舱</h1>
          </div>
        </div>

        <div className="rail-section">
          <div className="section-title">
            <Activity size={15} />
            <span>公开流程</span>
          </div>
          <div className="workflow-list">
            {workflows.map((workflow) => (
              <button
                className={workflow.id === selectedWorkflow ? 'workflow active' : 'workflow'}
                key={workflow.id}
                onClick={() => setSelectedWorkflow(workflow.id)}
                type="button"
                title={workflow.description}
              >
                <span>{workflow.name}</span>
                <small>{workflow.category}</small>
              </button>
            ))}
            {!workflows.length && <div className="empty-line">core 未暴露可用流程</div>}
          </div>
        </div>

        <div className="rail-section boundary">
          <div className="section-title">
            <ShieldCheck size={15} />
            <span>边界</span>
          </div>
          <p>UI 只选择、触发、渲染；策略、数据、风控、记账、密钥留在 elvquant_core。</p>
        </div>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">Local Research Console</p>
            <h2>{selected?.name ?? '本地研究控制台'}</h2>
            <p className="subtle">{selected?.description ?? health?.message ?? '等待本地 API 状态'}</p>
          </div>
          <div className="actions">
            <button className="icon-button" onClick={refresh} type="button" title="刷新状态">
              <RefreshCw size={18} />
            </button>
            <label className="toggle" title="显示原始输出">
              <input checked={showRaw} onChange={(event) => setShowRaw(event.target.checked)} type="checkbox" />
              <span>Raw</span>
            </label>
            <button
              className="run-button"
              disabled={!selectedWorkflow || running || loading}
              onClick={runSelectedWorkflow}
              type="button"
            >
              {running ? <Loader2 className="spin" size={18} /> : <Play size={18} />}
              <span>运行所选流程</span>
            </button>
          </div>
        </header>

        {error && (
          <div className="notice danger">
            <AlertTriangle size={18} />
            <span>{error}</span>
          </div>
        )}

        <section className="status-grid">
          <StatusTile
            icon={<Gauge size={18} />}
            label="API"
            value={health?.service ?? 'loading'}
            tone={health ? 'good' : 'muted'}
          />
          <StatusTile
            icon={<Database size={18} />}
            label="Core"
            value={health?.core_available ? 'connected' : 'unavailable'}
            tone={health?.core_available ? 'good' : 'warn'}
          />
          <StatusTile
            icon={<BarChart3 size={18} />}
            label="Workflows"
            value={String(workflows.length)}
            tone={workflows.length ? 'good' : 'muted'}
          />
          <StatusTile
            icon={<FileText size={18} />}
            label="Reports"
            value={String(artifacts.length)}
            tone={artifacts.length ? 'good' : 'muted'}
          />
        </section>

        <section className="main-grid">
          <div className="panel metrics-panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">Result</p>
                <h3>关键指标</h3>
              </div>
              <span className={run.ok ? 'pill ok' : 'pill warn'}>{run.ok ? 'clean' : 'review'}</span>
            </div>
            <div className="metric-grid">
              {(metrics.length ? metrics : fallbackMetrics(allMetricRows)).map((metric) => (
                <div className="metric-cell" key={metric.key}>
                  <span>{metric.label}</span>
                  <strong>{metric.formatted}</strong>
                </div>
              ))}
              {!metrics.length && !allMetricRows.length && <div className="empty-line">尚无指标输出</div>}
            </div>
          </div>

          <div className="panel stooq-panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">Data Readiness</p>
                <h3>Stooq 状态</h3>
              </div>
              {stooq?.available ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
            </div>
            <p className="status-message">{stooq?.message ?? '读取中'}</p>
            <dl className="compact-list">
              <div>
                <dt>配置</dt>
                <dd>{stooq?.config_path || '-'}</dd>
              </div>
              <div>
                <dt>数据</dt>
                <dd>{stooq?.data_path || '-'}</dd>
              </div>
              <div>
                <dt>资产</dt>
                <dd>{stooq?.asset_count ?? '-'}</dd>
              </div>
            </dl>
          </div>
        </section>

        <section className="panel report-panel">
          <div className="tabs" role="tablist" aria-label="报告视图">
            <button className={activeTab === 'metrics' ? 'tab active' : 'tab'} onClick={() => setActiveTab('metrics')} type="button">
              <Gauge size={16} />
              <span>指标表</span>
            </button>
            <button className={activeTab === 'chart' ? 'tab active' : 'tab'} onClick={() => setActiveTab('chart')} type="button">
              <BarChart3 size={16} />
              <span>权益曲线</span>
            </button>
            <button className={activeTab === 'report' ? 'tab active' : 'tab'} onClick={() => setActiveTab('report')} type="button">
              <FileText size={16} />
              <span>报告文本</span>
            </button>
            <button className={activeTab === 'raw' ? 'tab active' : 'tab'} onClick={() => setActiveTab('raw')} type="button">
              <TerminalSquare size={16} />
              <span>原始输出</span>
            </button>
          </div>

          {activeTab === 'metrics' && <MetricTable rows={allMetricRows} />}
          {activeTab === 'chart' && <EquityChart rows={run.parsed.daily_rows} />}
          {activeTab === 'report' && <pre className="report-text">{run.text}</pre>}
          {activeTab === 'raw' && (
            <pre className="raw-text">{showRaw ? run.text : '原始输出已隐藏。'}</pre>
          )}
        </section>

        <section className="panel artifact-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Local Artifacts</p>
              <h3>本地报告</h3>
            </div>
            <Braces size={18} />
          </div>
          <div className="artifact-list">
            {artifacts.map((artifact) => (
              <a className="artifact-row" href={`file:///${artifact.path.replaceAll('\\', '/')}`} key={artifact.path}>
                <FileText size={16} />
                <span>{artifact.display_path}</span>
                <ArrowUpRight size={15} />
              </a>
            ))}
            {!artifacts.length && <div className="empty-line">暂无 core 生成的 markdown 报告</div>}
          </div>
        </section>
      </section>
    </main>
  );
}

function StatusTile({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: string; tone: string }) {
  return (
    <div className={`status-tile ${tone}`}>
      <div className="tile-icon">{icon}</div>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function fallbackMetrics(rows: { key: string; value: number }[]) {
  return rows.slice(0, 8).map((row) => ({
    key: row.key,
    label: row.key,
    formatted: Math.abs(row.value) >= 100 ? row.value.toLocaleString(undefined, { maximumFractionDigits: 2 }) : row.value.toFixed(6)
  }));
}

function MetricTable({ rows }: { rows: { key: string; value: number }[] }) {
  if (!rows.length) return <div className="empty-line">尚无可展示指标</div>;
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Metric</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.key}>
              <td>{row.key}</td>
              <td>{row.value.toLocaleString(undefined, { maximumFractionDigits: 6 })}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function EquityChart({ rows }: { rows: RunPayload['parsed']['daily_rows'] }) {
  if (!rows.length) return <div className="empty-line">这个报告没有日度权益序列</div>;
  const values = rows.map((row) => row.equity);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  return (
    <div className="chart" aria-label="权益曲线">
      {rows.map((row) => {
        const height = 12 + ((row.equity - min) / range) * 84;
        return (
          <div className="bar-column" key={row.date} title={`${row.date} ${row.equity.toFixed(2)}`}>
            <span style={{ height: `${height}%` }} />
          </div>
        );
      })}
    </div>
  );
}

