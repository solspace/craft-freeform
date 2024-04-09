const scriptId = 'recaptcha-script';
const url = 'https://www.google.com/recaptcha/api.js';

export enum Theme {
  DARK = 'dark',
  LIGHT = 'light',
}

export enum Size {
  COMPACT = 'compact',
  NORMAL = 'normal',
}

export enum Version {
  V2_CHECKBOX = 'v2-checkbox',
  V2_INVISIBLE = 'v2-invisible',
  V3 = 'v3',
}

export type reCaptchaConfig = {
  sitekey: string;
  theme?: Theme;
  size?: Size;
  version?: Version;
  lazyLoad?: boolean;
  action?: string;
  locale?: string;
};

const scriptLoadChainMap = new Map<string, () => Promise<void>>();

export const loadReCaptcha = (form: HTMLFormElement, forceLoad?: boolean): Promise<void> => {
  const container = getRecaptchaContainer(form);
  if (!container) {
    return;
  }

  const { sitekey, lazyLoad = false, version = Version.V2_CHECKBOX, locale } = readConfig(container);
  const isLazy = lazyLoad && !forceLoad;

  const loadScript = () =>
    new Promise<void>((resolve, reject) => {
      const existingScript = document.querySelector(`#${scriptId}`);
      if (existingScript) {
        resolve();
        return;
      }

      const scriptUrl = new URL(url);
      switch (version) {
        case Version.V3:
          scriptUrl.searchParams.append('render', sitekey);
          break;

        default:
          scriptUrl.searchParams.append('render', 'explicit');
          break;
      }

      if (locale) {
        scriptUrl.searchParams.append('hl', locale);
      }

      const script = document.createElement('script');
      script.src = String(scriptUrl);
      script.async = true;
      script.defer = true;
      script.id = scriptId;
      script.addEventListener('load', () => resolve());
      script.addEventListener('error', () => reject(new Error(`Error loading script ${scriptUrl}`)));

      document.body.appendChild(script);
    });

  if (isLazy) {
    const loaderChainPromise = new Promise<void>((resolve, reject) => {
      const handleChange = () => {
        form.removeEventListener('input', handleChange);
        return loadScript()
          .then(() => {
            resolve();
          })
          .catch(reject);
      };

      form.addEventListener('input', handleChange);
      scriptLoadChainMap.set(version, handleChange);
    });

    return loaderChainPromise;
  }

  if (scriptLoadChainMap.has(version)) {
    const chainScript = scriptLoadChainMap.get(version);
    scriptLoadChainMap.delete(version);

    return chainScript();
  }

  return loadScript();
};

export const getRecaptchaContainer = (form: HTMLFormElement): HTMLElement | null =>
  form.querySelector<HTMLElement>('[data-captcha="recaptcha"]');

export const readConfig = (element: HTMLElement): reCaptchaConfig => {
  return {
    sitekey: element.dataset.siteKey || '',
    theme: (element.dataset.theme as Theme) || Theme.LIGHT,
    size: (element.dataset.size as Size) || Size.NORMAL,
    version: (element.dataset.version as Version) || Version.V2_CHECKBOX,
    lazyLoad: element.dataset.lazyLoad !== undefined,
    action: element.dataset.action || 'submit',
    locale: element.dataset.locale,
  };
};
