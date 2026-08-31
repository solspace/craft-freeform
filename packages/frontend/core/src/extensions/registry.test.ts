import { describe, expect, it, vi } from "vitest";
import type { FreeformManifest } from "../types/manifest.js";
import {
  collectExtensionSubmitMeta,
  type FreeformExtension,
} from "./registry.js";

const manifest = {
  security: {
    captchas: [{ name: "cf-turnstile-response", provider: "turnstile" }],
  },
} as FreeformManifest;

describe("collectExtensionSubmitMeta", () => {
  it("merges captcha tokens from extensions", async () => {
    const extension: FreeformExtension = {
      name: "captcha.turnstile",
      async buildPayload({ setCaptchaToken }) {
        setCaptchaToken("cf-turnstile-response", "token-123");
      },
    };

    const beforeSubmit = vi.fn();
    extension.beforeSubmit = beforeSubmit;

    const meta = await collectExtensionSubmitMeta([extension], {
      manifest,
      intent: "submit",
      values: {},
      meta: {
        honeypot: { name: "hp", value: "" },
      },
    });

    expect(beforeSubmit).toHaveBeenCalled();
    expect(meta.honeypot).toEqual({ name: "hp", value: "" });
    expect(meta.captchas).toEqual([
      { name: "cf-turnstile-response", value: "token-123" },
    ]);
    expect(meta.captcha).toEqual({
      name: "cf-turnstile-response",
      value: "token-123",
    });
  });
});
