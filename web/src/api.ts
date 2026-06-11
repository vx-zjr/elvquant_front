import type {
  ArtifactsPayload,
  HealthPayload,
  RunPayload,
  StooqStatus,
  WorkflowsPayload
} from './types';

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...init
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Request failed: ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export const api = {
  health: () => request<HealthPayload>('/api/health'),
  workflows: () => request<WorkflowsPayload>('/api/workflows'),
  stooqStatus: () => request<StooqStatus>('/api/stooq/status'),
  artifacts: () => request<ArtifactsPayload>('/api/artifacts'),
  runWorkflow: (workflowId: string) =>
    request<RunPayload>('/api/run', {
      method: 'POST',
      body: JSON.stringify({ workflow_id: workflowId })
    })
};

