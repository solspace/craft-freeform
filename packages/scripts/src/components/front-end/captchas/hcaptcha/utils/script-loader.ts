const scriptId = 'hcaptcha-script';
const url = 'https://js.hcaptcha.com/1/api.js?render=explicit';

export enum Theme {
  DARK = 'dark',
  LIGHT = 'light',
}

export enum Size {
  COMPACT = 'compact',
  NORMAL = 'normal',
}

export enum Version {
  CHECKBOX = 'checkbox',
  INVISIBLE = 'invisible',
}

export type hCaptchaConfig = {
  sitekey: string;
  theme?: Theme;
  size?: Size;
  version?: Version;
  lazyLoad?: boolean;
  action?: string;
  locale?: string;
};

const scriptLoadChainMap = new Map<string, () => Promise<void>>();

export const loadHCaptcha = (form: HTMLFormElement, forceLoad?: boolean): Promise<void> => {
  const container = getHcaptchaContainer(form);
  if (!container) {
    return Promise.resolve();
  }

  const { locale, version, lazyLoad = false } = readConfig(container);
  const isLazy = lazyLoad && !forceLoad;

  const loadScript = () =>
    new Promise<void>((resolve, reject) => {
      const existingScript = document.querySelector(`#${scriptId}`);
      if (existingScript) {
        resolve();
        return;
      }

      const scriptUrl = new URL(url);

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

export const getHcaptchaContainer = (form: HTMLFormElement): HTMLElement | null =>
  form.querySelector<HTMLElement>('[data-captcha="hcaptcha"]');

export const readConfig = (element: HTMLElement): hCaptchaConfig => {
  return {
    sitekey: element.dataset.siteKey || '',
    theme: (element.dataset.theme as Theme) || Theme.LIGHT,
    size: (element.dataset.size as Size) || Size.NORMAL,
    version: (element.dataset.version as Version) || Version.CHECKBOX,
    lazyLoad: element.dataset.lazyLoad !== undefined,
    action: element.dataset.action || 'submit',
    locale: element.dataset.locale,
  };
};
