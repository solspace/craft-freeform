import { expect, it, vi } from "vitest";
import { comparisonDescription, comparisonLabel } from "./card.chart";
import type { CardStats } from "./card.queries";

vi.mock("@ff-client/utils/translations", () => ({
  default: (text: string) => text,
}));
const stats = (current: number, previous: number): CardStats => ({
  total: current,
  previousTotal: previous,
  changePercent: previous
    ? Math.round(((current - previous) / previous) * 1000) / 10
    : current
      ? null
      : 0,
  daily: [],
  statuses: [],
  period: {
    from: "2026-09-23",
    to: "2026-10-22",
    previousFrom: "2026-08-24",
    previousTo: "2026-09-22",
  },
});
it("formats positive and negative changes and exposes exact counts and UTC periods", () => {
  expect(comparisonLabel(stats(518, 200))).toBe("↑ 159%");
  expect(comparisonLabel(stats(122, 119))).toBe("↑ 2.5%");
  expect(comparisonLabel(stats(16, 131))).toBe("↓ 87.8%");
  expect(comparisonDescription(stats(518, 200))).toContain(
    "518 vs. 200 submissions.",
  );
  expect(comparisonDescription(stats(518, 200))).toContain(
    "2026-09-23–2026-10-22 (today so far) vs. 2026-08-24–2026-09-22 (UTC)",
  );
});
it("does not invent a percentage when the previous period had no submissions", () => {
  expect(comparisonLabel(stats(8, 0))).toBe("No earlier data");
  expect(comparisonLabel(stats(0, 0))).toBe("No change");
  expect(comparisonLabel(stats(5, 5))).toBe("No change");
  expect(comparisonLabel(undefined)).toBe("—");
});
