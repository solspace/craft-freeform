import events from '@lib/plugin/constants/event-types';
import { addListeners } from '@lib/plugin/helpers/event-handling';
import type { FreeformEvent } from 'types/events';

import { getRecaptchaContainer, loadReCaptcha, readConfig } from './utils/script-loader';

const createCaptcha = (event: FreeformEvent): HTMLDivElement | null => {
  const existingElement = event.form.querySelector<HTMLDivElement>('.g-recaptcha');
  if (existingElement) {
    return existingElement;
  }

  const captchaElement = document.createElement('div');
  captchaElement.classList.add('g-recaptcha');

  const targetElement = getRecaptchaContainer(event.form);
  if (!targetElement) {
    return null;
  }

  const { sitekey, theme, size } = readConfig(targetElement);

  targetElement.appendChild(captchaElement);

  grecaptcha.ready(() => {
    const captchaId = grecaptcha.render(captchaElement, {
      sitekey,
      theme,
      size,
    });

    captchaElement.dataset.captchaId = String(captchaId);
  });

  return captchaElement;
};

document.addEventListener(events.form.ready, (event: FreeformEvent) => {
  loadReCaptcha(event.form).then(() => {
    createCaptcha(event);
  });
});

addListeners(document, [events.form.ajaxAfterSubmit], async (event: FreeformEvent) => {
  loadReCaptcha(event.form, true).then(() => {
    const captchaElement = createCaptcha(event);
    if (captchaElement) {
      const id = captchaElement.dataset.captchaId;
      grecaptcha.ready(() => grecaptcha.reset(id ? Number(id) : undefined));
    }
  });
});
