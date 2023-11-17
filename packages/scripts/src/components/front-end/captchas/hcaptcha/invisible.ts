import events from '@lib/plugin/constants/event-types';
import type { FreeformEvent } from 'types/events';

import type { hCaptchaConfig, Size, Theme, Version } from './utils/script-loader';
import { loadHCaptcha } from './utils/script-loader';

const form: HTMLFormElement = document.querySelector('form[data-id="{formAnchor}"]') as HTMLFormElement;
const config: hCaptchaConfig = {
  sitekey: '{siteKey}',
  theme: '{theme}' as Theme,
  size: '{size}' as Size,
  lazyLoad: Boolean('{lazyLoad}'),
  version: '{version}' as Version,
} as const;

const createCaptcha = (event: FreeformEvent): HTMLDivElement => {
  const id = `${event.freeform.id}-hcaptcha-invisible`;

  let recaptchaElement = document.getElementById(id) as HTMLDivElement;
  if (!recaptchaElement) {
    recaptchaElement = document.createElement('div');
    recaptchaElement.id = id;
    event.form.appendChild(recaptchaElement);
  }

  return recaptchaElement;
};

let isTokenSet = false;
let captchaId: string;

const initHCaptchaInvisible = (event: FreeformEvent): void => {
  const { sitekey } = config;

  loadHCaptcha(event.form, config).then(() => {
    const hcaptchaElement = createCaptcha(event);

    captchaId = hcaptcha.render(hcaptchaElement, {
      sitekey,
      size: 'invisible',
      callback: (token: string) => {
        isTokenSet = true;
        hcaptchaElement.querySelector<HTMLInputElement>('*[name="h-captcha-response"]').value = token;
        event.freeform.triggerResubmit();
      },
    });
  });
};

form.addEventListener(events.form.ready, initHCaptchaInvisible);

form.addEventListener(events.form.submit, async (event: FreeformEvent) => {
  if (isTokenSet) {
    return;
  }

  event.preventDefault();
  hcaptcha.execute(captchaId);
});

form.addEventListener(events.form.ajaxAfterSubmit, (event: FreeformEvent) => {
  isTokenSet = false;
  initHCaptchaInvisible(event);
});
