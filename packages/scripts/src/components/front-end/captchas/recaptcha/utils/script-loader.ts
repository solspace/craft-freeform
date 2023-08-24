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
};

export const loadReCaptcha = (form: HTMLFormElement, config: reCaptchaConfig): Promise<void> => {
  const { sitekey, lazyLoad = false, version = Version.V2_CHECKBOX } = config;

  const loadScript = () =>
    new Promise<void>((resolve, reject) => {
      const existingScript = document.querySelector(`#${scriptId}`);

      if (existingScript) {
        resolve();
        return;
      }

      let scriptUrl = url;
      switch (version) {
        case Version.V3:
          scriptUrl += `?render=${sitekey}`;
          break;

        default:
          scriptUrl += '?render=explicit';
          break;
      }

      const script = document.createElement('script');
      script.src = scriptUrl;
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
