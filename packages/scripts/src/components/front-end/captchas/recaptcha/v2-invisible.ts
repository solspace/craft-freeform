import events from '@lib/plugin/constants/event-types';
import type { FreeformEvent } from 'types/events';

import type { reCaptchaConfig, Size, Theme, Version } from './utils/script-loader';
import { loadReCaptcha } from './utils/script-loader';

const form: HTMLFormElement = document.querySelector('form[data-id="{{ formAnchor }}"]') as HTMLFormElement;
const config: reCaptchaConfig = {
  sitekey: '{{ siteKey }}',
  theme: '{{ theme }}' as Theme,
  size: '{{ size }}' as Size,
  lazyLoad: Boolean('{{ lazyLoad }}'),
  version: '{{ version }}' as Version,
} as const;

const createCaptcha = (event: FreeformEvent): HTMLDivElement | null => {
  const id = `${event.freeform.id}-recaptcha-v2-invisible`;
  const captchaContainer = event.form.querySelector('[data-freeform-recaptcha-container]');
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

let isTokenSet = false;
const initRecaptchaInvisible = (event: FreeformEvent): void => {
  const { sitekey } = config;

  loadReCaptcha(event.form, config).then(() => {
    const recaptchaElement = createCaptcha(event);
    if (!recaptchaElement) {
      return;
    }

    if (!recaptchaElement.innerHTML) {
      grecaptcha.ready(() => {
        grecaptcha.render(recaptchaElement, {
          sitekey,
          size: 'invisible',
          callback: (token) => {
            isTokenSet = true;
            recaptchaElement.querySelector<HTMLInputElement>('*[name="g-recaptcha-response"]').value = token;
            event.freeform.triggerResubmit();
          },
        });
      });
    } else {
      grecaptcha.ready(grecaptcha.reset);
    }
  });
};

form.addEventListener(events.form.ready, initRecaptchaInvisible);
form.addEventListener(events.form.submit, async (event: FreeformEvent) => {
  if (isTokenSet) {
    return;
  }

  if (!createCaptcha(event) || event.isBackButtonPressed) {
    return;
  }

  event.preventDefault();
  loadReCaptcha(event.form, { ...config, lazyLoad: false }).then(() => {
    grecaptcha.ready(grecaptcha.execute);
  });
});

form.addEventListener(events.form.ajaxAfterSubmit, (event: FreeformEvent) => {
  isTokenSet = false;

  initRecaptchaInvisible(event);
});
