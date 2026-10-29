import { addListeners } from "@lib/plugin/helpers/event-handling";
import { captchaScriptUrl } from "../../../../../frontend/extensions/src/captchas/script-url";

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

const loadScript: ScriptLoader = (url) =>
  new Promise<void>((resolve, reject) => {
    const id = String(url);
    let script = document.getElementById(id) as HTMLScriptElement | null;
    if (script?.dataset.loaded === "true") {
      resolve();
      return;
    }
    const existing = Boolean(script);
    script ??= document.createElement("script");
    const node = script;
    const cleanup = () => {
      clearTimeout(timeout);
      node.removeEventListener("load", loaded);
      node.removeEventListener("error", failed);
    };
    const loaded = () => {
      cleanup();
      node.dataset.loaded = "true";
      resolve();
    };
    const failed = () => {
      cleanup();
      node.remove();
      reject(new Error("The captcha script could not be loaded."));
    };
    const timeout = setTimeout(failed, 10000);
    node.addEventListener("load", loaded);
    node.addEventListener("error", failed);
    if (!existing) {
      try {
        node.src = captchaScriptUrl(id);
        node.id = id;
        node.async = true;
        node.defer = true;
        const nonce =
          document.querySelector<HTMLScriptElement>("script[nonce]")?.nonce;
        if (nonce) node.nonce = nonce;
        document.body.appendChild(node);
      } catch {
        failed();
      }
    }
  });

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
    void sharedPromise.catch(() => {
      if (loaderPromises.get(loaderHash) === sharedPromise) {
        loaderPromises.delete(loaderHash);
        loaders.delete(loaderHash);
      }
    });
  } else {
    sharedPromise = loaderPromises.get(loaderHash);
  }

  const triggerLoadScript = loaders.get(loaderHash);

  if (isLazy) {
    if (!listeners.has(form)) {
      addListeners(form, ["input"], triggerLoadScript, { once: true });
      listeners.add(form);
    }
  } else {
    triggerLoadScript();
  }
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

      if (
        tokenInput?.value &&
        (fieldName !== "frc-captcha-response" ||
          !tokenInput.value.startsWith("."))
      ) {
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
