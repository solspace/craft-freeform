import events from '@lib/plugin/constants/event-types';
import type { FreeformEvent } from 'types/events';

import type { hCaptchaConfig, Size, Theme, Version } from './utils/script-loader';
import { loadHCaptcha } from './utils/script-loader';

const form: HTMLFormElement = document.querySelector('form[data-id="{{ formAnchor }}"]') as HTMLFormElement;
const config: hCaptchaConfig = {
  sitekey: '{{ siteKey }}',
  theme: '{{ theme }}' as Theme,
  size: '{{ size }}' as Size,
  lazyLoad: Boolean('{{ lazyLoad }}'),
  version: '{{ version }}' as Version,
} as const;

let executor: (value: void | boolean) => void;

const createCaptcha = (event: FreeformEvent): HTMLDivElement | null => {
  const id = `${event.freeform.id}-hcaptcha-invisible`;
  const captchaContainer = event.form.querySelector('[data-freeform-hcaptcha-container]');
  if (!captchaContainer) {
    return null;
  }

  let recaptchaElement = document.getElementById(id) as HTMLDivElement;
  if (!recaptchaElement) {
    recaptchaElement = document.createElement('div');
    recaptchaElement.id = id;
    event.form.appendChild(recaptchaElement);
  }

  return recaptchaElement;
};

let captchaId: string;

const initHCaptchaInvisible = (event: FreeformEvent): void => {
  const { sitekey } = config;

  loadHCaptcha(event.form, config).then(() => {
    const hcaptchaElement = createCaptcha(event);
    if (!hcaptchaElement) {
      return;
    }

    captchaId = hcaptcha.render(hcaptchaElement, {
      sitekey,
      size: 'invisible',
      callback: (token: string) => {
        hcaptchaElement.querySelector<HTMLInputElement>('*[name="h-captcha-response"]').value = token;

        executor();
      },
    });
  });
};

form.addEventListener(events.form.submit, async (event: FreeformEvent) => {
  event.addCallback(async () => {
    const promise = new Promise<void | boolean>((resolve) => {
      executor = resolve;
    });

    if (!createCaptcha(event) || event.isBackButtonPressed) {
      return;
    }

    hcaptcha.execute(captchaId);

    return promise;
  });
});

form.addEventListener(events.form.ready, initHCaptchaInvisible);
form.addEventListener(events.form.ajaxAfterSubmit, initHCaptchaInvisible);
form.addEventListener(events.form.afterFailedSubmit, initHCaptchaInvisible);
