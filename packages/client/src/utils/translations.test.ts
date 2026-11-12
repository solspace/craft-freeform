import { afterEach, expect, it, vi } from "vitest";
import translate from "./translations";

afterEach(() => vi.unstubAllGlobals());

it("keeps controls available while Craft's bridge initializes its translation API", () => {
  vi.stubGlobal("Craft", {});
  expect(translate("Saved {count} submissions", { count: 2 })).toBe(
    "Saved 2 submissions",
  );
});

it("uses Craft's translator when ready", () => {
  const t = vi.fn(() => "Soumissions enregistrées");
  vi.stubGlobal("Craft", { t });
  expect(translate("Saved submissions")).toBe("Soumissions enregistrées");
  expect(t).toHaveBeenCalledWith("freeform", "Saved submissions", {});
});

it("handles empty labels before the bridge exists", () => {
  vi.stubGlobal("Craft", undefined);
  expect(translate(undefined)).toBe("");
  expect(translate("Page {number}", { number: 2 })).toBe("Page 2");
});
