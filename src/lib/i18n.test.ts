import { describe, expect, it } from "vitest";
import { dictionaries, normalizeLocale, statusLabel } from "./i18n";

describe("i18n", () => {
  it("defaults to Chinese", () => {
    expect(normalizeLocale(undefined)).toBe("zh");
    expect(dictionaries.zh.dashboardTitle).toBe("研究运行");
  });

  it("returns English labels", () => {
    expect(normalizeLocale("en")).toBe("en");
    expect(statusLabel("completed", "en")).toBe("Completed");
  });
});
