import { describe, expect, it } from "vitest";
import { layoutColumnWidths, layoutPresets } from "./catalog.types";

describe("layout proportions", () => {
  it("preserves existing preset widths when custom proportions are absent or cleared", () => {
    for (const preset of layoutPresets) {
      expect(layoutColumnWidths(preset.value)).toBe(preset.widths);
      expect(layoutColumnWidths(preset.value, "")).toBe(preset.widths);
    }
  });
  it("supports the sidebar layout and decimal relative widths", () => {
    expect(layoutColumnWidths("three-one")).toBe("3fr 1fr");
    expect(layoutColumnWidths("one-three")).toBe("1fr 3fr");
    expect(layoutColumnWidths("three-one", "2, 1")).toBe(
      "minmax(0, 2fr) minmax(0, 1fr)",
    );
    expect(layoutColumnWidths("sidebar")).toBe("1fr 2fr 1fr");
    expect(layoutColumnWidths("three", "1, 2.5, .5")).toBe(
      "minmax(0, 1fr) minmax(0, 2.5fr) minmax(0, 0.5fr)",
    );
    expect(layoutColumnWidths("four", "1 2 3 4")).toBe(
      "minmax(0, 1fr) minmax(0, 2fr) minmax(0, 3fr) minmax(0, 4fr)",
    );
  });
  it.each([
    "1,2",
    "0,2,1",
    "-1,2,1",
    "101,1,1",
    "0.01,1,1",
    "1fr 2fr 1fr",
    "1;position:fixed,2,1",
    "Infinity,2,1",
  ])("falls back safely for invalid proportions: %s", (input) =>
    expect(layoutColumnWidths("three", input)).toBe("1fr 1fr 1fr"),
  );
});
