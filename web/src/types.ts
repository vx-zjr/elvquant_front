export type Workflow = {
  id: string;
  name: string;
  description: string;
  category: string;
};

export type HealthPayload = {
  service: string;
  version: string;
  frontend: string;
  core_available: boolean;
  core_root: string;
  message: string;
};

export type WorkflowsPayload = {
  core_available: boolean;
  core_root: string;
  message: string;
  workflows: Workflow[];
};

export type DailyRow = {
  date: string;
  equity: number;
  orders: number;
  risk_allowed: boolean;
  daily_report: string;
};

export type ParsedReport = {
  fields: Record<string, string>;
  metrics: Record<string, number>;
  daily_rows: DailyRow[];
};

export type MetricCard = {
  key: string;
  label: string;
  value: number;
  formatted: string;
};

export type RunPayload = {
  ok: boolean;
  workflow_id: string;
  title: string;
  text: string;
  parsed: ParsedReport;
  metric_cards?: MetricCard[];
};

export type StooqStatus = {
  available: boolean;
  message: string;
  core_root: string;
  config_path: string;
  data_path: string;
  raw_files: string[];
  asset_count?: number;
  start?: string;
  end?: string;
};

export type Artifact = {
  path: string;
  display_path: string;
  name: string;
  modified_at: number;
  size: number;
};

export type ArtifactsPayload = {
  artifacts: Artifact[];
};

