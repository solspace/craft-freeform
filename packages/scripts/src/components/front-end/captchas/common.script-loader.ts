import { addListeners, removeListeners } from '@lib/plugin/helpers/event-handling';

export enum Theme {
  DARK = 'dark',
  LIGHT = 'light',
}

export enum Size {
  COMPACT = 'compact',
  NORMAL = 'normal',
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

console.log('INITIALIZING SCRIPT');
const scriptLoaders = new Map<string, Promise<void>>();

const loadScript = (url: URL, resolve: () => void, reject: (reason: Error) => void) => {
  const id = String(url);
  if (document.getElementById(id)) {
    console.log('returning: script exists');
    return;
  }

  const script = document.createElement('script');
  script.src = String(url);
  script.async = true;
  script.defer = true;
  script.id = id;
  script.addEventListener('load', () => {
    console.log('captcha loaded callback');
    resolve();
  });
  script.addEventListener('error', () => reject(new Error(`Error loading script ${url}`)));

  document.body.appendChild(script);
};

export const loadCaptchaScript = (
  url: URL,
  type: string,
  form: HTMLFormElement,
  forceLoad?: boolean
): Promise<void> => {
  const container = getCaptchaContainer(type, form);
  if (!container) {
    return;
  }

  const config = readCaptchaConfig(container);
  const { lazyLoad = false, version = 'default' } = config;
  const isLazy = lazyLoad && !forceLoad;

  if (scriptLoaders.has(version)) {
    console.log('returning existing promise');
    return scriptLoaders.get(version);
  }

  const promise = new Promise<void>((resolve, reject) => {
    console.log('loading recaptcha');
    if (isLazy) {
      const handleChange = () => {
        console.log('executing lazy load');
        removeListeners(form, 'input', handleChange);
        loadScript(url, resolve, reject);
      };

      console.log('adding lazy load to inputs');
      addListeners(form, ['input', 'submit'], handleChange);
    } else {
      console.log('executing load directly');
      loadScript(url, resolve, reject);
    }
  });

  scriptLoaders.set(version, promise);

  console.log('returning promise');

  return promise;
};

export const getCaptchaContainer = (type: string, form: HTMLFormElement): HTMLElement | null =>
  form.querySelector<HTMLElement>(`[data-captcha="${type}"]`);

export const readCaptchaConfig = <V = string>(element: HTMLElement): CaptchaConfig<V> => {
  return {
    sitekey: element.dataset.siteKey || '',
    theme: (element.dataset.theme as Theme) || Theme.LIGHT,
    size: (element.dataset.size as Size) || Size.NORMAL,
    version: element.dataset.version as V,
    lazyLoad: element.dataset.lazyLoad !== undefined,
    action: element.dataset.action || 'submit',
    locale: element.dataset.locale,
  };
};
