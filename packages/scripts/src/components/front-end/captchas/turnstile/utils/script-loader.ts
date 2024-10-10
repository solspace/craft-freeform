import { getCaptchaContainer, loadCaptchaScript, readCaptchaConfig } from '../../common.script-loader';

const scriptUrl = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
const TYPE = 'turnstile';

export enum Version {
  V0 = 'v0',
}

export const loadCaptcha = (form: HTMLFormElement, forceLoad?: boolean): Promise<void> => {
  const container = getContainer(form);
  if (!container) {
    return Promise.resolve();
  }

  const url = new URL(scriptUrl);
  url.searchParams.append('render', 'explicit');

  return loadCaptchaScript(url, TYPE, form, forceLoad);
};

export const getContainer = (form: HTMLFormElement) => getCaptchaContainer(TYPE, form);
export const readConfig = (container: HTMLElement) => readCaptchaConfig<Version>(container);
