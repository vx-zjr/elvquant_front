import { z } from "zod";

export const ServerEnvSchema = z.object({
  AUTH_MODE: z.enum(["local", "clerk"]).default("local"),
  CORE_API_BASE_URL: z.string().url(),
  CORE_API_SERVICE_TOKEN: z.string().min(1),
  LOCAL_DEBUG_USER_ID: z.string().min(1).default("local-debug-user"),
});

export type ServerEnv = z.infer<typeof ServerEnvSchema>;

export function readServerEnv(source: NodeJS.ProcessEnv = process.env): ServerEnv {
  return ServerEnvSchema.parse(source);
}
