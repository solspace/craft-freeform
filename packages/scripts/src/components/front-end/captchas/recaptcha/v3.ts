import events from '@lib/plugin/constants/event-types';
import type { FreeformEvent } from 'types/events';

import { getRecaptchaContainer, loadReCaptcha, readConfig } from './utils/script-loader';

const createCaptcha = (event: FreeformEvent): HTMLTextAreaElement | null => {
  const captchaContainer = getRecaptchaContainer(event.form);
  if (!captchaContainer) {
    return null;
  }

  let recaptchaElement = captchaContainer.querySelector<HTMLTextAreaElement>('[data-recaptcha]');
  if (!recaptchaElement) {
    recaptchaElement = document.createElement('textarea');
    recaptchaElement.dataset.recaptcha = '';
    recaptchaElement.name = 'g-recaptcha-response';

    recaptchaElement.style.visibility = 'hidden';
    recaptchaElement.style.position = 'absolute';
    recaptchaElement.style.top = '-9999px';
    recaptchaElement.style.left = '-9999px';
    recaptchaElement.style.width = '1px';
    recaptchaElement.style.height = '1px';
    recaptchaElement.style.overflow = 'hidden';
    recaptchaElement.style.border = 'none';

    captchaContainer.appendChild(recaptchaElement);
  }

  return recaptchaElement;
};

document.addEventListener(events.form.ready, (event: FreeformEvent) => {
  loadReCaptcha(event.form);
});

document.addEventListener(events.form.submit, (event: FreeformEvent) => {
  event.addCallback(async () => {
    const recaptchaElement = createCaptcha(event);
    if (!recaptchaElement || event.isBackButtonPressed) {
      return;
    }

    await loadReCaptcha(event.form, true);

    const captchaContainer = getRecaptchaContainer(event.form);
    if (!captchaContainer) {
      return null;
    }

    if (!recaptchaElement) {
      return;
    }

    const { sitekey, action } = readConfig(captchaContainer);

    return await new Promise<void>((resolve) => {
      grecaptcha.ready(async () => {
        const token = await grecaptcha.execute(sitekey, { action });
        recaptchaElement.value = token;

        resolve();
      });
    });
  });
});
