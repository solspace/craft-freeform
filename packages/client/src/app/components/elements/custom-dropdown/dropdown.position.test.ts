import { expect, it } from "vitest";
import { dropdownPosition } from "./dropdown.position";

it("keeps a long settings menu compact and below its full-width control", () => {
  expect(
    dropdownPosition({ left: 500, top: 200, bottom: 232, width: 1000 }, 300, {
      width: 1600,
      height: 900,
    }),
  ).toMatchObject({ left: 500, top: 236, width: 360 });
});

it("opens above a low control and stays inside a narrow viewport", () => {
  expect(
    dropdownPosition({ left: 250, top: 600, bottom: 632, width: 100 }, 300, {
      width: 390,
      height: 700,
    }),
  ).toMatchObject({ left: 142, top: 296, width: 240 });
});
