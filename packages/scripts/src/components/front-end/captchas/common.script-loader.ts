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

    const existing = document.getElementById(id) as HTMLScriptElement | null;
    if (existing) {
      // Another form render already created this script tag. We need to resolve asap but only if it has actually finished loading otherwise we need to wait for its load event.
      if (existing.dataset.loaded === "true") {
        return resolve();
      }

      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () =>
        reject(new Error(`Error loading script ${url}`)),
      );

      return;
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
    script.addEventListener("load", () => {
      script.dataset.loaded = "true";

      resolve();
    });
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

  // The shared promise will call loadScript on page load. Every form of this type reuses the same promise and trigger.
  let sharedPromise: Promise<void>;
  if (!loaderPromises.has(loaderHash)) {
    sharedPromise = new Promise<void>((resolve, reject) => {
      const triggerLoadScript = () => {
        loadScript(url).then(resolve).catch(reject);
      };

      loaders.set(loaderHash, triggerLoadScript);
    });

    loaderPromises.set(loaderHash, sharedPromise);
  } else {
    sharedPromise = loaderPromises.get(loaderHash);
  }

  const triggerLoadScript = loaders.get(loaderHash);

  if (isLazy) {
    // The lazy promise will not call loadScript on page load. It only renders when the user interacts with the form.
    return new Promise<void>((resolve, reject) => {
      if (listeners.has(form)) {
        return;
      }

      addListeners(
        form,
        ["input"],
        () => {
          triggerLoadScript();

          sharedPromise.then(resolve).catch(reject);
        },
        { once: true },
      );

      // Prevent adding listeners multiple times to this form
      listeners.add(form);
    });
  }

  triggerLoadScript();

  return sharedPromise;
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

// Poll captcha until it has a token value or the timeout is reached. Resolves either way - if the token never appears, the server handles the missing token gracefully via the server validation checks.
export const waitForToken = (
  form: HTMLFormElement,
  fieldName: string,
): Promise<void> => {
  return new Promise<void>((resolve) => {
    let elapsed = 0;

    const poll = setInterval(() => {
      const tokenInput = form.querySelector<HTMLInputElement>(
        `[name="${fieldName}"]`,
      );

      if (tokenInput?.value) {
        clearInterval(poll);

        resolve();

        return;
      }

      elapsed += 100;

      if (elapsed >= 8000) {
        clearInterval(poll);

        resolve();
      }
    }, 100);
  });
};
