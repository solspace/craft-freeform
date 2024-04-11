import { getCaptchaContainer, loadCaptchaScript, readCaptchaConfig } from '../../common.script-loader';

const scriptUrl = 'https://www.google.com/recaptcha/api.js';
const TYPE = 'recaptcha';

export enum Version {
  V2_CHECKBOX = 'v2-checkbox',
  V2_INVISIBLE = 'v2-invisible',
  V3 = 'v3',
}

export const loadReCaptcha = (form: HTMLFormElement, forceLoad?: boolean): Promise<void> => {
  const container = getContainer(form);
  if (!container) {
    return Promise.resolve();
  }

  const { version, sitekey, locale } = readConfig(container);

  const url = new URL(scriptUrl);
  switch (version) {
    case Version.V3:
      url.searchParams.append('render', sitekey);
      break;

    default:
      url.searchParams.append('render', 'explicit');
      break;
  }

  if (locale) {
    url.searchParams.append('hl', locale);
  }

  return loadCaptchaScript(url, TYPE, form, forceLoad);
};

export const getContainer = (form: HTMLFormElement) => getCaptchaContainer(TYPE, form);
export const readConfig = (container: HTMLElement) => readCaptchaConfig<Version>(container);
