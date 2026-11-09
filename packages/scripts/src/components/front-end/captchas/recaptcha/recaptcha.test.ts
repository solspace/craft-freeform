import events from "@lib/plugin/constants/event-types";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type {
  CaptchaMountContext,
  ExtensionSubmitContext,
} from "../../../../../../frontend/core/src/extensions/registry";
import { createRecaptchaExtension } from "../../../../../../frontend/extensions/src/captchas/recaptcha";
import { loadRecaptcha } from "../../../../../../frontend/extensions/src/captchas/recaptcha-loader";
import { captchaScriptUrl } from "../../../../../../frontend/extensions/src/captchas/script-url";
import { registerRecaptcha } from "./utils/controller";

registerRecaptcha("v3");
registerRecaptcha("v2-checkbox");
registerRecaptcha("v2-invisible");
const host = window as Window & {
  grecaptcha?: unknown;
  __freeformRecaptchaLoads?: Map<string, unknown>;
  __freeformCaptchaScriptPolicy?: unknown;
};
let api: ReturnType<typeof makeApi>;
const flush = async () => {
  for (let i = 0; i < 12; i++) await Promise.resolve();
};
function makeApi() {
  return {
    ready: vi.fn((callback: () => void) => callback()),
    execute: vi
      .fn<(...args: unknown[]) => Promise<string> | undefined>()
      .mockResolvedValue("fresh-token"),
    render: vi.fn().mockReturnValue(0),
    getResponse: vi.fn().mockReturnValue(""),
    reset: vi.fn(),
  };
}
function loaded(
  mode = "legacy",
  version = "v3",
  key = "site",
  domain = "google.com",
) {
  const script = document.createElement("script");
  script.src = `https://www.${domain}/recaptcha/${mode === "enterprise" ? "enterprise" : "api"}.js?render=${version === "v3" ? key : "explicit"}`;
  document.head.appendChild(script);
  host.grecaptcha = mode === "enterprise" ? { enterprise: api } : api;
}
function form(version = "v3", mode = "legacy", lazy = false) {
  const element = document.createElement("form");
  element.innerHTML = `<input name="name"><div data-captcha="recaptcha" data-sitekey="site" data-version="${version}" data-verification-mode="${mode}" ${lazy ? "data-lazy-load" : ""}></div>`;
  document.body.appendChild(element);
  return element;
}
function dispatch(name: string, element: HTMLFormElement, back = false) {
  const callbacks: (() => Promise<void>)[] = [];
  const event = new Event(name);
  Object.assign(event, {
    form: element,
    isBackButtonPressed: back,
    addCallback: (callback: () => Promise<void>) => callbacks.push(callback),
  });
  document.dispatchEvent(event);
  return callbacks;
}
async function submit(element: HTMLFormElement, back = false) {
  await Promise.all(
    dispatch(events.form.submit, element, back).map((callback) => callback()),
  );
}
function token(element: HTMLFormElement) {
  return new FormData(element).get("g-recaptcha-response");
}

beforeEach(() => {
  api = makeApi();
  document.head.innerHTML = "";
  document.body.innerHTML = "";
  delete host.grecaptcha;
  delete host.__freeformRecaptchaLoads;
  delete host.__freeformCaptchaScriptPolicy;
});
afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("shared Google API loader", () => {
  it("shares the existing Trusted Types policy and carries the CSP nonce to Google scripts", async () => {
    const createPolicy = vi.fn((_name, rules) => rules);
    vi.stubGlobal("trustedTypes", { createPolicy });
    const source = document.createElement("script");
    source.nonce = "qa-nonce";
    document.head.appendChild(source);
    try {
      expect(captchaScriptUrl("https://example.test/captcha.js")).toBe(
        "https://example.test/captcha.js",
      );
      const request = loadRecaptcha({ siteKey: "site", version: "v3" });
      const script = document.scripts[1];
      expect(script.nonce).toBe("qa-nonce");
      expect(script.src).toContain("trustedtypes=true");
      expect(createPolicy).toHaveBeenCalledOnce();
      expect(createPolicy.mock.calls[0][0]).toBe("freeform#captcha-loader");
      host.grecaptcha = api;
      script.dispatchEvent(new Event("load"));
      expect(await request).toBe(api);
    } finally {
      vi.unstubAllGlobals();
    }
  });
  it.each(["legacy", "enterprise"])(
    "loads the correct %s API once across forms",
    async (verificationMode) => {
      const config = { verificationMode, siteKey: "site", version: "v3" };
      const first = loadRecaptcha(config);
      const second = loadRecaptcha(config);
      expect(document.scripts).toHaveLength(1);
      const script = document.scripts[0];
      expect(script.src).toContain(
        verificationMode === "enterprise" ? "/enterprise.js" : "/api.js",
      );
      host.grecaptcha =
        verificationMode === "enterprise" ? { enterprise: api } : api;
      script.dispatchEvent(new Event("load"));
      expect(await first).toBe(api);
      expect(await second).toBe(api);
      await loadRecaptcha(config);
      expect(document.scripts).toHaveLength(1);
    },
  );
  it("keeps different score keys separate and selects the regional domain", async () => {
    loaded();
    await loadRecaptcha({ siteKey: "site", version: "v3" });
    const second = loadRecaptcha({
      siteKey: "other",
      version: "v3",
      scriptDomain: "recaptcha.net",
      locale: "fr",
    });
    const script = document.scripts[1];
    expect(script.src).toContain(
      "https://www.recaptcha.net/recaptcha/api.js?render=other&hl=fr",
    );
    script.dispatchEvent(new Event("load"));
    await second;
    expect(document.scripts).toHaveLength(2);
  });
  it("reuses a matching existing script rather than injecting a duplicate", async () => {
    loaded("enterprise");
    expect(
      await loadRecaptcha({
        siteKey: "site",
        version: "v3",
        verificationMode: "enterprise",
      }),
    ).toBe(api);
    expect(document.scripts).toHaveLength(1);
  });
  it("can retry after a blocked script fails", async () => {
    const failed = loadRecaptcha({ siteKey: "site", version: "v3" });
    const assertion = expect(failed).rejects.toThrow("could not load");
    document.scripts[0].dispatchEvent(new Event("error"));
    await assertion;
    expect(document.scripts).toHaveLength(0);
    const retry = loadRecaptcha({ siteKey: "site", version: "v3" });
    host.grecaptcha = api;
    document.scripts[0].dispatchEvent(new Event("load"));
    expect(await retry).toBe(api);
  });
  it("times out a script that never finishes and an API whose ready callback never runs", async () => {
    vi.useFakeTimers();
    const failed = loadRecaptcha({ siteKey: "site", version: "v3" });
    const assertion = expect(failed).rejects.toThrow("could not load");
    await vi.advanceTimersByTimeAsync(10001);
    await assertion;
    loaded();
    api.ready.mockImplementation(() => {});
    const unready = loadRecaptcha({ siteKey: "site", version: "v3" });
    const nextAssertion = expect(unready).rejects.toThrow("could not load");
    await vi.advanceTimersByTimeAsync(10001);
    await nextAssertion;
  });
});

describe("classic form integration", () => {
  it.each(["legacy", "enterprise"])(
    "generates fresh %s score tokens at submit time",
    async (mode) => {
      loaded(mode);
      const element = form("v3", mode);
      dispatch(events.form.ready, element);
      await flush();
      expect(api.execute).not.toHaveBeenCalled();
      await submit(element);
      expect(api.execute).toHaveBeenCalledWith("site", { action: "submit" });
      expect(token(element)).toBe("fresh-token");
      api.execute.mockResolvedValue("next-token");
      await submit(element);
      expect(token(element)).toBe("next-token");
    },
  );
  it("clears a previous token and settles when execute rejects", async () => {
    loaded();
    const element = form();
    await submit(element);
    api.execute.mockRejectedValue(new Error("blocked"));
    await expect(submit(element)).resolves.toBeUndefined();
    expect(token(element)).toBe("");
  });
  it("settles when token generation never completes", async () => {
    vi.useFakeTimers();
    loaded();
    api.execute.mockReturnValue(new Promise(() => {}));
    const element = form();
    const request = submit(element);
    await vi.advanceTimersByTimeAsync(10001);
    await request;
    expect(token(element)).toBe("");
  });
  it("loads lazy challenges on interaction or direct submission and ignores Back", async () => {
    const element = form("v3", "legacy", true);
    dispatch(events.form.ready, element);
    expect(document.scripts).toHaveLength(0);
    await submit(element, true);
    expect(document.scripts).toHaveLength(0);
    element
      .querySelector("input")!
      .dispatchEvent(new Event("input", { bubbles: true }));
    expect(document.scripts).toHaveLength(1);
    host.grecaptcha = api;
    document.scripts[0].dispatchEvent(new Event("load"));
    await submit(element);
    expect(token(element)).toBe("fresh-token");
  });
  it("renders an Enterprise checkbox, accepts its callback, clears expiration, and resets after a failed submit", async () => {
    loaded("enterprise", "v2-checkbox");
    const element = form("v2-checkbox", "enterprise");
    dispatch(events.form.ready, element);
    await flush();
    expect(api.render).toHaveBeenCalledOnce();
    const options = api.render.mock.calls[0][1];
    const request = submit(element);
    await flush();
    options.callback("checkbox-token");
    await request;
    expect(token(element)).toBe("checkbox-token");
    options["expired-callback"]();
    expect(token(element)).toBe("");
    dispatch(events.form.afterFailedSubmit, element);
    await flush();
    expect(api.reset).toHaveBeenCalledWith(0);
  });
  it("keeps Invisible v2 callbacks separate between forms and initializes on submit", async () => {
    loaded("legacy", "v2-invisible");
    let nextId = 0;
    api.render.mockImplementation(() => nextId++);
    api.execute.mockReturnValue(undefined);
    const a = form("v2-invisible");
    const b = form("v2-invisible");
    const first = submit(a);
    const second = submit(b);
    await flush();
    expect(api.render).toHaveBeenCalledTimes(2);
    api.render.mock.calls[0][1].callback("token-a");
    api.render.mock.calls[1][1].callback("token-b");
    await Promise.all([first, second]);
    expect(token(a)).toBe("token-a");
    expect(token(b)).toBe("token-b");
  });
  it("preserves externally supplied tokens on forms without a managed container", async () => {
    const element = document.createElement("form");
    element.innerHTML =
      '<textarea name="g-recaptcha-response">external-token</textarea>';
    document.body.appendChild(element);
    dispatch(events.form.ready, element);
    await submit(element);
    expect(token(element)).toBe("external-token");
    expect(document.scripts).toHaveLength(0);
  });
});

describe("headless integration", () => {
  function context(mode = "enterprise", frontendMode = "managed") {
    const captcha = {
      name: "g-recaptcha-response",
      provider: "recaptcha",
      siteKey: "site",
      version: "v3",
      verificationMode: mode,
      frontendMode,
    };
    const manifest = { security: { captchas: [captcha] } };
    const element = document.createElement("div");
    document.body.appendChild(element);
    return {
      captcha,
      manifest,
      element,
      intent: "submit",
      values: {},
      meta: {},
    } as unknown as CaptchaMountContext & ExtensionSubmitContext;
  }
  it.each(["legacy", "enterprise"])(
    "uses %s for mount, fresh token generation, and payloads",
    async (mode) => {
      loaded(mode);
      const extension = createRecaptchaExtension();
      const ctx = context(mode);
      await extension.mountCaptcha!(ctx);
      await extension.beforeSubmit!(ctx);
      const setCaptchaToken = vi.fn();
      await extension.buildPayload!({ ...ctx, setCaptchaToken });
      expect(setCaptchaToken).toHaveBeenCalledWith(
        "g-recaptcha-response",
        "fresh-token",
      );
    },
  );
  it("does not load, mount, or overwrite externally supplied tokens", async () => {
    const extension = createRecaptchaExtension();
    const ctx = context("enterprise", "external");
    await extension.mountCaptcha!(ctx);
    await extension.beforeSubmit!(ctx);
    const setCaptchaToken = vi.fn();
    await extension.buildPayload!({ ...ctx, setCaptchaToken });
    expect(setCaptchaToken).not.toHaveBeenCalled();
    expect(document.scripts).toHaveLength(0);
  });
  it("does not reuse tokens after execute rejects", async () => {
    loaded("enterprise");
    const extension = createRecaptchaExtension();
    const ctx = context();
    await extension.mountCaptcha!(ctx);
    await extension.beforeSubmit!(ctx);
    api.execute.mockRejectedValue(new Error("blocked"));
    await expect(extension.beforeSubmit!(ctx)).rejects.toThrow("blocked");
    const setCaptchaToken = vi.fn();
    await extension.buildPayload!({ ...ctx, setCaptchaToken });
    expect(setCaptchaToken).not.toHaveBeenCalled();
  });
});
