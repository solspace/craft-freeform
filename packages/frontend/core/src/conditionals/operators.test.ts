import { describe, expect, it } from "vitest";
import { evaluateCondition } from "./operators.js";

const hidden = new Set<string>();

describe("evaluateCondition", () => {
  it("compares scalar equals case-insensitively", () => {
    expect(
      evaluateCondition({ role: "Admin" }, hidden, {
        field: "role",
        operator: "equals",
        value: "admin",
      }),
    ).toBe(true);
  });

  it("evaluates isEmpty for missing values", () => {
    expect(
      evaluateCondition({}, hidden, { field: "company", operator: "isEmpty" }),
    ).toBe(true);
  });

  it("evaluates array contains", () => {
    expect(
      evaluateCondition({ tags: ["a", "b"] }, hidden, {
        field: "tags",
        operator: "contains",
        value: "b",
      }),
    ).toBe(true);
  });

  it("treats hidden source fields as empty", () => {
    const hiddenFields = new Set(["source"]);
    expect(
      evaluateCondition({ source: "yes" }, hiddenFields, {
        field: "source",
        operator: "isNotEmpty",
      }),
    ).toBe(false);
  });

  it("evaluates numeric greaterThan", () => {
    expect(
      evaluateCondition({ amount: "10" }, hidden, {
        field: "amount",
        operator: "greaterThan",
        value: "5",
      }),
    ).toBe(true);
  });
});
