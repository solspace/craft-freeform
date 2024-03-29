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
  action: '{{ action }}',
} as const;

const createCaptcha = (event: FreeformEvent): HTMLTextAreaElement | null => {
  const id = `${event.freeform.id}-recaptcha-v3`;
  const captchaContainer = event.form.querySelector('[data-freeform-recaptcha-container]');
  if (!captchaContainer) {
    return null;
  }

  let recaptchaElement = document.getElementById(id) as HTMLTextAreaElement;
  if (!recaptchaElement) {
    recaptchaElement = document.createElement('textarea');
    recaptchaElement.id = id;
    recaptchaElement.name = 'g-recaptcha-response';

    recaptchaElement.style.visibility = 'hidden';
    recaptchaElement.style.position = 'absolute';
    recaptchaElement.style.top = '-9999px';
    recaptchaElement.style.left = '-9999px';
    recaptchaElement.style.width = '1px';
    recaptchaElement.style.height = '1px';
    recaptchaElement.style.overflow = 'hidden';
    recaptchaElement.style.border = 'none';

    event.form.appendChild(recaptchaElement);
  }

  return recaptchaElement;
};

form.addEventListener(events.form.ready, (event: FreeformEvent) => {
  loadReCaptcha(event.form, config);
});

form.addEventListener(events.form.submit, (event: FreeformEvent) => {
  event.addCallback(async () => {
    if (!createCaptcha(event) || event.isBackButtonPressed) {
      return;
    }

    await loadReCaptcha(event.form, { ...config, lazyLoad: false });

    const recaptchaElement = createCaptcha(event);
    if (!recaptchaElement) {
      return;
    }

    const { sitekey } = config;
    let { action } = config;
    if (!action) {
      action = 'submit';
    }

    const token = await grecaptcha.execute(sitekey, { action });
    recaptchaElement.value = token;
  });
});
