import { describe, expect, it } from "vitest";
import { signatureJpeg, signaturePng } from "../../../test/signature-images.js";
import type { ManifestFieldDefinition } from "../types/manifest.js";
import {
  getSignatureConfig,
  getSignatureDataUrl,
  isSignatureValueEmpty,
  validateSignatureValue,
} from "./signature.js";

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

  it.each([signaturePng, signatureJpeg])(
    "accepts stored PNG/JPEG values",
    (value) => {
      expect(isSignatureValueEmpty(value)).toBe(false);
      expect(getSignatureDataUrl(`\n${value}\n`)).toBe(value);
    },
  );

  it.each([
    null,
    undefined,
    1,
    [],
    {},
    "file:///tmp/signature.png",
    "https://example.com/signature.png",
    `data:image/png;base64,${"A".repeat(200)}`,
    "data:image/png;base64,!!!!",
    "data:image/png;base64,iVBORw0KGgo=",
    "data:image/jpeg;base64,/9j/",
    "data:image/svg+xml;base64,PHN2Zy8+",
    signaturePng.replace("image/png", "image/jpeg"),
    `${signaturePng}" onerror="alert(1)`,
  ])("rejects unsupported or malformed data: %s", (value) => {
    expect(getSignatureDataUrl(value)).toBeNull();
    expect(isSignatureValueEmpty(value)).toBe(true);
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

  it.each([signaturePng, signatureJpeg])(
    "keeps existing image values valid",
    (value) => {
      expect(validateSignatureValue(field(), value)).toEqual([]);
    },
  );

  it("rejects a malformed optional signature without making an empty optional field required", () => {
    const optional = field({ required: false });
    expect(validateSignatureValue(optional, null)).toEqual([]);
    expect(
      validateSignatureValue(optional, "not-an-image")[0].message,
    ).toContain("PNG or JPEG");
  });
});

it("uses explicit appearance mode while keeping legacy manifests unchanged", () => {
  const legacy = {
    penColor: "#123456",
    backgroundColor: "#000000",
    borderColor: "#999999",
    showPenCursor: false,
  };
  const configured = (config: Record<string, unknown>) =>
    field({ frontend: { renderer: "signature", config } });
  expect(getSignatureConfig(configured(legacy))).toEqual(legacy);
  expect(
    getSignatureConfig(configured({ ...legacy, customizeAppearance: true })),
  ).toEqual({ ...legacy, customizeAppearance: true });
  expect(
    getSignatureConfig(configured({ ...legacy, customizeAppearance: false })),
  ).toMatchObject({
    customizeAppearance: false,
    penColor: "#000000",
    backgroundColor: "rgba(0,0,0,0)",
    borderColor: "#999999",
    showPenCursor: true,
  });
  expect(legacy.penColor).toBe("#123456");
});
