import events from '@lib/plugin/constants/event-types';
import type { FreeformEvent } from 'types/events';

import { getContainer, loadReCaptcha, readConfig } from './utils/script-loader';

const createCaptcha = (event: FreeformEvent): HTMLTextAreaElement | null => {
  const container = getContainer(event.form);
  if (!container) {
    return null;
  }

  let element = container.querySelector<HTMLTextAreaElement>('[data-recaptcha]');
  if (!element) {
    element = document.createElement('textarea');
    element.dataset.recaptcha = '';
    element.name = 'g-recaptcha-response';

    element.style.visibility = 'hidden';
    element.style.position = 'absolute';
    element.style.top = '-9999px';
    element.style.left = '-9999px';
    element.style.width = '1px';
    element.style.height = '1px';
    element.style.overflow = 'hidden';
    element.style.border = 'none';

    container.appendChild(element);
  }

  return element;
};

document.addEventListener(events.form.ready, (event: FreeformEvent) => {
  loadReCaptcha(event.form);
});

document.addEventListener(events.form.submit, (event: FreeformEvent) => {
  event.addCallback(async () => {
    const container = getContainer(event.form);
    console.log('container', container);
    if (!container) {
      return null;
    }

    const element = createCaptcha(event);
    console.log('element', element);
    if (!element || event.isBackButtonPressed) {
      return;
    }

    await loadReCaptcha(event.form, true);
    console.log('sitekey', readConfig(container));

    const { sitekey, action } = readConfig(container);

    return await new Promise<void>((resolve) => {
      grecaptcha.ready(async () => {
        const token = await grecaptcha.execute(sitekey, { action });
        element.value = token;

        resolve();
      });
    });
  });
});
