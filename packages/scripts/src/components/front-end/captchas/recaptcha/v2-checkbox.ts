import events from '@lib/plugin/constants/event-types';
import { addListeners } from '@lib/plugin/helpers/event-handling';
import type { FreeformEvent } from 'types/events';

import { getContainer, loadReCaptcha, readConfig } from './utils/script-loader';

const createCaptcha = (event: FreeformEvent): HTMLDivElement | null => {
  const container = getContainer(event.form);
  if (!container) {
    return null;
  }

  let element = event.form.querySelector<HTMLDivElement>('.g-recaptcha');
  if (element) {
    return element;
  }

  element = document.createElement('div');
  element.classList.add('g-recaptcha');

  const { sitekey, theme, size } = readConfig(container);

  container.appendChild(element);

  grecaptcha.ready(() => {
    const captchaId = grecaptcha.render(element, {
      sitekey,
      theme,
      size,
    });

    element.dataset.captchaId = String(captchaId);
  });

  return element;
};

document.addEventListener(events.form.ready, (event: FreeformEvent) => {
  loadReCaptcha(event.form).then(() => {
    createCaptcha(event);
  });
});

addListeners(document, [events.form.ajaxAfterSubmit], async (event: FreeformEvent) => {
  loadReCaptcha(event.form, true).then(() => {
    const element = createCaptcha(event);
    if (element) {
      const id = element.dataset.captchaId;
      grecaptcha.ready(() => grecaptcha.reset(id ? Number(id) : undefined));
    }
  });
});
