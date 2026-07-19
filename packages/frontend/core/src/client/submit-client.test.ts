import { describe, expect, it, vi } from "vitest";
import type { FreeformManifest } from "../types/manifest.js";
import { submitForm } from "./submit-client.js";

const manifest: FreeformManifest = {
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
    handle: "simpleForm",
    name: "Simple",
    type: "form",
    multiPage: false,
  },
  endpoints: {
    manifest: { method: "GET", url: "/freeform/api/forms/simpleForm/manifest" },
    submit: {
      method: "POST",
      url: "/freeform/api/forms/simpleForm/submit",
      encodings: ["application/json", "multipart/form-data"],
      defaultEncoding: "application/json",
    },
  },
  settings: { multiPage: false, ajax: true, mode: "submit" },
  layout: { pages: [] },
  fields: {},
  conditionals: { fields: [], pages: [], buttons: [], submit: [] },
  security: {
    csrf: {
      required: true,
      tokenEndpoint: "/freeform/tokens",
      submitAs: { json: "header", multipart: "field" },
    },
  },
};

describe("submitForm", () => {
  it("sends JSON with CSRF header", async () => {
    const fetchMock = vi.fn(async (url: string, init?: RequestInit) => {
      if (url.endsWith("/freeform/tokens")) {
        return new Response(
          JSON.stringify({
            csrf: { name: "CRAFT_CSRF_TOKEN", value: "token-1" },
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        );
      }

      expect(init?.headers).toMatchObject({
        "X-CSRF-Token": "token-1",
        "Content-Type": "application/json",
      });

      const body = JSON.parse(String(init?.body));
      expect(body.values).toEqual({ email: "a@b.com" });
      expect(body.intent).toBe("submit");
      expect(body.meta.client).toBe("@solspace/freeform-core");

      return new Response(
        JSON.stringify({
          success: true,
          status: "submitted",
          complete: true,
          errors: { fields: {}, form: [], page: [] },
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    });

    const response = await submitForm(
      {
        baseUrl: "https://example.com",
        clientVersion: "0.1.0-beta.1",
        fetch: fetchMock as typeof fetch,
      },
      {
        manifest,
        request: {
          values: { email: "a@b.com" },
          intent: "submit",
        },
      },
    );

    expect(response.success).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
