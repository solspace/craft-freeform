import { addListeners } from "@lib/plugin/helpers/event-handling";
import {
  getCaptchaContainer,
  readCaptchaConfig,
} from "../../common.script-loader";

const TYPE = "friendly-captcha";

/**
 * Friendly Captcha ships inside this bundle (no remote script). This mirrors the
 * lazy-load contract used by Turnstile so `data-lazy-load` still defers activation
 * until first interaction when configured.
 */
export const loadCaptcha = (
  form: HTMLFormElement,
  forceLoad?: boolean,
): Promise<void> => {
  const container = getCaptchaContainer(TYPE, form);
  if (!container) {
    return Promise.resolve();
  }

  const { listeners, loaderPromises, loaders } = window.freeform.captchas;

  const config = readCaptchaConfig(container);
  const { lazyLoad = false, version = "default" } = config;
  const isLazy = lazyLoad && !forceLoad;
  const loaderHash = `${TYPE}-${version}`;

  let promise: Promise<void>;
  if (!loaderPromises.has(loaderHash)) {
    promise = new Promise<void>((resolve, reject) => {
      const handleChange = () => {
        Promise.resolve().then(resolve).catch(reject);
      };

      loaders.set(loaderHash, handleChange);
    });

    loaderPromises.set(loaderHash, promise);
  } else {
    promise = loaderPromises.get(loaderHash)!;
  }

  const versionedLazyLoader = loaders.get(loaderHash)!;
  if (isLazy) {
    if (!listeners.has(form)) {
      addListeners(form, ["input"], versionedLazyLoader, {
        once: true,
      });

      listeners.add(form);
    }
  } else {
    versionedLazyLoader();
  }

  return promise;
};

export const getContainer = (form: HTMLFormElement) =>
  getCaptchaContainer(TYPE, form);

export type FriendlyCaptchaDatasetConfig = {
  sitekey: string;
  theme: string;
  startMode: string;
  lazyLoad: boolean;
  language?: string;
  apiEndpoint: string;
};

export const readFriendlyCaptchaConfig = (
  container: HTMLElement,
): FriendlyCaptchaDatasetConfig => ({
  sitekey: container.dataset.sitekey || "",
  theme: container.dataset.theme || "auto",
  startMode: container.dataset.start || "focus",
  lazyLoad: container.dataset.lazyLoad !== undefined,
  language: container.dataset.language,
  apiEndpoint: container.dataset.apiEndpoint || "global",
});
