import {
  RunCreateResponseSchema,
  RunSummarySchema,
  StructuredReportSchema,
  WorkflowSchema,
} from "@/lib/contracts";
import { readServerEnv } from "@/lib/env";

function coreApiBaseUrl(): string {
  return readServerEnv().CORE_API_BASE_URL;
}

async function coreFetch(path: string, ownerUserId: string, init?: RequestInit): Promise<Response> {
  return fetch(`${coreApiBaseUrl()}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      "X-Service-Token": readServerEnv().CORE_API_SERVICE_TOKEN,
      "X-Owner-User-Id": ownerUserId,
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });
}

export async function getWorkflows(ownerUserId: string) {
  const response = await coreFetch("/workflows", ownerUserId);
  if (!response.ok) throw new Error(`Workflow request failed: ${response.status}`);
  const body = await response.json();
  return WorkflowSchema.array().parse(body.workflows);
}

export async function getRuns(ownerUserId: string) {
  const response = await coreFetch("/runs", ownerUserId);
  if (!response.ok) throw new Error(`Run list request failed: ${response.status}`);
  const body = await response.json();
  return RunSummarySchema.array().parse(body.runs);
}

export async function createRun(ownerUserId: string, workflowId: string) {
  const response = await coreFetch("/runs", ownerUserId, {
    method: "POST",
    body: JSON.stringify({ workflowId }),
  });
  if (!response.ok) throw new Error(`Run create request failed: ${response.status}`);
  return RunCreateResponseSchema.parse(await response.json());
}

export async function getRun(ownerUserId: string, runId: string) {
  const response = await coreFetch(`/runs/${runId}`, ownerUserId);
  if (!response.ok) throw new Error(`Run detail request failed: ${response.status}`);
  return StructuredReportSchema.parse(await response.json());
}
