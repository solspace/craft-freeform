import { describe, expect, it } from "vitest";
import { evaluateCalculation, extractCalculationHandles } from "./evaluate.js";

describe("evaluateCalculation", () => {
  it("extracts field handles from formulas", () => {
    expect(extractCalculationHandles("field:quantity * field:price")).toEqual([
      "quantity",
      "price",
    ]);
  });

  it("evaluates a basic product", async () => {
    const result = await evaluateCalculation("field:quantity * field:price", {
      quantity: 3,
      price: 10,
    });
    expect(result).toBe(30);
  });

  it("returns null when an operand is missing", async () => {
    const result = await evaluateCalculation("field:quantity * field:price", {
      quantity: 3,
    });
    expect(result).toBeNull();
  });

  it("applies decimalCount formatting", async () => {
    const result = await evaluateCalculation(
      "field:a / field:b",
      { a: 10, b: 3 },
      2,
    );
    expect(result).toBe("3.33");
  });

  it("supports sqrt", async () => {
    const result = await evaluateCalculation("sqrt(field:area)", {
      area: 9,
    });
    expect(result).toBe(3);
  });
});
