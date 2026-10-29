import { captchaScriptUrl } from "./script-url.js";

export type RecaptchaApi = {
  ready: (callback: () => void) => void;
  render: (element: HTMLElement, options: Record<string, unknown>) => number;
  reset: (widgetId?: number) => void;
  getResponse: (widgetId?: number) => string;
  execute: (
    keyOrId: string | number,
    options?: { action: string },
  ) => Promise<string> | undefined;
};
export type RecaptchaConfig = {
  siteKey: string;
  version?: string | null;
  verificationMode?: string;
  scriptDomain?: string;
  locale?: string;
};
type RecaptchaWindow = Window & {
  grecaptcha?: RecaptchaApi & { enterprise?: RecaptchaApi };
  __freeformRecaptchaLoads?: Map<string, Promise<RecaptchaApi>>;
};

export function withRecaptchaTimeout<T>(
  promise: PromiseLike<T>,
  timeoutMs = 10000,
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error("reCAPTCHA timed out. Please try again.")),
      timeoutMs,
    );
    Promise.resolve(promise)
      .then(resolve, reject)
      .finally(() => clearTimeout(timer));
  });
}

export function getRecaptchaApi(
  config: RecaptchaConfig,
): RecaptchaApi | undefined {
  const google = (window as RecaptchaWindow).grecaptcha;
  return config.verificationMode === "enterprise" ? google?.enterprise : google;
}

export function loadRecaptcha(config: RecaptchaConfig): Promise<RecaptchaApi> {
  const host = window as RecaptchaWindow;
  if (!config.siteKey)
    return Promise.reject(new Error("reCAPTCHA site key is missing."));
  const enterprise = config.verificationMode === "enterprise";
  const domain =
    config.scriptDomain === "recaptcha.net" ? "recaptcha.net" : "google.com";
  const url = new URL(
    `https://www.${domain}/recaptcha/${enterprise ? "enterprise" : "api"}.js`,
  );
  url.searchParams.set(
    "render",
    config.version === "v3" ? config.siteKey : "explicit",
  );
  if (config.locale) url.searchParams.set("hl", config.locale);
  url.searchParams.set("trustedtypes", "true");
  const key = url.href;
  host.__freeformRecaptchaLoads ??= new Map();
  const loads = host.__freeformRecaptchaLoads;
  const loading = loads.get(key);
  if (loading) return loading;

  const script = Array.from(document.scripts).find((node) => {
    try {
      const existing = new URL(node.src);
      return (
        existing.origin === url.origin &&
        existing.pathname === url.pathname &&
        existing.searchParams.get("render") ===
          url.searchParams.get("render") &&
        (existing.searchParams.get("hl") || "") === (config.locale || "")
      );
    } catch {
      return false;
    }
  });
  const node = script ?? document.createElement("script");
  const request = new Promise<RecaptchaApi>((resolve, reject) => {
    let settled = false;
    const cleanup = () => {
      clearTimeout(timer);
      node.removeEventListener("load", ready);
      node.removeEventListener("error", fail);
    };
    const fail = () => {
      if (settled) return;
      settled = true;
      cleanup();
      if (!script) node.remove();
      reject(new Error("reCAPTCHA could not load. Please try again."));
    };
    const ready = () => {
      const api = getRecaptchaApi(config);
      if (!api?.ready) {
        fail();
        return;
      }
      try {
        api.ready(() => {
          if (settled) return;
          settled = true;
          cleanup();
          node.dataset.freeformRecaptchaLoaded = "true";
          resolve(api);
        });
      } catch {
        fail();
      }
    };
    const timer = setTimeout(fail, 10000);
    node.addEventListener("load", ready);
    node.addEventListener("error", fail);
    if (script && getRecaptchaApi(config)?.ready) {
      ready();
    } else if (!script) {
      try {
        node.src = captchaScriptUrl(key);
        const nonce =
          document.querySelector<HTMLScriptElement>("script[nonce]")?.nonce;
        if (nonce) node.nonce = nonce;
        node.async = true;
        node.defer = true;
        document.head.appendChild(node);
      } catch {
        fail();
      }
    }
  });
  const result = request.catch((error) => {
    loads.delete(key);
    throw error;
  });
  loads.set(key, result);
  return result;
}
