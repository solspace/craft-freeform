import events from '@lib/plugin/constants/event-types';
import { addListeners } from '@lib/plugin/helpers/event-handling';
import type { FreeformEvent } from 'types/events';

import { getContainer, loadCaptcha, readConfig } from './utils/script-loader';

const createCaptcha = (event: FreeformEvent): HTMLDivElement | null => {
  const container = getContainer(event.form);
  if (!container) {
    return null;
  }

  let element = event.form.querySelector<HTMLDivElement>('.cl-turnstile');
  if (element) {
    return element;
  }

  element = document.createElement('div');
  element.classList.add('cl-turnstile');

  container.appendChild(element);

  const { sitekey, theme, size, action } = readConfig(container);
  // @ts-ignore
  const captchaId = turnstile.render(element, {
    sitekey,
    theme,
    size,
    action,
  });

  element.dataset.captchaId = String(captchaId);

  return element;
};

document.addEventListener(events.form.ready, (event: FreeformEvent) => {
  loadCaptcha(event.form).then(() => {
    createCaptcha(event);
  });
});

addListeners(document, [events.form.ajaxAfterSubmit], async (event: FreeformEvent) => {
  loadCaptcha(event.form, true).then(() => {
    const element = createCaptcha(event);
    if (element) {
      const id = element.dataset.captchaId;
      if (id) {
        // @ts-ignore
        turnstile.reset(id);
      }
    }
  });
});
