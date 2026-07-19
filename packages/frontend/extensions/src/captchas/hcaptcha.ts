import type {
  FreeformExtension,
  ManifestCaptchaSecurity,
} from "@solspace/freeform-core";
import {
  inferCaptchaProvider,
  loadScriptOnce,
  waitForValue,
} from "./shared.js";

type HcaptchaApi = {
  render: (
    element: HTMLElement,
    options: Record<string, unknown>,
  ) => string | number;
  reset: (widgetId?: string | number) => void;
  getResponse: (widgetId?: string | number) => string;
  execute: (widgetId?: string | number) => void;
};

declare global {
  interface Window {
    hcaptcha?: HcaptchaApi;
  }
}

type HcaptchaInstance = {
  widgetId: string | number;
  element: HTMLElement;
  captcha: ManifestCaptchaSecurity;
};

function getCaptchas(manifestCaptchas: ManifestCaptchaSecurity[] | undefined) {
  return (manifestCaptchas ?? []).filter(
    (captcha) => inferCaptchaProvider(captcha) === "hcaptcha",
  );
}

async function ensureHcaptcha(): Promise<HcaptchaApi> {
  await loadScriptOnce(
    "https://js.hcaptcha.com/1/api.js?render=explicit",
    "ff-hcaptcha-script",
  );

  if (!window.hcaptcha) {
    throw new Error("hCaptcha failed to initialize.");
  }

  return window.hcaptcha;
}

export function createHcaptchaExtension(): FreeformExtension {
  const instances = new Map<string, HcaptchaInstance>();
  const tokens = new Map<string, string>();

  return {
    name: "captcha.hcaptcha",
    version: "0.1.0-beta.1",

    async mountCaptcha({ captcha, element }) {
      if (inferCaptchaProvider(captcha) !== "hcaptcha") {
        return;
      }

      if (!captcha.siteKey) {
        throw new Error("hCaptcha site key is missing from the form manifest.");
      }

      const api = await ensureHcaptcha();
      element.replaceChildren();
      const widget = document.createElement("div");
      element.appendChild(widget);

      const version = captcha.version ?? "checkbox";
      const widgetId = api.render(widget, {
        sitekey: captcha.siteKey,
        theme: captcha.theme ?? "light",
        size:
          version === "invisible" ? "invisible" : (captcha.size ?? "normal"),
        callback: (value: string) => {
          tokens.set(captcha.name, value);
        },
        "expired-callback": () => {
          tokens.delete(captcha.name);
        },
      });

      instances.set(captcha.name, { widgetId, element, captcha });

      return () => {
        instances.delete(captcha.name);
        tokens.delete(captcha.name);
        element.replaceChildren();
      };
    },

    async beforeSubmit({ manifest, intent }) {
      if (intent === "back") {
        return;
      }

      const captchas = getCaptchas(manifest.security.captchas);
      if (captchas.length === 0) {
        return;
      }

      const api = await ensureHcaptcha();
      for (const captcha of captchas) {
        const instance = instances.get(captcha.name);
        if (!instance) {
          continue;
        }

        if ((captcha.version ?? "checkbox") === "invisible") {
          api.execute(instance.widgetId);
        }

        const value =
          tokens.get(captcha.name) ||
          api.getResponse(instance.widgetId) ||
          (await waitForValue(() => api.getResponse(instance.widgetId)));
        tokens.set(captcha.name, value);
      }
    },

    async buildPayload({ setCaptchaToken, manifest }) {
      for (const captcha of getCaptchas(manifest.security.captchas)) {
        const value = tokens.get(captcha.name);
        if (value) {
          setCaptchaToken(captcha.name, value);
        }
      }
    },

    async afterSubmit() {
      tokens.clear();
      for (const instance of instances.values()) {
        window.hcaptcha?.reset(instance.widgetId);
      }
    },

    async destroy() {
      instances.clear();
      tokens.clear();
    },
  };
}

export const hcaptchaExtension = createHcaptchaExtension();
