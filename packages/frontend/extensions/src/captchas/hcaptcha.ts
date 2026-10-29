import type {
  FreeformExtension,
  ManifestCaptchaSecurity,
} from "@solspace/freeform-core";
import { PACKAGE_VERSION } from "../version.js";
import { loadHcaptcha } from "./hcaptcha-loader.js";
import { inferCaptchaProvider, waitForValue } from "./shared.js";

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

export function createHcaptchaExtension(): FreeformExtension {
  const instances = new Map<ManifestCaptchaSecurity, HcaptchaInstance>();
  const tokens = new Map<ManifestCaptchaSecurity, string>();

  return {
    name: "captcha.hcaptcha",
    version: PACKAGE_VERSION,

    async mountCaptcha({ captcha, element }) {
      if (inferCaptchaProvider(captcha) !== "hcaptcha") {
        return;
      }

      if (!captcha.siteKey) {
        throw new Error("hCaptcha site key is missing from the form manifest.");
      }

      const api = await loadHcaptcha();
      element.replaceChildren();
      const widget = document.createElement("div");
      element.appendChild(widget);

      const version = captcha.version ?? "checkbox";
      const widgetId = api.render(widget, {
        sitekey: captcha.siteKey,
        theme: captcha.theme ?? "light",
        hl: captcha.locale || undefined,
        size:
          version === "invisible" ? "invisible" : (captcha.size ?? "normal"),
        callback: (value: string) => {
          tokens.set(captcha, value);
        },
        "expired-callback": () => {
          tokens.delete(captcha);
        },
        "error-callback": () => {
          tokens.delete(captcha);
        },
      });

      instances.set(captcha, { widgetId, element, captcha });

      return () => {
        instances.delete(captcha);
        tokens.delete(captcha);
        element.replaceChildren();
      };
    },

    async beforeSubmit({ manifest, intent }) {
      if (intent === "back" || intent === "validate") {
        return;
      }

      const captchas = getCaptchas(manifest.security.captchas);
      if (captchas.length === 0) {
        return;
      }

      const api = await loadHcaptcha();
      for (const captcha of captchas) {
        const instance = instances.get(captcha);
        if (!instance) {
          continue;
        }

        if ((captcha.version ?? "checkbox") === "invisible") {
          await api.execute(instance.widgetId);
        }

        const value =
          tokens.get(captcha) ||
          api.getResponse(instance.widgetId) ||
          (await waitForValue(
            () => api.getResponse(instance.widgetId),
            captcha.version === "invisible" ? 120000 : 8000,
          ));
        tokens.set(captcha, value);
      }
    },

    async buildPayload({ setCaptchaToken, manifest }) {
      for (const captcha of getCaptchas(manifest.security.captchas)) {
        const value = tokens.get(captcha);
        if (value) {
          setCaptchaToken(captcha.name, value);
        }
      }
    },

    async afterSubmit({ manifest }) {
      for (const captcha of getCaptchas(manifest.security.captchas)) {
        tokens.delete(captcha);
        const instance = instances.get(captcha);
        if (instance) window.hcaptcha?.reset(instance.widgetId);
      }
    },

    async destroy() {
      instances.clear();
      tokens.clear();
    },
  };
}

export const hcaptchaExtension = createHcaptchaExtension();
