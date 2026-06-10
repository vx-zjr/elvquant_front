import { describe, expect, it } from "vitest";
import { readServerEnv } from "@/lib/env";

describe("readServerEnv", () => {
  it("requires the server-only core service token", () => {
    expect(() =>
      readServerEnv({
        AUTH_MODE: "local",
        CORE_API_BASE_URL: "http://127.0.0.1:8000",
        LOCAL_DEBUG_USER_ID: "local-debug-user",
      }),
    ).toThrow();
  });

  it("parses local debug configuration without public auth variables", () => {
    expect(
      readServerEnv({
        AUTH_MODE: "local",
        CORE_API_BASE_URL: "http://127.0.0.1:8000",
        CORE_API_SERVICE_TOKEN: "dev-token",
        LOCAL_DEBUG_USER_ID: "local-debug-user",
      }),
    ).toMatchObject({ AUTH_MODE: "local", CORE_API_SERVICE_TOKEN: "dev-token" });
  });
});
