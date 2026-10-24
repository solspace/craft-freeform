import { expect, it } from "vitest";
import { isInsideContainer, rowInsertionIndex } from "./row-placement";

it("places an incoming spacer before, between, or after two existing fields", () => {
  expect([120, 450, 780].map((x) => rowInsertionIndex(x, 100, 900, 3))).toEqual(
    [0, 1, 2],
  );
  expect(rowInsertionIndex(1000, 100, 900, 3)).toBe(2);
  expect(rowInsertionIndex(0, 100, 900, 3)).toBe(0);
});
it("keeps reorder positions within the existing field count", () => {
  expect(rowInsertionIndex(999, 100, 900, 2)).toBe(1);
  expect(rowInsertionIndex(999, 100, 900, 1)).toBe(0);
});
it("protects inner column targets from the parent row's sibling insertion animation", () => {
  const host = document.createElement("div");
  host.innerHTML = '<div data-field-type="layout"></div>';
  host.firstElementChild.getBoundingClientRect = () =>
    ({ left: 100, right: 500, top: 100, bottom: 400 }) as DOMRect;
  expect(isInsideContainer(host, { x: 450, y: 300 })).toBe(true);
  expect(isInsideContainer(host, { x: 520, y: 300 })).toBe(false);
});
