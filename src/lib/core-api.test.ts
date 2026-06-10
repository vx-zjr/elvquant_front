import { describe, expect, it, vi } from "vitest";
import { createRun } from "@/lib/core-api";

describe("createRun", () => {
  it("validates create-run responses with zod", async () => {
    const originalFetch = global.fetch;
    global.fetch = vi.fn(async () =>
      new Response(JSON.stringify({ runId: 42, status: "completed" }), { status: 200 }),
    ) as typeof fetch;

    await expect(createRun("owner-a", "synthetic_demo")).rejects.toThrow();
    global.fetch = originalFetch;
  });
});
