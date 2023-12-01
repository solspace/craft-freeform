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
  locale: '{{ locale }}',
} as const;

let captchaId: string;

const createCaptcha = (event: FreeformEvent): HTMLDivElement => {
  const existingElement = form.querySelector<HTMLDivElement>('.h-captcha');
  if (existingElement) {
    return existingElement;
  }

  const { sitekey, theme, size } = config;

  const captchaElement = document.createElement('div');
  captchaElement.classList.add('h-captcha');

  const targetElement = event.form.querySelector('[data-freeform-controls]');
  if (targetElement) {
    const parentNode = targetElement.parentNode;
    parentNode.insertBefore(captchaElement, targetElement);
  } else {
    event.form.appendChild(captchaElement);
  }

  captchaId = hcaptcha.render(captchaElement, {
    sitekey,
    theme,
    size,
  });

  return captchaElement;
};

form.addEventListener(events.form.ready, (event: FreeformEvent) => {
  loadHCaptcha(event.form, config).then(() => {
    createCaptcha(event);
  });
});

form.addEventListener(events.form.ajaxAfterSubmit, (event: FreeformEvent) => {
  loadHCaptcha(event.form, { ...config, lazyLoad: false }).then(() => {
    const captchaElement = createCaptcha(event);
    if (captchaElement) {
      hcaptcha.reset(captchaId);
    }
  });
});
