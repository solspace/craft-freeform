import { addListeners, removeListeners } from '@lib/plugin/helpers/event-handling';

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

const scriptLoaders = new Map<Version, Promise<void>>();

const loadScript = (
  resolve: () => void,
  reject: (reason: Error) => void,
  { sitekey, version, locale }: reCaptchaConfig
) => {
  if (document.getElementById(scriptId)) {
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
};

export const loadReCaptcha = (form: HTMLFormElement, forceLoad?: boolean): Promise<void> => {
  const container = getRecaptchaContainer(form);
  if (!container) {
    return;
  }

  const config = readConfig(container);
  const { lazyLoad = false, version = Version.V2_CHECKBOX } = config;
  const isLazy = lazyLoad && !forceLoad;

  if (scriptLoaders.has(version)) {
    return scriptLoaders.get(version);
  }

  const promise = new Promise<void>((resolve, reject) => {
    if (isLazy) {
      const handleChange = () => {
        removeListeners(form, 'input', handleChange);
        loadScript(resolve, reject, config);
      };

      addListeners(form, ['input', 'submit'], handleChange);
    } else {
      loadScript(resolve, reject, config);
    }
  });

  scriptLoaders.set(version, promise);

  return promise;
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
