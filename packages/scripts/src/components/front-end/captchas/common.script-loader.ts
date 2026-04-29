import { addListeners } from "@lib/plugin/helpers/event-handling";

export enum Theme {
  DARK = "dark",
  LIGHT = "light",
}

export enum Size {
  COMPACT = "compact",
  NORMAL = "normal",
}

export type CaptchaConfig<V = string> = {
  sitekey: string;
  theme?: Theme;
  size?: Size;
  version?: V;
  lazyLoad?: boolean;
  action?: string;
  locale?: string;
};

type ScriptLoader = (url: URL) => Promise<void>;

/**
 * https://developer.mozilla.org/en-US/docs/Web/API/TrustedScriptURL
 *
 * Trusted Types policy for loading external captcha scripts in Safari.
 * Created lazily the first time it is needed and reused on subsequent calls.
 * When the browser does not support Trusted Types the policy stays null and the plain string assignment path is used instead.
 */
type TrustedTypes = Window & {
  trustedTypes?: {
    createPolicy(
      name: string,
      rules: {
        createScriptURL(input: string): string;
      },
    ): {
      createScriptURL(input: string): unknown;
    };
  };
};

let scriptPolicy: {
  createScriptURL(input: string): unknown;
} | null = null;

if (!window.freeform) {
  window.freeform = {};
}

if (!window.freeform?.captchas) {
  window.freeform.captchas = {
    loaders: new Map<string, () => void>(),
    listeners: new WeakSet<HTMLFormElement>(),
    loaderPromises: new Map<string, Promise<void>>(),
  };
}

const loadScript: ScriptLoader = (url) => {
  return new Promise<void>((resolve, reject) => {
    const id = String(url);
    if (document.getElementById(id)) {
      return resolve();
    }

    const script = document.createElement("script");

    /**
     * Browsers enforcing `require-trusted-types-for 'script'` throws a TypeError when a plain string is assigned to script.src in Safari.
     * So we create a named Trusted Types policy. Falls back to a direct string assignment when the Trusted Types API is unavailable or not Safari.
     */
    const { trustedTypes } = window as TrustedTypes;

    if (trustedTypes?.createPolicy) {
      if (!scriptPolicy) {
        try {
          scriptPolicy = trustedTypes.createPolicy("freeform#captcha-loader", {
            createScriptURL: (input: string) => input,
          });
        } catch {
          // A policy with this name already exists (created by another Freeform script on the same page).
        }
      }

      // @ts-expect-error - TrustedScriptURL is valid for script.src
      script.src = scriptPolicy
        ? scriptPolicy.createScriptURL(String(url))
        : String(url);
    } else {
      script.src = String(url);
    }

    script.async = true;
    script.defer = true;
    script.id = id;
    script.addEventListener("load", () => resolve());
    script.addEventListener("error", () =>
      reject(new Error(`Error loading script ${url}`)),
    );

    document.body.appendChild(script);
  });
};

export const loadCaptchaScript = (
  url: URL,
  type: string,
  form: HTMLFormElement,
  forceLoad?: boolean,
): Promise<void> => {
  const container = getCaptchaContainer(type, form);
  if (!container) {
    return;
  }

  const { listeners, loaderPromises, loaders } = window.freeform.captchas;

  const config = readCaptchaConfig(container);
  const { lazyLoad = false, version = "default" } = config;
  const isLazy = lazyLoad && !forceLoad;
  const loaderHash = `${type}-${version}`;

  let promise: Promise<void>;
  if (!loaderPromises.has(loaderHash)) {
    promise = new Promise<void>((resolve, reject) => {
      const handleChange = () => {
        loadScript(url).then(resolve).catch(reject);
      };

      // Store versioned lazy loader
      loaders.set(loaderHash, handleChange);
    });

    loaderPromises.set(loaderHash, promise);
  } else {
    promise = loaderPromises.get(loaderHash);
  }

  const versionedLazyLoader = loaders.get(loaderHash);
  if (isLazy) {
    if (!listeners.has(form)) {
      addListeners(form, ["input"], versionedLazyLoader, {
        once: true,
      });

      // Prevent adding listeners multiple times to this form
      listeners.add(form);
    }
  } else {
    versionedLazyLoader();
  }

  return promise;
};

export const getCaptchaContainer = (
  type: string,
  form: HTMLFormElement,
): HTMLElement | null =>
  form.querySelector<HTMLElement>(`[data-captcha="${type}"]`);

export const readCaptchaConfig = <V = string>(
  element: HTMLElement,
): CaptchaConfig<V> => ({
  sitekey: element.dataset.sitekey || "",
  theme: (element.dataset.theme as Theme) || Theme.LIGHT,
  size: (element.dataset.size as Size) || Size.NORMAL,
  version: element.dataset.version as V,
  lazyLoad: element.dataset.lazyLoad !== undefined,
  action: element.dataset.action || "submit",
  locale: element.dataset.locale,
});
