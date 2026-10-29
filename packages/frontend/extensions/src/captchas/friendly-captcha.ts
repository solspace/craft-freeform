import {
  FRCWidgetCompleteEventName,
  FRCWidgetExpireEventName,
  FriendlyCaptchaSDK,
  type WidgetHandle,
} from "@friendlycaptcha/sdk";
import type {
  FreeformExtension,
  ManifestCaptchaSecurity,
} from "@solspace/freeform-core";
import { PACKAGE_VERSION } from "../version.js";
import { inferCaptchaProvider, waitForValue } from "./shared.js";

const FIELD_NAME = "frc-captcha-response";

type StartMode = "auto" | "focus" | "none";
type Theme = "light" | "dark" | "auto";

type FriendlyInstance = {
  element: HTMLElement;
  mount: HTMLElement;
  handle: WidgetHandle;
  captcha: ManifestCaptchaSecurity;
};

function getCaptchas(manifestCaptchas: ManifestCaptchaSecurity[] | undefined) {
  return (manifestCaptchas ?? []).filter(
    (captcha) => inferCaptchaProvider(captcha) === "friendly-captcha",
  );
}

let sdkSingleton: FriendlyCaptchaSDK | null = null;

function getSdk(apiEndpoint?: string | null): FriendlyCaptchaSDK {
  if (!sdkSingleton) {
    sdkSingleton = new FriendlyCaptchaSDK({
      apiEndpoint: apiEndpoint || "global",
    });
  }

  return sdkSingleton;
}

function fieldName(captcha: ManifestCaptchaSecurity): string {
  return captcha.name || FIELD_NAME;
}

function readToken(
  element: HTMLElement,
  captcha: ManifestCaptchaSecurity,
): string | undefined {
  const name = fieldName(captcha);
  const input = element.querySelector(
    `input[name="${name}"]`,
  ) as HTMLInputElement | null;
  const value = input?.value;
  return value && !value.startsWith(".") ? value : undefined;
}

function destroyInstance(instance: FriendlyInstance | undefined): void {
  if (!instance) {
    return;
  }

  try {
    if (!instance.handle.isDestroyed) {
      instance.handle.destroy();
    }
  } catch {
    /* ignore */
  }
}

export function createFriendlyCaptchaExtension(): FreeformExtension {
  const instances = new Map<ManifestCaptchaSecurity, FriendlyInstance>();
  const tokens = new Map<ManifestCaptchaSecurity, string>();

  return {
    name: "captcha.friendly-captcha",
    version: PACKAGE_VERSION,

    async mountCaptcha({ captcha, element }) {
      if (inferCaptchaProvider(captcha) !== "friendly-captcha") {
        return;
      }

      if (!captcha.siteKey) {
        throw new Error(
          "Friendly Captcha site key is missing from the form manifest.",
        );
      }

      const existing = instances.get(captcha);
      if (
        existing &&
        !existing.handle.isDestroyed &&
        existing.element === element &&
        element.contains(existing.mount)
      ) {
        return () => {
          destroyInstance(instances.get(captcha));
          instances.delete(captcha);
          tokens.delete(captcha);
          element.replaceChildren();
        };
      }

      destroyInstance(existing);
      instances.delete(captcha);

      element.replaceChildren();
      const mount = document.createElement("div");
      mount.className = "ff-frc-mount frc-captcha";
      element.appendChild(mount);

      const sdk = getSdk(captcha.apiEndpoint);
      const handle = sdk.createWidget({
        element: mount,
        sitekey: captcha.siteKey,
        formFieldName: fieldName(captcha),
        startMode: (captcha.startMode as StartMode | undefined) || "focus",
        theme: (captcha.theme as Theme | undefined) || "auto",
        apiEndpoint:
          (captcha.apiEndpoint as "global" | "eu" | undefined) || "global",
        ...(captcha.locale ? { language: captcha.locale } : {}),
      });

      const onComplete = () => {
        const value = readToken(element, captcha);
        if (value) {
          tokens.set(captcha, value);
        }
      };

      const onExpire = () => {
        tokens.delete(captcha);
        try {
          if (!handle.isDestroyed) {
            handle.reset();
          }
        } catch {
          /* Widget may be destroyed */
        }
      };

      mount.addEventListener(FRCWidgetCompleteEventName, onComplete);
      mount.addEventListener(FRCWidgetExpireEventName, onExpire);

      instances.set(captcha, { element, mount, handle, captcha });

      return () => {
        mount.removeEventListener(FRCWidgetCompleteEventName, onComplete);
        mount.removeEventListener(FRCWidgetExpireEventName, onExpire);
        destroyInstance(instances.get(captcha));
        instances.delete(captcha);
        tokens.delete(captcha);
        if (element.isConnected) {
          element.replaceChildren();
        }
      };
    },

    async beforeSubmit({ manifest, intent }) {
      if (intent === "back" || intent === "validate") {
        return;
      }

      for (const captcha of getCaptchas(manifest.security.captchas)) {
        const instance = instances.get(captcha);
        if (!instance || instance.handle.isDestroyed) {
          continue;
        }

        const existing =
          readToken(instance.element, captcha) || tokens.get(captcha);
        if (existing) {
          tokens.set(captcha, existing);
          continue;
        }

        try {
          instance.handle.start();
        } catch {
          /* Widget may already be solving */
        }

        try {
          const value = await waitForValue(
            () => readToken(instance.element, captcha) || tokens.get(captcha),
            12000,
          );
          tokens.set(captcha, value);
        } catch {
          throw new Error(
            "Friendly Captcha is not ready. Complete the captcha widget, then submit again.",
          );
        }
      }
    },

    async buildPayload({ setCaptchaToken, manifest }) {
      for (const captcha of getCaptchas(manifest.security.captchas)) {
        const instance = instances.get(captcha);
        const value =
          tokens.get(captcha) ||
          (instance ? readToken(instance.element, captcha) : undefined);
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
        try {
          if (!instance.handle.isDestroyed) {
            instance.handle.reset();
          }
        } catch {
          /* ignore */
        }
      }
    },

    async destroy() {
      for (const [name, instance] of instances) {
        destroyInstance(instance);
        instances.delete(name);
      }
      tokens.clear();
    },
  };
}

export const friendlyCaptchaExtension = createFriendlyCaptchaExtension();
