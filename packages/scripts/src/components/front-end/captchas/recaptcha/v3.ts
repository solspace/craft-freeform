import events from '@lib/plugin/constants/event-types';
import type { FreeformEvent } from 'types/events';

import { getRecaptchaContainer, loadReCaptcha, readConfig } from './utils/script-loader';

const createCaptcha = (event: FreeformEvent): HTMLTextAreaElement | null => {
  const id = `${event.freeform.id}-recaptcha-v3`;
  const captchaContainer = getRecaptchaContainer(event.form);
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

document.addEventListener(events.form.ready, (event: FreeformEvent) => {
  loadReCaptcha(event.form);
});

document.addEventListener(events.form.submit, (event: FreeformEvent) => {
  event.addCallback(async () => {
    if (!createCaptcha(event) || event.isBackButtonPressed) {
      return;
    }

    await loadReCaptcha(event.form, true);

    const captchaContainer = getRecaptchaContainer(event.form);
    if (!captchaContainer) {
      return null;
    }

    const { sitekey, action } = readConfig(captchaContainer);

    const recaptchaElement = createCaptcha(event);
    if (!recaptchaElement) {
      return;
    }

    return new Promise<void>((resolve) => {
      grecaptcha.ready(async () => {
        const token = await grecaptcha.execute(sitekey, { action });
        recaptchaElement.value = token;

        resolve();
      });
    });
  });
});
