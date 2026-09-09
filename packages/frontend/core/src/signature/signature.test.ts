import { describe, expect, it } from "vitest";
import type { ManifestFieldDefinition } from "../types/manifest.js";
import { isSignatureValueEmpty, validateSignatureValue } from "./signature.js";

function field(
  overrides: Partial<ManifestFieldDefinition> = {},
): ManifestFieldDefinition {
  return {
    id: 1,
    uid: "sig",
    handle: "signature",
    type: "signature",
    label: "Signature",
    required: true,
    frontend: {
      renderer: "signature",
      extension: "signature",
      config: { width: 400, height: 100 },
    },
    ...overrides,
  };
}

describe("isSignatureValueEmpty", () => {
  it("treats null/empty as empty", () => {
    expect(isSignatureValueEmpty(null)).toBe(true);
    expect(isSignatureValueEmpty("")).toBe(true);
    expect(isSignatureValueEmpty("not-an-image")).toBe(true);
  });

  it("accepts a real data URL payload", () => {
    const value = `data:image/png;base64,${"A".repeat(200)}`;
    expect(isSignatureValueEmpty(value)).toBe(false);
  });
});

describe("validateSignatureValue", () => {
  it("requires ink when field is required", () => {
    const issues = validateSignatureValue(field(), "");
    expect(issues[0]?.message).toContain("required");
  });

  it("skips when not required", () => {
    expect(validateSignatureValue(field({ required: false }), "")).toEqual([]);
  });
});
