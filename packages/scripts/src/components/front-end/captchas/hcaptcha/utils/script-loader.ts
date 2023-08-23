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
};

export const loadHCaptcha = (form: HTMLFormElement, config: hCaptchaConfig): Promise<void> => {
  const { lazyLoad = false } = config;

  const loadScript = () =>
    new Promise<void>((resolve, reject) => {
      const existingScript = document.querySelector(`#${scriptId}`);

      if (existingScript) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = url;
      script.async = true;
      script.defer = true;
      script.id = scriptId;
      script.addEventListener('load', () => resolve());
      script.addEventListener('error', () => reject(new Error(`Error loading script ${url}`)));

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
