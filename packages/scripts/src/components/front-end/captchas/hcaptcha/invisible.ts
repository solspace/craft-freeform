import events from '@lib/plugin/constants/event-types';
import { addListeners } from '@lib/plugin/helpers/event-handling';
import type { FreeformEvent } from 'types/events';

import { getHcaptchaContainer, loadHCaptcha, readConfig } from './utils/script-loader';

let executor: (value: void | boolean) => void;

const createCaptcha = (event: FreeformEvent): HTMLDivElement | null => {
  const id = `${event.freeform.id}-hcaptcha-invisible`;
  const captchaContainer = getHcaptchaContainer(event.form);
  if (!captchaContainer) {
    return null;
  }

  let recaptchaElement = document.getElementById(id) as HTMLDivElement;
  if (!recaptchaElement) {
    recaptchaElement = document.createElement('div');
    recaptchaElement.id = id;
    event.form.appendChild(recaptchaElement);
  }

  return recaptchaElement;
};

let captchaId: string;

const initHCaptchaInvisible = (event: FreeformEvent): void => {
  loadHCaptcha(event.form).then(() => {
    const hcaptchaElement = createCaptcha(event);
    if (!hcaptchaElement) {
      return;
    }

    const captchaContainer = getHcaptchaContainer(event.form);
    if (!captchaContainer) {
      return;
    }

    const { sitekey } = readConfig(captchaContainer);

    captchaId = hcaptcha.render(hcaptchaElement, {
      sitekey,
      size: 'invisible',
      callback: (token: string) => {
        hcaptchaElement.querySelector<HTMLInputElement>('*[name="h-captcha-response"]').value = token;

        executor();
      },
    });
  });
};

document.addEventListener(events.form.submit, async (event: FreeformEvent) => {
  event.addCallback(async () => {
    const promise = new Promise<void | boolean>((resolve) => {
      executor = resolve;
    });

    if (!createCaptcha(event) || event.isBackButtonPressed) {
      return;
    }

    await loadHCaptcha(event.form, true);

    hcaptcha.execute(captchaId);

    return promise;
  });
});

addListeners(
  document,
  [events.form.ready, events.form.ajaxAfterSubmit, events.form.afterFailedSubmit],
  initHCaptchaInvisible
);
