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

export const loadReCaptcha = (form: HTMLFormElement, config: reCaptchaConfig): Promise<void> => {
  const { sitekey, lazyLoad = false, version = Version.V2_CHECKBOX, locale } = config;

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

  if (lazyLoad) {
    return new Promise<void>((resolve, reject) => {
      const handleChange = () => {
        form.removeEventListener('input', handleChange);
        loadScript()
          .then(() => resolve())
          .catch(reject);
      };

      form.addEventListener('input', handleChange);
    });
  }

  return loadScript();
};
