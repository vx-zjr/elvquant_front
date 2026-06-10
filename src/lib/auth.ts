import { headers } from "next/headers";
import { readServerEnv } from "@/lib/env";

export async function currentOwnerUserId(): Promise<string> {
  const env = readServerEnv();
  if (env.AUTH_MODE === "clerk") {
    const headerStore = await headers();
    const forwardedUser = headerStore.get("x-clerk-user-id");
    if (forwardedUser) return forwardedUser;
    throw new Error("Clerk user id is required in clerk auth mode");
  }
  return env.LOCAL_DEBUG_USER_ID;
}
