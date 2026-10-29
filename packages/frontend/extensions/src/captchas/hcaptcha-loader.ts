import { captchaScriptUrl } from "./script-url.js";

export type HcaptchaApi = {
  render(
    element: HTMLElement,
    options: Record<string, unknown>,
  ): string | number;
  reset(widgetId?: string | number): void;
  getResponse(widgetId?: string | number): string;
  execute(widgetId?: string | number): unknown;
};

declare global {
  interface Window {
    hcaptcha?: HcaptchaApi;
    __freeformHcaptchaLoad?: Promise<HcaptchaApi>;
    __freeformHcaptchaReady?: () => void;
  }
}

/** hCaptcha's script load event can fire before its SDK is ready to render. */
export function loadHcaptcha(): Promise<HcaptchaApi> {
  if (window.__freeformHcaptchaLoad) return window.__freeformHcaptchaLoad;
  if (typeof window.hcaptcha?.render === "function")
    return Promise.resolve(window.hcaptcha);
  const promise = new Promise<HcaptchaApi>((resolve, reject) => {
    const script = document.createElement("script");
    const cleanup = () => {
      window.clearTimeout(timeout);
      script.removeEventListener("error", failed);
      delete window.__freeformHcaptchaReady;
    };
    const failed = () => {
      cleanup();
      script.remove();
      reject(new Error("hCaptcha could not be loaded."));
    };
    const timeout = window.setTimeout(failed, 10000);
    window.__freeformHcaptchaReady = () => {
      if (typeof window.hcaptcha?.render !== "function") {
        failed();
        return;
      }
      cleanup();
      resolve(window.hcaptcha);
    };
    script.addEventListener("error", failed);
    try {
      script.src = captchaScriptUrl(
        "https://js.hcaptcha.com/1/api.js?render=explicit&recaptchacompat=off&onload=__freeformHcaptchaReady",
      );
      script.async = true;
      script.defer = true;
      const nonce =
        document.querySelector<HTMLScriptElement>("script[nonce]")?.nonce;
      if (nonce) script.nonce = nonce;
      document.head.appendChild(script);
    } catch {
      failed();
    }
  });
  window.__freeformHcaptchaLoad = promise;
  void promise.catch(() => {
    if (window.__freeformHcaptchaLoad === promise)
      delete window.__freeformHcaptchaLoad;
  });
  return promise;
}
