import { expect, it } from "vitest";
import {
  getNumberError,
  type NumberConfig,
  numberInputAttributes,
} from "./number.js";

it.each<[string, NumberConfig, string | undefined]>([
  ["", {}, undefined],
  ["0", {}, undefined],
  ["12", {}, undefined],
  ["12.5", {}, "Enter a whole number."],
  ["12.345", { decimalCount: 2 }, "Use no more than 2 decimal places."],
  ["12.3400", { decimalCount: 2 }, "Use no more than 2 decimal places."],
  ["12.34", { decimalCount: 2 }, undefined],
  ["12,34", { decimalCount: 2 }, undefined],
  [".25", { decimalCount: 2 }, undefined],
  ["-1", {}, "Enter zero or a positive number."],
  ["-1.25", { decimalCount: 2, allowNegative: true }, undefined],
  ["0", { min: 1, max: 100 }, "Enter a number between 1 and 100."],
  ["101", { min: 1, max: 100 }, "Enter a number between 1 and 100."],
  ["0", { min: 0, max: 100 }, undefined],
  ["2", { max: 0 }, "Enter a number less than or equal to 0."],
  [
    "0.25",
    { decimalCount: 2, min: 0.5 },
    "Enter a number greater than or equal to 0.5.",
  ],
  ["1e3", {}, undefined],
  ["1.25e2", {}, undefined],
  ["1e-3", { decimalCount: 2 }, "Use no more than 2 decimal places."],
  ["1e999", {}, "Enter a number."],
  ["1e", {}, "Enter a number."],
  ["-", {}, "Enter a number."],
  [".", {}, "Enter a number."],
  ["1,234.5", { decimalCount: 2 }, "Enter a number."],
  ["nope", {}, "Enter a number."],
])("validates %j using %j", (value, config, expected) => {
  expect(getNumberError(value, config)).toBe(expected);
});

it("derives keyboards and the default increment from existing settings, preserving custom increments", () => {
  expect(numberInputAttributes()).toEqual({
    inputMode: "numeric",
    min: 0,
    max: undefined,
    step: 1,
  });
  expect(numberInputAttributes({ decimalCount: 2 })).toMatchObject({
    inputMode: "decimal",
    step: 0.01,
  });
  expect(numberInputAttributes({ decimalCount: 2, step: 0.25 })).toMatchObject({
    step: 0.25,
  });
  expect(numberInputAttributes({ allowNegative: true })).toMatchObject({
    inputMode: "text",
    min: undefined,
  });
  expect(
    numberInputAttributes({ allowNegative: true, min: -5, max: 10 }),
  ).toMatchObject({ min: -5, max: 10 });
});

it("formats translated messages as text", () => {
  expect(
    getNumberError("4", {
      min: 1,
      max: 3,
      messages: { range: "Kies een getal tussen {min} en {max}." },
    }),
  ).toBe("Kies een getal tussen 1 en 3.");
});
