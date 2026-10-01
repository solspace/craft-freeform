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

    const existingNode = document.getElementById(id);
    if (existingNode) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.id = id;
    script.src = src;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () =>
      reject(new Error(`Failed to load captcha script: ${src}`));
    document.head.appendChild(script);
  });

  loadedScripts.set(id, { promise });
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
