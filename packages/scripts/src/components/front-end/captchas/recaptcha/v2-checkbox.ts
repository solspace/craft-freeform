import events from '@lib/plugin/constants/event-types';
import { addListeners } from '@lib/plugin/helpers/event-handling';
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
  locale: '{{ locale }}',
} as const;

const createCaptcha = (event: FreeformEvent): HTMLDivElement | null => {
  const existingElement = form.querySelector<HTMLDivElement>('.g-recaptcha');
  if (existingElement) {
    return existingElement;
  }

  const { sitekey, theme, size } = config;

  const captchaElement = document.createElement('div');
  captchaElement.classList.add('g-recaptcha');

  const targetElement = event.form.querySelector('[data-freeform-recaptcha-container]');
  if (!targetElement) {
    return null;
  }

  targetElement.appendChild(captchaElement);

  grecaptcha.ready(() => {
    grecaptcha.render(captchaElement, {
      sitekey,
      theme,
      size,
    });
  });

  return captchaElement;
};

form.addEventListener(events.form.ready, (event: FreeformEvent) => {
  loadReCaptcha(event.form, config).then(() => {
    createCaptcha(event);
  });
});

addListeners(form, [events.form.ajaxAfterSubmit, events.form.afterFailedSubmit], async (event: FreeformEvent) => {
  await loadReCaptcha(event.form, { ...config, lazyLoad: false });

  const captchaElement = createCaptcha(event);
  if (captchaElement) {
    grecaptcha.ready(() => grecaptcha.reset());
  }
});
