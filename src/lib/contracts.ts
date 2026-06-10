import { z } from "zod";

export const ArtifactRefSchema = z.object({
  kind: z.string(),
  path_or_url: z.string(),
  content_type: z.string(),
});

export const EquityPointSchema = z.object({
  as_of: z.string(),
  cash: z.number(),
  positions: z.record(z.string(), z.number()),
  equity: z.number(),
  cumulative_cost: z.number(),
});

export const StructuredReportSchema = z.object({
  run_id: z.string(),
  workflow: z.string(),
  status: z.enum(["completed", "failed", "blocked"]),
  metadata: z.record(z.string(), z.string()),
  config_summary: z.record(z.string(), z.string()),
  metrics: z.record(z.string(), z.number()),
  equity_curve: z.array(EquityPointSchema),
  final_positions: z.record(z.string(), z.number()),
  artifacts: z.array(ArtifactRefSchema),
  warnings: z.array(z.string()),
});

export const WorkflowSchema = z.object({
  id: z.string(),
  label: z.string(),
  description: z.string(),
  requiresData: z.boolean(),
});

export const RunSummarySchema = z.object({
  runId: z.string(),
  workflow: z.string(),
  status: z.enum(["completed", "failed", "blocked"]),
  metrics: z.record(z.string(), z.number()),
});

export const RunCreateRequestSchema = z.object({
  workflowId: z.string().min(1),
  configId: z.string().min(1).optional(),
});

export const RunCreateResponseSchema = z.object({
  runId: z.string(),
  status: z.enum(["completed", "failed", "blocked"]),
});

export type ArtifactRef = z.infer<typeof ArtifactRefSchema>;
export type StructuredReport = z.infer<typeof StructuredReportSchema>;
export type Workflow = z.infer<typeof WorkflowSchema>;
export type RunSummary = z.infer<typeof RunSummarySchema>;
export type RunCreateRequest = z.infer<typeof RunCreateRequestSchema>;
export type RunCreateResponse = z.infer<typeof RunCreateResponseSchema>;
