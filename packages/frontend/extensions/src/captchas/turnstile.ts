import type {
  FreeformExtension,
  ManifestCaptchaSecurity,
} from "@solspace/freeform-core";
import { PACKAGE_VERSION } from "../version.js";
import {
  inferCaptchaProvider,
  loadScriptOnce,
  waitForValue,
} from "./shared.js";

type TurnstileApi = {
  render: (
    element: HTMLElement,
    options: Record<string, unknown>,
  ) => string | number;
  reset: (widgetId?: string | number) => void;
  getResponse?: (widgetId?: string | number) => string;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

type TurnstileInstance = {
  widgetId: string | number;
  element: HTMLElement;
  captcha: ManifestCaptchaSecurity;
};

function getCaptchas(manifestCaptchas: ManifestCaptchaSecurity[] | undefined) {
  return (manifestCaptchas ?? []).filter(
    (captcha) => inferCaptchaProvider(captcha) === "turnstile",
  );
}

async function ensureTurnstile(): Promise<TurnstileApi> {
  if (typeof window.turnstile?.render === "function") return window.turnstile;
  await loadScriptOnce(
    "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit",
    "ff-turnstile-script",
  );

  if (!window.turnstile) {
    throw new Error("Cloudflare Turnstile failed to initialize.");
  }

  return window.turnstile;
}

export function createTurnstileExtension(): FreeformExtension {
  const instances = new Map<ManifestCaptchaSecurity, TurnstileInstance>();
  const tokens = new Map<ManifestCaptchaSecurity, string>();

  return {
    name: "captcha.turnstile",
    version: PACKAGE_VERSION,

    async mountCaptcha({ captcha, element }) {
      if (inferCaptchaProvider(captcha) !== "turnstile") {
        return;
      }

      if (!captcha.siteKey) {
        throw new Error(
          "Turnstile site key is missing from the form manifest.",
        );
      }

      const api = await ensureTurnstile();
      element.replaceChildren();
      const widget = document.createElement("div");
      element.appendChild(widget);

      const widgetId = api.render(widget, {
        sitekey: captcha.siteKey,
        theme: captcha.theme ?? "auto",
        size: captcha.size ?? "normal",
        action: captcha.action ?? undefined,
        language: captcha.locale || undefined,
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
      // Hydrate / soft validate must not wait on captcha widgets.
      if (intent === "back" || intent === "validate") {
        return;
      }

      const captchas = getCaptchas(manifest.security.captchas);
      if (captchas.length === 0) {
        return;
      }

      const api = await ensureTurnstile();
      for (const captcha of captchas) {
        const instance = instances.get(captcha);
        if (!instance) {
          continue;
        }

        const existing =
          tokens.get(captcha) ||
          api.getResponse?.(instance.widgetId) ||
          (
            instance.element.querySelector(
              '[name="cf-turnstile-response"]',
            ) as HTMLInputElement | null
          )?.value;

        if (existing) {
          tokens.set(captcha, existing);
          continue;
        }

        const value = await waitForValue(
          () =>
            api.getResponse?.(instance.widgetId) ||
            (
              instance.element.querySelector(
                '[name="cf-turnstile-response"]',
              ) as HTMLInputElement | null
            )?.value,
        );
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
        if (instance) window.turnstile?.reset(instance.widgetId);
      }
    },

    async destroy() {
      instances.clear();
      tokens.clear();
    },
  };
}

export const turnstileExtension = createTurnstileExtension();
