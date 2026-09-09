import { describe, expect, it } from "vitest";
import type { FreeformManifest } from "../types/manifest.js";
import { evaluateConditionals } from "./evaluator.js";

function createManifest(
  conditionals: FreeformManifest["conditionals"],
): FreeformManifest {
  return {
    schemaVersion: "1.0",
    pluginVersion: "5.15.19",
    minimumClientVersion: "0.1.0",
    generatedAt: "2026-01-01T00:00:00Z",
    site: {
      id: 1,
      handle: "default",
      language: "en",
      baseUrl: "https://example.com",
    },
    form: {
      id: 1,
      uid: "form-uid",
      handle: "test",
      name: "Test",
      type: "form",
      multiPage: false,
    },
    endpoints: {
      manifest: { method: "GET", url: "/manifest" },
      submit: {
        method: "POST",
        url: "/submit",
        encodings: ["application/json"],
        defaultEncoding: "application/json",
      },
    },
    settings: { multiPage: false, ajax: true, mode: "submit" },
    layout: { pages: [] },
    fields: {
      isBusiness: {
        id: 1,
        uid: "f1",
        handle: "isBusiness",
        type: "checkbox",
        label: "Business",
        required: false,
      },
      companyName: {
        id: 2,
        uid: "f2",
        handle: "companyName",
        type: "text",
        label: "Company",
        required: false,
      },
    },
    conditionals,
    security: {},
  };
}

describe("evaluateConditionals", () => {
  it("hides company when isBusiness is unchecked", () => {
    const manifest = createManifest({
      fields: [
        {
          target: "companyName",
          action: "show",
          logic: "all",
          conditions: [{ field: "isBusiness", operator: "equals", value: "1" }],
        },
      ],
      pages: [],
      buttons: [],
      submit: [],
    });

    const unchecked = evaluateConditionals(manifest, { isBusiness: "" });
    expect(unchecked.hidden.has("companyName")).toBe(true);

    const checked = evaluateConditionals(manifest, { isBusiness: "1" });
    expect(checked.hidden.has("companyName")).toBe(false);
  });
});
