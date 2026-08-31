import { describe, expect, it } from "vitest";
import { inferCaptchaProvider } from "./shared.js";

describe("inferCaptchaProvider", () => {
  it("uses explicit provider when present", () => {
    expect(
      inferCaptchaProvider({
        provider: "turnstile",
        name: "cf-turnstile-response",
      }),
    ).toBe("turnstile");
  });

  it("infers provider from response field name", () => {
    expect(inferCaptchaProvider({ name: "h-captcha-response" })).toBe(
      "hcaptcha",
    );
    expect(inferCaptchaProvider({ name: "g-recaptcha-response" })).toBe(
      "recaptcha",
    );
    expect(inferCaptchaProvider({ name: "frc-captcha-response" })).toBe(
      "friendly-captcha",
    );
  });
});
