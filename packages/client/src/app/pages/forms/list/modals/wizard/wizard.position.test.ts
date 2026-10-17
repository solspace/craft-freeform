import { expect, it } from "vitest";
import { constrainWizardPosition } from "./wizard.position";

it("keeps a moved wizard within reach at every screen edge", () => {
  expect(
    constrainWizardPosition(
      { x: 400, y: 200 },
      { left: 900, right: 1660, top: 400, bottom: 1060 },
      1440,
      900,
    ),
  ).toEqual({ x: 168, y: 28 });
  expect(
    constrainWizardPosition(
      { x: -800, y: -400 },
      { left: -300, right: 460, top: -200, bottom: 460 },
      1440,
      900,
    ),
  ).toEqual({ x: -488, y: -188 });
});
it("leaves a reachable position unchanged", () => {
  expect(
    constrainWizardPosition(
      { x: 30, y: -20 },
      { left: 300, right: 1060, top: 100, bottom: 760 },
      1440,
      900,
    ),
  ).toEqual({ x: 30, y: -20 });
});
