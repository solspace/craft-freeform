import { captchaScriptUrl } from "./script-url.js";

export type CaptchaToken = {
  name: string;
  value: string;
};

export type LoadedScriptHandle = {
  promise: Promise<void>;
};

const loadedScripts = new Map<string, LoadedScriptHandle>();

export function loadScriptOnce(src: string, id: string): Promise<void> {
  const existing = loadedScripts.get(id);
  if (existing) {
    return existing.promise;
  }

  const promise = new Promise<void>((resolve, reject) => {
    if (typeof document === "undefined") {
      reject(new Error("Captcha scripts require a browser environment."));
      return;
    }
    let node = document.getElementById(id) as HTMLScriptElement | null;
    if (node?.dataset.loaded === "true") {
      resolve();
      return;
    }
    const existingNode = Boolean(node);
    node ??= document.createElement("script");
    const script = node;
    const cleanup = () => {
      window.clearTimeout(timeout);
      script.removeEventListener("load", loaded);
      script.removeEventListener("error", failed);
    };
    const loaded = () => {
      cleanup();
      script.dataset.loaded = "true";
      resolve();
    };
    const failed = () => {
      cleanup();
      script.remove();
      reject(new Error("Failed to load captcha script."));
    };
    const timeout = window.setTimeout(failed, 10000);
    script.addEventListener("load", loaded);
    script.addEventListener("error", failed);
    if (!existingNode) {
      try {
        script.id = id;
        script.src = captchaScriptUrl(src);
        script.async = true;
        script.defer = true;
        const nonce =
          document.querySelector<HTMLScriptElement>("script[nonce]")?.nonce;
        if (nonce) script.nonce = nonce;
        document.head.appendChild(script);
      } catch {
        failed();
      }
    }
  });

  loadedScripts.set(id, { promise });
  void promise.catch(() => {
    if (loadedScripts.get(id)?.promise === promise) loadedScripts.delete(id);
  });
  return promise;
}

export function waitForValue(
  read: () => string | null | undefined,
  timeoutMs = 8000,
  intervalMs = 100,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const started = Date.now();

    const tick = () => {
      const value = read();
      if (value) {
        resolve(value);
        return;
      }

      if (Date.now() - started >= timeoutMs) {
        reject(new Error("Timed out waiting for captcha token."));
        return;
      }

      window.setTimeout(tick, intervalMs);
    };

    tick();
  });
}

export function inferCaptchaProvider(captcha: {
  provider?: string;
  name?: string;
}): string | null {
  if (captcha.provider) {
    return captcha.provider;
  }

  switch (captcha.name) {
    case "cf-turnstile-response":
      return "turnstile";
    case "g-recaptcha-response":
      return "recaptcha";
    case "h-captcha-response":
      return "hcaptcha";
    case "frc-captcha-response":
      return "friendly-captcha";
    default:
      return null;
  }
}
