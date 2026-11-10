import events from "@lib/plugin/constants/event-types";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createFriendlyCaptchaExtension } from "../../../../../frontend/extensions/src/captchas/friendly-captcha";
import { createHcaptchaExtension } from "../../../../../frontend/extensions/src/captchas/hcaptcha";
import { loadHcaptcha } from "../../../../../frontend/extensions/src/captchas/hcaptcha-loader";
import { loadScriptOnce } from "../../../../../frontend/extensions/src/captchas/shared";
import { createTurnstileExtension } from "../../../../../frontend/extensions/src/captchas/turnstile";
import { loadCaptchaScript } from "./common.script-loader";
import { registerHcaptcha } from "./hcaptcha/utils/controller";
import "./turnstile/v0";
import "./friendly-captcha/v2";

const sdk = vi.hoisted(() => ({ createWidget: vi.fn() }));
vi.mock("@friendlycaptcha/sdk", () => ({
  FRCWidgetExpireEventName: "frc:expire",
  FRCWidgetCompleteEventName: "frc:complete",
  FriendlyCaptchaSDK: class {
    createWidget = sdk.createWidget;
  },
}));
registerHcaptcha("checkbox");
registerHcaptcha("invisible");

const flush = async () => {
  for (let i = 0; i < 15; i++) await Promise.resolve();
};
const host = window as unknown as {
  hcaptcha: ReturnType<typeof makeApi>;
  turnstile: ReturnType<typeof makeApi>;
  freeform: {
    captchas: {
      listeners: WeakSet<HTMLFormElement>;
      loaderPromises: Map<string, Promise<void>>;
      loaders: Map<string, () => void>;
    };
  };
};
function makeApi() {
  let id = 0;
  return {
    render: vi.fn(
      (_element: HTMLElement, _options: Record<string, unknown>) => id++,
    ),
    getResponse: vi.fn(() => ""),
    reset: vi.fn(),
    execute: vi.fn(),
  };
}
function form(provider = "hcaptcha", version = "checkbox", lazy = false) {
  const element = document.createElement("form");
  element.innerHTML = `<input name="name"><div data-captcha="${provider}" data-sitekey="site" data-version="${version}" data-locale="fr" data-language="fr" ${lazy ? "data-lazy-load" : ""}></div>`;
  document.body.appendChild(element);
  return element;
}
function dispatch(name: string, element: HTMLFormElement) {
  const callbacks: (() => Promise<void>)[] = [];
  const event = new Event(name);
  Object.assign(event, {
    form: element,
    isBackButtonPressed: false,
    addCallback: (callback: () => Promise<void>) => callbacks.push(callback),
  });
  document.dispatchEvent(event);
  return callbacks;
}
const submit = async (element: HTMLFormElement) =>
  Promise.all(
    dispatch(events.form.submit, element).map((callback) => callback()),
  );
function completeLoad() {
  document.querySelectorAll("script").forEach((script) => {
    script.dispatchEvent(new Event("load"));
  });
}
const token = (element: HTMLFormElement, name = "h-captcha-response") =>
  new FormData(element).get(name);

beforeEach(() => {
  delete window.__freeformHcaptchaLoad;
  delete window.__freeformHcaptchaReady;
  document.head.innerHTML = "";
  document.body.innerHTML = "";
  host.hcaptcha = makeApi();
  host.turnstile = makeApi();
  host.freeform.captchas = {
    listeners: new WeakSet(),
    loaderPromises: new Map(),
    loaders: new Map(),
  };
  sdk.createWidget.mockReset();
});
afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("classic captcha forms", () => {
  it("waits for a real Friendly Captcha token instead of its widget status", async () => {
    vi.useFakeTimers();
    sdk.createWidget.mockImplementation(
      ({ element }: { element: HTMLElement }) => {
        const input = document.createElement("input");
        input.name = "frc-captcha-response";
        input.value = ".UNCONNECTED";
        element.appendChild(input);
        return {
          start: vi.fn(() => {
            input.value = ".SOLVING";
            setTimeout(() => {
              input.value = "real-token";
            }, 100);
          }),
          reset: vi.fn(),
        };
      },
    );
    const element = form("friendly-captcha");
    let complete = false;
    const pending = submit(element).then(() => {
      complete = true;
    });
    await flush();
    expect(complete).toBe(false);
    await vi.advanceTimersByTimeAsync(200);
    await pending;
    expect(token(element, "frc-captcha-response")).toBe("real-token");
  });
  it("keeps hCaptcha widget IDs separate and passes the widget language", async () => {
    const first = form(),
      second = form();
    dispatch(events.form.ready, first);
    dispatch(events.form.ready, second);
    completeLoad();
    await flush();
    expect(host.hcaptcha.render).toHaveBeenCalledTimes(2);
    expect(host.hcaptcha.render.mock.calls[0][1].hl).toBe("fr");
    dispatch(events.form.ajaxAfterSubmit, first);
    await flush();
    expect(host.hcaptcha.reset).toHaveBeenLastCalledWith(0);
    dispatch(events.form.ajaxAfterSubmit, second);
    await flush();
    expect(host.hcaptcha.reset).toHaveBeenLastCalledWith(1);
    dispatch(events.form.ready, first);
    await flush();
    expect(host.hcaptcha.render).toHaveBeenCalledTimes(2);
  });
  it("reuses the Invisible widget and obtains a new token after reset", async () => {
    const element = form("hcaptcha", "invisible");
    dispatch(events.form.ready, element);
    completeLoad();
    await flush();
    const options = host.hcaptcha.render.mock.calls[0][1];
    host.hcaptcha.execute.mockImplementation(() => {
      (options.callback as (token: string) => void)("fresh-token");
    });
    await submit(element);
    expect(token(element)).toBe("fresh-token");
    dispatch(events.form.ajaxAfterSubmit, element);
    await flush();
    expect(token(element)).toBe("");
    await submit(element);
    expect(host.hcaptcha.render).toHaveBeenCalledTimes(1);
    expect(host.hcaptcha.execute).toHaveBeenCalledTimes(2);
  });
  it("settles a dismissed Invisible challenge without reusing a token", async () => {
    const element = form("hcaptcha", "invisible");
    dispatch(events.form.ready, element);
    completeLoad();
    await flush();
    const options = host.hcaptcha.render.mock.calls[0][1];
    host.hcaptcha.execute.mockImplementation(() => {
      (options["close-callback"] as () => void)();
    });
    await submit(element);
    expect(token(element)).toBe("");
  });
  it("lets repeated lazy loaders complete when submission forces loading", async () => {
    const element = form("hcaptcha", "checkbox", true);
    const url = new URL("https://js.hcaptcha.com/test.js");
    const first = loadCaptchaScript(url, "hcaptcha", element),
      second = loadCaptchaScript(url, "hcaptcha", element);
    const forced = loadCaptchaScript(url, "hcaptcha", element, true);
    completeLoad();
    await expect(Promise.all([first, second, forced])).resolves.toEqual([
      undefined,
      undefined,
      undefined,
    ]);
  });
  it("can retry a script load after an error", async () => {
    const element = form();
    const url = new URL("https://js.hcaptcha.com/test.js");
    const first = loadCaptchaScript(url, "hcaptcha", element, true);
    const rejected = expect(first).rejects.toThrow("could not be loaded");
    document.querySelector("script")!.dispatchEvent(new Event("error"));
    await rejected;
    await flush();
    const second = loadCaptchaScript(url, "hcaptcha", element, true);
    completeLoad();
    await expect(second).resolves.toBeUndefined();
  });
  it("passes Turnstile's language and refreshes an expired widget", async () => {
    const element = form("turnstile");
    dispatch(events.form.ready, element);
    completeLoad();
    await flush();
    const options = host.turnstile.render.mock.calls[0][1];
    expect(options.language).toBe("fr");
    (options["expired-callback"] as () => void)();
    expect(host.turnstile.reset).toHaveBeenCalledWith("0");
  });
  it("starts Friendly Captcha on direct submission in manual mode", async () => {
    const handle = { start: vi.fn(), reset: vi.fn() };
    sdk.createWidget.mockImplementation(
      ({ element }: { element: HTMLElement }) => {
        const field = document.createElement("input");
        field.name = "frc-captcha-response";
        element.appendChild(field);
        handle.start.mockImplementation(() => {
          field.value = "friendly-token";
        });
        return handle;
      },
    );
    const element = form("friendly-captcha");
    element.querySelector<HTMLElement>("[data-captcha]")!.dataset.start =
      "none";
    await submit(element);
    expect(handle.start).toHaveBeenCalled();
    expect(token(element, "frc-captcha-response")).toBe("friendly-token");
  });
});

describe("headless captcha loading", () => {
  it("waits for hCaptcha's SDK callback rather than just the script load event", async () => {
    const api = host.hcaptcha;
    delete window.hcaptcha;
    let complete = false;
    const loading = loadHcaptcha().then(() => {
      complete = true;
    });
    const script = document.querySelector("script")!;
    expect(script.src).toContain("recaptchacompat=off");
    script.dispatchEvent(new Event("load"));
    host.hcaptcha = api;
    await flush();
    expect(complete).toBe(false);
    window.__freeformHcaptchaReady!();
    await loading;
    expect(complete).toBe(true);
  });
  it("keeps Friendly Captcha tokens and reset behavior separate across forms", async () => {
    const handles: {
      reset: ReturnType<typeof vi.fn>;
      destroy: ReturnType<typeof vi.fn>;
      isDestroyed: boolean;
    }[] = [];
    sdk.createWidget.mockImplementation(
      ({ element, sitekey }: { element: HTMLElement; sitekey: string }) => {
        const input = document.createElement("input");
        input.name = "frc-captcha-response";
        input.value = `${sitekey}-token`;
        element.appendChild(input);
        const handle = { reset: vi.fn(), destroy: vi.fn(), isDestroyed: false };
        handles.push(handle);
        return handle;
      },
    );
    const extension = createFriendlyCaptchaExtension();
    const first = {
        provider: "friendly-captcha",
        name: "frc-captcha-response",
        siteKey: "first",
      },
      second = {
        provider: "friendly-captcha",
        name: "frc-captcha-response",
        siteKey: "second",
      };
    const firstManifest = { security: { captchas: [first] } },
      secondManifest = { security: { captchas: [second] } };
    await extension.mountCaptcha!({
      captcha: first,
      manifest: firstManifest,
      element: document.createElement("div"),
    } as never);
    await extension.mountCaptcha!({
      captcha: second,
      manifest: secondManifest,
      element: document.createElement("div"),
    } as never);
    const setCaptchaToken = vi.fn();
    await extension.buildPayload!({
      manifest: firstManifest,
      setCaptchaToken,
    } as never);
    expect(setCaptchaToken).toHaveBeenLastCalledWith(first.name, "first-token");
    await extension.afterSubmit!({ manifest: firstManifest } as never);
    expect(handles[0].reset).toHaveBeenCalledOnce();
    expect(handles[1].reset).not.toHaveBeenCalled();
    await extension.buildPayload!({
      manifest: secondManifest,
      setCaptchaToken,
    } as never);
    expect(setCaptchaToken).toHaveBeenLastCalledWith(
      second.name,
      "second-token",
    );
    await extension.destroy!();
  });
  it("does not resolve an existing loading script until it actually loads", async () => {
    const script = document.createElement("script");
    script.id = "existing-pending";
    document.head.appendChild(script);
    let complete = false;
    const loading = loadScriptOnce(
      "https://example.test/api.js",
      script.id,
    ).then(() => {
      complete = true;
    });
    await flush();
    expect(complete).toBe(false);
    script.dispatchEvent(new Event("load"));
    await loading;
    expect(complete).toBe(true);
  });
  it("retries after a timed-out load and carries the CSP nonce", async () => {
    vi.useFakeTimers();
    const source = document.createElement("script");
    source.nonce = "qa-nonce";
    document.head.appendChild(source);
    const loading = loadScriptOnce(
      "https://example.test/api.js",
      "timeout-script",
    );
    const rejected = expect(loading).rejects.toThrow("Failed to load");
    await vi.advanceTimersByTimeAsync(10000);
    await rejected;
    const retry = loadScriptOnce(
      "https://example.test/api.js",
      "timeout-script",
    );
    const script = document.getElementById(
      "timeout-script",
    ) as HTMLScriptElement;
    expect(script.nonce).toBe("qa-nonce");
    script.dispatchEvent(new Event("load"));
    await retry;
  });
  it.each(["hcaptcha", "turnstile"])(
    "keeps %s tokens separate across forms",
    async (provider) => {
      const api = provider === "hcaptcha" ? host.hcaptcha : host.turnstile;
      const extension =
        provider === "hcaptcha"
          ? createHcaptchaExtension()
          : createTurnstileExtension();
      const first = {
        provider,
        name:
          provider === "hcaptcha"
            ? "h-captcha-response"
            : "cf-turnstile-response",
        siteKey: "one",
        version: "checkbox",
        locale: "fr",
      };
      const second = { ...first, siteKey: "two" };
      const firstManifest = { security: { captchas: [first] } },
        secondManifest = { security: { captchas: [second] } };
      const mount = (captcha: typeof first, manifest: unknown) =>
        extension.mountCaptcha!({
          captcha,
          manifest,
          element: document.createElement("div"),
        } as never);
      const pending = mount(first, firstManifest);
      completeLoad();
      await pending;
      await mount(second, secondManifest);
      (api.render.mock.calls[0][1].callback as (token: string) => void)(
        "first-token",
      );
      (api.render.mock.calls[1][1].callback as (token: string) => void)(
        "second-token",
      );
      const setCaptchaToken = vi.fn();
      await extension.buildPayload!({
        manifest: firstManifest,
        setCaptchaToken,
      } as never);
      expect(setCaptchaToken).toHaveBeenLastCalledWith(
        first.name,
        "first-token",
      );
      await extension.afterSubmit!({
        manifest: firstManifest,
        response: { success: false, status: "error" },
      } as never);
      expect(api.reset).toHaveBeenCalledTimes(1);
      expect(api.reset).toHaveBeenCalledWith(0);
      await extension.buildPayload!({
        manifest: secondManifest,
        setCaptchaToken,
      } as never);
      expect(setCaptchaToken).toHaveBeenLastCalledWith(
        first.name,
        "second-token",
      );
      await extension.destroy!();
    },
  );
});
