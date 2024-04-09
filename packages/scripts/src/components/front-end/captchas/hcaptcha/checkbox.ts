import events from '@lib/plugin/constants/event-types';
import { addListeners } from '@lib/plugin/helpers/event-handling';
import type { FreeformEvent } from 'types/events';

import { getHcaptchaContainer, loadHCaptcha, readConfig } from './utils/script-loader';

let captchaId: string;

const createCaptcha = (event: FreeformEvent): HTMLDivElement | null => {
  const existingElement = event.form.querySelector<HTMLDivElement>('.h-captcha');
  if (existingElement) {
    return existingElement;
  }

  const captchaElement = document.createElement('div');
  captchaElement.classList.add('h-captcha');

  const targetElement = getHcaptchaContainer(event.form);
  if (!targetElement) {
    return null;
  }

  const { sitekey, theme, size } = readConfig(targetElement);

  targetElement.appendChild(captchaElement);

  captchaId = hcaptcha.render(captchaElement, {
    sitekey,
    theme,
    size,
  });

  return captchaElement;
};

document.addEventListener(events.form.ready, (event: FreeformEvent) => {
  loadHCaptcha(event.form).then(() => {
    createCaptcha(event);
  });
});

addListeners(document, [events.form.ajaxAfterSubmit], async (event: FreeformEvent) => {
  loadHCaptcha(event.form, true).then(() => {
    const captchaElement = createCaptcha(event);
    if (captchaElement) {
      hcaptcha.reset(captchaId);
    }
  });
});
