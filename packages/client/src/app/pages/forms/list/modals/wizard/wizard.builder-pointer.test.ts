import { expect, it } from "vitest";
import { visibleBuilderPoint } from "./wizard.builder-pointer";

const modal = { left: 500, right: 1260, top: 180, bottom: 840 };
it("points at an exposed field beside the centered wizard", () => {
  const point = visibleBuilderPoint(
    { left: 260, right: 1010, top: 300, bottom: 380 },
    modal,
    1800,
    1000,
  )!;
  expect(point.x).toBeLessThan(modal.left);
  expect(point.x + point.labelWidth + 14).toBeLessThan(modal.left);
  expect(point.y).toBeGreaterThan(300);
});
it("uses the other side when the left of the field is covered", () => {
  const point = visibleBuilderPoint(
    { left: 1050, right: 1760, top: 300, bottom: 380 },
    modal,
    1800,
    1000,
  )!;
  expect(point.x).toBeGreaterThan(modal.right);
});
it("does not point at completely covered or offscreen content", () => {
  expect(
    visibleBuilderPoint(
      { left: 600, right: 900, top: 300, bottom: 380 },
      modal,
      1800,
      1000,
    ),
  ).toBeUndefined();
  expect(
    visibleBuilderPoint(
      { left: 260, right: 1760, top: 1200, bottom: 1300 },
      modal,
      1800,
      1000,
    ),
  ).toBeUndefined();
});
it("clips to the visible scroll area and leaves space above the modal", () => {
  const point = visibleBuilderPoint(
    { left: 260, right: 1760, top: 20, bottom: 250 },
    { ...modal, left: 200, right: 1780 },
    1800,
    1000,
    { left: 240, right: 1780, top: 130, bottom: 970 },
  )!;
  expect(point.y).toBeGreaterThanOrEqual(130);
  expect(point.y).toBeLessThan(modal.top);
});
it("points precisely at an exposed checkbox and stays quiet when it is covered", () => {
  const checkbox = { left: 300, right: 314, top: 400, bottom: 414 };
  expect(
    visibleBuilderPoint(checkbox, modal, 1800, 1000, undefined, true),
  ).toMatchObject({ x: 307, y: 407 });
  expect(
    visibleBuilderPoint(
      { ...checkbox, left: 700, right: 714 },
      modal,
      1800,
      1000,
      undefined,
      true,
    ),
  ).toBeUndefined();
});

it("clicks the exposed portion of a partly covered builder tab", () => {
  const point = visibleBuilderPoint(
    { left: 450, right: 560, top: 200, bottom: 248 },
    modal,
    1800,
    1000,
    undefined,
    false,
    true,
  )!;
  expect(point.x).toBeGreaterThan(450);
  expect(point.x).toBeLessThan(modal.left - 8);
  expect(point.y).toBe(224);
  expect(
    visibleBuilderPoint(
      { left: 600, right: 710, top: 200, bottom: 248 },
      modal,
      1800,
      1000,
      undefined,
      false,
      true,
    ),
  ).toBeUndefined();
});
