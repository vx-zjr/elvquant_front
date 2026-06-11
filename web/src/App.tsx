import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import {
  AlertTriangle,
  ArrowUpRight,
  BarChart3,
  BellDot,
  ChevronRight,
  CircleDot,
  ClipboardList,
  Cpu,
  FileSearch,
  FileText,
  Gauge,
  Layers3,
  LineChart,
  Loader2,
  Network,
  Play,
  RadioTower,
  RefreshCw,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  TerminalSquare,
  TimerReset,
  Zap
} from 'lucide-react';
import { api } from './api';
import type { Artifact, DailyRow, HealthPayload, RunPayload, StooqStatus, Workflow } from './types';

const EMPTY_RUN: RunPayload = {
  ok: true,
  workflow_id: '',
  title: '等待运行',
  text: '选择一个公开 core 流程后运行。',
  parsed: { fields: {}, metrics: {}, daily_rows: [] },
  metric_cards: []
};

type TabKey = 'metrics' | 'chart' | 'report' | 'raw';

const TAPE_ITEMS = [
  { label: 'SPY.US', value: '+0.42%', tone: 'up' },
  { label: 'QQQ.US', value: '+0.68%', tone: 'up' },
  { label: 'TLT.US', value: '-0.17%', tone: 'down' },
  { label: 'GLD.US', value: '+0.21%', tone: 'up' },
  { label: 'IWM.US', value: '-0.09%', tone: 'down' },
  { label: 'VOL REGIME', value: 'MID', tone: 'flat' }
];

const EXECUTION_STEPS = [
  'Research Intake',
  'Data Gate',
  'Model Run',
  'Risk Review',
  'Artifact Capture'
];

export function App() {
  const [health, setHealth] = useState<HealthPayload | null>(null);
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState('');
  const [workflowQuery, setWorkflowQuery] = useState('');
  const [stooq, setStooq] = useState<StooqStatus | null>(null);
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [run, setRun] = useState<RunPayload>(EMPTY_RUN);
  const [activeTab, setActiveTab] = useState<TabKey>('metrics');
  const [showRaw, setShowRaw] = useState(true);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState('');
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

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
      setLastRefresh(new Date());
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
  const filteredWorkflows = useMemo(() => {
    const query = workflowQuery.trim().toLowerCase();
    if (!query) return workflows;
    return workflows.filter((workflow) => {
      const haystack = `${workflow.name} ${workflow.category} ${workflow.description}`.toLowerCase();
      return haystack.includes(query);
    });
  }, [workflowQuery, workflows]);

  const metricRows = useMemo(
    () => Object.entries(run.parsed.metrics).map(([key, value]) => ({ key, value })),
    [run.parsed.metrics]
  );

  const metricDeck = useMemo(() => buildMetricDeck(run), [run]);
  const riskRows = useMemo(() => buildRiskRows(run, stooq, health), [health, run, stooq]);
  const scenarioRows = useMemo(() => buildScenarioRows(run), [run]);
  const auditRows = useMemo(
    () => buildAuditRows(run, selected, artifacts, health, lastRefresh),
    [artifacts, health, lastRefresh, run, selected]
  );

  const systemLatency = health?.core_available ? '< 35 ms' : 'offline';
  const completedSteps = running ? 3 : run.workflow_id ? 5 : health?.core_available ? 2 : 1;

  return (
    <main className="terminal-shell">
      <aside className="control-rail" aria-label="工作流">
        <div className="brand-panel">
          <div className="brand-mark">EQ</div>
          <div>
            <p className="eyebrow">elvquant</p>
            <h1>研究驾驶舱</h1>
            <span className="build-tag">INSTITUTIONAL CONSOLE</span>
          </div>
        </div>

        <div className="workflow-search">
          <Search size={16} />
          <input
            aria-label="搜索工作流"
            onChange={(event) => setWorkflowQuery(event.target.value)}
            placeholder="Search workflow, data, risk..."
            value={workflowQuery}
          />
        </div>

        <div className="rail-block">
          <RailTitle icon={<Layers3 size={15} />} label="Research Stack" />
          <div className="workflow-list">
            {filteredWorkflows.map((workflow) => (
              <button
                className={workflow.id === selectedWorkflow ? 'workflow active' : 'workflow'}
                key={workflow.id}
                onClick={() => setSelectedWorkflow(workflow.id)}
                type="button"
                title={workflow.description}
              >
                <span>{workflow.name}</span>
                <small>{workflow.category}</small>
                <ChevronRight size={15} />
              </button>
            ))}
            {!filteredWorkflows.length && <div className="empty-line">没有匹配的工作流</div>}
          </div>
        </div>

        <div className="rail-block compact-ops">
          <RailTitle icon={<ShieldCheck size={15} />} label="Control Doctrine" />
          <p>UI leads the workstation experience. Core remains the execution boundary.</p>
          <div className="rail-stat-row">
            <span>Mode</span>
            <strong>Local Research</strong>
          </div>
          <div className="rail-stat-row">
            <span>Policy</span>
            <strong>Read-only UI</strong>
          </div>
        </div>
      </aside>

      <section className="workstation">
        <header className="command-deck">
          <div className="command-title">
            <p className="eyebrow">Portfolio Research / Local Runtime</p>
            <h2>{selected?.name ?? '本地研究控制台'}</h2>
            <p>{selected?.description ?? health?.message ?? '等待本地 API 状态'}</p>
          </div>
          <div className="command-actions">
            <button className="icon-button" onClick={refresh} type="button" title="刷新状态">
              <RefreshCw className={loading ? 'spin' : undefined} size={18} />
            </button>
            <label className="toggle" title="显示原始输出">
              <input checked={showRaw} onChange={(event) => setShowRaw(event.target.checked)} type="checkbox" />
              <span>Raw feed</span>
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

        <section className="market-tape" aria-label="Market status tape">
          {TAPE_ITEMS.map((item) => (
            <div className={`tape-item ${item.tone}`} key={item.label}>
              <span>{item.label}</span>
              <strong>{item.value}</strong>
            </div>
          ))}
        </section>

        {error && (
          <div className="notice danger">
            <AlertTriangle size={18} />
            <span>{error}</span>
          </div>
        )}

        <section className="system-grid">
          <StatusTile icon={<Cpu size={18} />} label="Runtime" value={health?.service ?? 'loading'} tone={health ? 'good' : 'muted'} />
          <StatusTile
            icon={<Network size={18} />}
            label="Core Link"
            value={health?.core_available ? 'connected' : 'unavailable'}
            tone={health?.core_available ? 'good' : 'warn'}
          />
          <StatusTile icon={<TimerReset size={18} />} label="Latency" value={systemLatency} tone={health?.core_available ? 'good' : 'warn'} />
          <StatusTile icon={<FileSearch size={18} />} label="Artifacts" value={String(artifacts.length)} tone={artifacts.length ? 'good' : 'muted'} />
          <StatusTile icon={<RadioTower size={18} />} label="Heartbeat" value={lastRefresh ? lastRefresh.toLocaleTimeString() : '--'} tone="good" />
        </section>

        <section className="metric-deck" aria-label="关键指标">
          {metricDeck.map((metric) => (
            <article className={`metric-card ${metric.tone}`} key={metric.label}>
              <span>{metric.label}</span>
              <strong>{metric.value}</strong>
              <small>{metric.detail}</small>
            </article>
          ))}
        </section>

        <section className="cockpit-grid">
          <Panel className="execution-panel" eyebrow="Run State" title="Execution Ladder" icon={<Zap size={18} />}>
            <div className="ladder">
              {EXECUTION_STEPS.map((step, index) => {
                const status = index + 1 <= completedSteps ? 'done' : running && index === completedSteps ? 'live' : 'idle';
                return (
                  <div className={`ladder-step ${status}`} key={step}>
                    <span className="step-index">{String(index + 1).padStart(2, '0')}</span>
                    <div>
                      <strong>{step}</strong>
                      <small>{status === 'done' ? 'Cleared' : status === 'live' ? 'Streaming' : 'Queued'}</small>
                    </div>
                  </div>
                );
              })}
            </div>
          </Panel>

          <Panel className="risk-panel" eyebrow="Controls" title="Risk Board" icon={<ShieldCheck size={18} />}>
            <div className="risk-board">
              {riskRows.map((row) => (
                <div className={`risk-row ${row.tone}`} key={row.label}>
                  <span>{row.label}</span>
                  <strong>{row.value}</strong>
                  <small>{row.detail}</small>
                </div>
              ))}
            </div>
          </Panel>

          <Panel className="scenario-panel" eyebrow="What-if" title="Scenario Matrix" icon={<SlidersHorizontal size={18} />}>
            <div className="scenario-matrix">
              {scenarioRows.map((row) => (
                <div className="scenario-row" key={row.name}>
                  <span>{row.name}</span>
                  <strong>{row.impact}</strong>
                  <em>{row.confidence}</em>
                </div>
              ))}
            </div>
          </Panel>
        </section>

        <section className="analysis-grid">
          <Panel className="report-console" eyebrow="Analysis Console" title="Report Surface" icon={<TerminalSquare size={18} />}>
            <div className="tabs" role="tablist" aria-label="报告视图">
              <TabButton active={activeTab === 'metrics'} icon={<Gauge size={16} />} label="指标表" onClick={() => setActiveTab('metrics')} />
              <TabButton active={activeTab === 'chart'} icon={<LineChart size={16} />} label="权益曲线" onClick={() => setActiveTab('chart')} />
              <TabButton active={activeTab === 'report'} icon={<FileText size={16} />} label="报告文本" onClick={() => setActiveTab('report')} />
              <TabButton active={activeTab === 'raw'} icon={<ClipboardList size={16} />} label="原始输出" onClick={() => setActiveTab('raw')} />
            </div>

            <div className="console-body">
              {activeTab === 'metrics' && <MetricTable rows={metricRows} />}
              {activeTab === 'chart' && <EquityChart rows={run.parsed.daily_rows} />}
              {activeTab === 'report' && <pre className="report-text">{run.text}</pre>}
              {activeTab === 'raw' && <pre className="raw-text">{showRaw ? run.text : '原始输出已隐藏。'}</pre>}
            </div>
          </Panel>

          <Panel className="audit-panel" eyebrow="Telemetry" title="Audit Stream" icon={<BellDot size={18} />}>
            <div className="audit-stream">
              {auditRows.map((entry) => (
                <div className="audit-row" key={entry.title}>
                  <CircleDot size={12} />
                  <div>
                    <strong>{entry.title}</strong>
                    <small>{entry.detail}</small>
                  </div>
                </div>
              ))}
            </div>
            <div className="artifact-list">
              {artifacts.slice(0, 5).map((artifact) => (
                <a className="artifact-row" href={`file:///${artifact.path.replaceAll('\\', '/')}`} key={artifact.path}>
                  <FileText size={15} />
                  <span>{artifact.display_path}</span>
                  <ArrowUpRight size={14} />
                </a>
              ))}
              {!artifacts.length && <div className="empty-line">暂无 core 生成的 markdown 报告</div>}
            </div>
          </Panel>
        </section>
      </section>
    </main>
  );
}

function RailTitle({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <div className="section-title">
      {icon}
      <span>{label}</span>
    </div>
  );
}

function Panel({ children, className, eyebrow, icon, title }: { children: ReactNode; className?: string; eyebrow: string; icon: ReactNode; title: string }) {
  return (
    <section className={`panel ${className ?? ''}`}>
      <div className="panel-heading">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h3>{title}</h3>
        </div>
        <div className="panel-icon">{icon}</div>
      </div>
      {children}
    </section>
  );
}

function StatusTile({ icon, label, value, tone }: { icon: ReactNode; label: string; value: string; tone: string }) {
  return (
    <div className={`status-tile ${tone}`}>
      <div className="tile-icon">{icon}</div>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function TabButton({ active, icon, label, onClick }: { active: boolean; icon: ReactNode; label: string; onClick: () => void }) {
  return (
    <button className={active ? 'tab active' : 'tab'} onClick={onClick} type="button">
      {icon}
      <span>{label}</span>
    </button>
  );
}

function buildMetricDeck(run: RunPayload) {
  const metrics = run.parsed.metrics;
  return [
    {
      label: 'Net Value',
      value: formatNumber(metrics.net_value, '1.000000'),
      detail: run.workflow_id ? run.title : 'Awaiting run',
      tone: 'neutral'
    },
    {
      label: 'Total Return',
      value: formatPercent(metrics.total_return),
      detail: 'Run-level PnL proxy',
      tone: Number(metrics.total_return ?? 0) >= 0 ? 'positive' : 'negative'
    },
    {
      label: 'Max Drawdown',
      value: formatPercent(metrics.max_drawdown),
      detail: 'Observed drawdown',
      tone: Math.abs(Number(metrics.max_drawdown ?? 0)) < 0.1 ? 'positive' : 'warning'
    },
    {
      label: 'Turnover',
      value: formatPercent(metrics.turnover),
      detail: 'Capacity pressure',
      tone: Number(metrics.turnover ?? 0) > 1 ? 'warning' : 'neutral'
    },
    {
      label: 'Risk Rejects',
      value: String(Math.round(Number(metrics.risk_rejections ?? 0))),
      detail: 'Policy intervention count',
      tone: Number(metrics.risk_rejections ?? 0) ? 'negative' : 'positive'
    }
  ];
}

function buildRiskRows(run: RunPayload, stooq: StooqStatus | null, health: HealthPayload | null) {
  const metrics = run.parsed.metrics;
  return [
    { label: 'Core Boundary', value: health?.core_available ? 'Clean' : 'Offline', detail: health?.message ?? '--', tone: health?.core_available ? 'good' : 'warn' },
    { label: 'Data Readiness', value: stooq?.available ? 'Ready' : 'Pending', detail: stooq?.message ?? 'Unknown data state', tone: stooq?.available ? 'good' : 'warn' },
    { label: 'Drawdown Gate', value: formatPercent(metrics.max_drawdown), detail: 'Soft limit monitor', tone: Math.abs(Number(metrics.max_drawdown ?? 0)) < 0.1 ? 'good' : 'warn' },
    { label: 'Cost Drag', value: formatPercent(metrics.cost_to_return), detail: 'Cost / return', tone: Number(metrics.cost_to_return ?? 0) <= 0.02 ? 'good' : 'warn' }
  ];
}

function buildScenarioRows(run: RunPayload) {
  const totalReturn = Number(run.parsed.metrics.total_return ?? 0);
  const drawdown = Math.abs(Number(run.parsed.metrics.max_drawdown ?? 0));
  return [
    { name: 'Base Case', impact: formatPercent(totalReturn), confidence: run.workflow_id ? 'observed' : 'standby' },
    { name: 'Vol Shock', impact: formatPercent(totalReturn - drawdown * 0.5), confidence: 'model proxy' },
    { name: 'Liquidity Haircut', impact: formatPercent(totalReturn - 0.012), confidence: 'capacity proxy' },
    { name: 'Cost Widening', impact: formatPercent(totalReturn - 0.006), confidence: 'fee stress' }
  ];
}

function buildAuditRows(run: RunPayload, selected: Workflow | undefined, artifacts: Artifact[], health: HealthPayload | null, lastRefresh: Date | null) {
  return [
    { title: 'Runtime heartbeat', detail: `${health?.core_available ? 'connected' : 'offline'} / ${lastRefresh ? lastRefresh.toLocaleTimeString() : '--'}` },
    { title: 'Selected workflow', detail: selected ? `${selected.name} / ${selected.category}` : 'No workflow selected' },
    { title: 'Last run', detail: run.workflow_id ? `${run.title} / ${run.ok ? 'clean' : 'review required'}` : 'No run captured yet' },
    { title: 'Artifact inventory', detail: `${artifacts.length} markdown reports indexed` }
  ];
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

function EquityChart({ rows }: { rows: DailyRow[] }) {
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

function formatPercent(value: unknown) {
  const numberValue = Number(value ?? 0);
  return `${(numberValue * 100).toFixed(2)}%`;
}

function formatNumber(value: unknown, fallback: string) {
  const numberValue = Number(value);
  if (!Number.isFinite(numberValue)) return fallback;
  if (Math.abs(numberValue) >= 100) return numberValue.toLocaleString(undefined, { maximumFractionDigits: 2 });
  return numberValue.toFixed(6);
}
