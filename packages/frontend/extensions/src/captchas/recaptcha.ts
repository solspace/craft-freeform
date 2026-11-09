import type {
  FreeformExtension,
  ManifestCaptchaSecurity,
} from "@solspace/freeform-core";
import { PACKAGE_VERSION } from "../version.js";
import {
  loadRecaptcha,
  type RecaptchaApi,
  withRecaptchaTimeout,
} from "./recaptcha-loader.js";
import { inferCaptchaProvider, waitForValue } from "./shared.js";

type RecaptchaVersion = "v2-checkbox" | "v2-invisible" | "v3";

type RecaptchaInstance = {
  widgetId?: number;
  element: HTMLElement;
  captcha: ManifestCaptchaSecurity;
  version: RecaptchaVersion;
};

function getCaptchas(manifestCaptchas: ManifestCaptchaSecurity[] | undefined) {
  return (manifestCaptchas ?? []).filter(
    (captcha) =>
      inferCaptchaProvider(captcha) === "recaptcha" &&
      captcha.frontendMode !== "external",
  );
}

function resolveVersion(captcha: ManifestCaptchaSecurity): RecaptchaVersion {
  const version = captcha.version ?? "v2-checkbox";
  if (
    version === "v3" ||
    version === "v2-invisible" ||
    version === "v2-checkbox"
  ) {
    return version;
  }
  return "v2-checkbox";
}

async function ensureRecaptcha(
  captcha: ManifestCaptchaSecurity,
): Promise<RecaptchaApi> {
  return loadRecaptcha({
    siteKey: captcha.siteKey || "",
    version: resolveVersion(captcha),
    verificationMode: captcha.verificationMode,
    scriptDomain: captcha.scriptDomain,
    locale: captcha.locale,
  });
}

export function createRecaptchaExtension(): FreeformExtension {
  const instances = new Map<ManifestCaptchaSecurity, RecaptchaInstance>();
  const tokens = new Map<ManifestCaptchaSecurity, string>();

  return {
    name: "captcha.recaptcha",
    version: PACKAGE_VERSION,

    async mountCaptcha({ captcha, element }) {
      if (
        inferCaptchaProvider(captcha) !== "recaptcha" ||
        captcha.frontendMode === "external"
      ) {
        return;
      }

      if (!captcha.siteKey) {
        throw new Error(
          "reCAPTCHA site key is missing from the form manifest.",
        );
      }

      const version = resolveVersion(captcha);
      element.replaceChildren();
      element.dataset.ffCaptchaVersion = version;
      element.dataset.ffCaptchaSitekey = captcha.siteKey;
      element.dataset.ffCaptchaAction = captcha.action || "submit";

      // Score-based v3 has no visible widget — token is fetched on submit.
      if (version === "v3") {
        await ensureRecaptcha(captcha);
        instances.set(captcha, { element, captcha, version });
        return () => {
          instances.delete(captcha);
          tokens.delete(captcha);
          element.replaceChildren();
        };
      }

      const api = await ensureRecaptcha(captcha);
      const widget = document.createElement("div");
      widget.className = "g-recaptcha";
      element.appendChild(widget);

      const widgetId = api.render(widget, {
        sitekey: captcha.siteKey,
        theme: captcha.theme ?? "light",
        size:
          version === "v2-invisible" ? "invisible" : (captcha.size ?? "normal"),
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

      instances.set(captcha, { widgetId, element, captcha, version });

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

      for (const captcha of getCaptchas(manifest.security.captchas)) {
        tokens.delete(captcha);
        const version = resolveVersion(captcha);
        const api = await ensureRecaptcha(captcha);
        const instance = instances.get(captcha);

        if (version === "v3") {
          if (!captcha.siteKey) {
            throw new Error(
              "reCAPTCHA site key is missing from the form manifest.",
            );
          }

          const result = await withRecaptchaTimeout(
            new Promise<string>((resolve, reject) => {
              api.ready(async () => {
                try {
                  const token = await api.execute(captcha.siteKey!, {
                    action: captcha.action || "submit",
                  });
                  resolve(typeof token === "string" ? token : "");
                } catch (error) {
                  reject(error);
                }
              });
            }),
          );

          if (!result) {
            throw new Error(
              "reCAPTCHA v3 did not return a token. Check that the Freeform integration version matches the Google key type (Score Based / v3).",
            );
          }

          tokens.set(captcha, result);
          continue;
        }

        if (!instance || instance.widgetId === undefined) {
          continue;
        }

        if (version === "v2-invisible") {
          await new Promise<void>((resolve, reject) => {
            try {
              Promise.resolve(api.execute(instance.widgetId!)).catch(reject);
              void waitForValue(() => api.getResponse(instance.widgetId)).then(
                (value) => {
                  tokens.set(captcha, value);
                  resolve();
                },
                reject,
              );
            } catch (error) {
              reject(error);
            }
          });
          continue;
        }

        const value =
          tokens.get(captcha) ||
          api.getResponse(instance.widgetId) ||
          (await waitForValue(() => api.getResponse(instance.widgetId)));
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
        if (!instance) continue;
        if (instance.widgetId !== undefined) {
          const api = await ensureRecaptcha(instance.captcha);
          api.reset(instance.widgetId);
        }
      }
    },

    async destroy() {
      instances.clear();
      tokens.clear();
    },
  };
}

export const recaptchaExtension = createRecaptchaExtension();
