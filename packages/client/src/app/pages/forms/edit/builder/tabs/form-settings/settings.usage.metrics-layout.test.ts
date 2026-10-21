import { expect, it } from "vitest";
import { needsRulesSpace } from "./settings.usage.metrics-layout";

it("keeps Rules for short counts and moves it when preferred counts no longer fit", () => {
  expect(needsRulesSpace(6, 1256, 12, 160)).toBe(false);
  expect(needsRulesSpace(6, 1256, 12, 214)).toBe(true);
  expect(needsRulesSpace(6, 1440, 12, 214)).toBe(false);
});

it("keeps the five-card fallback stable instead of toggling when extra space appears", () => {
  expect(needsRulesSpace(5, 1256, 12, 214)).toBe(true);
  expect(needsRulesSpace(5, 1440, 12, 214)).toBe(false);
});

it("restores Rules when the layout wraps into two rows or more", () => {
  expect(needsRulesSpace(3, 780, 12, 214)).toBe(false);
  expect(needsRulesSpace(2, 450, 12, 214)).toBe(false);
  expect(needsRulesSpace(1, 250, 12, 214)).toBe(false);
});

it("allows an exact fit and makes room as soon as the available space shrinks", () => {
  expect(needsRulesSpace(6, 1344, 12, 214)).toBe(false);
  expect(needsRulesSpace(6, 1343, 12, 214)).toBe(true);
});
