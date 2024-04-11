import events from '@lib/plugin/constants/event-types';
import { addListeners } from '@lib/plugin/helpers/event-handling';
import type { FreeformEvent } from 'types/events';

import { getContainer, loadHCaptcha, readConfig } from './utils/script-loader';

let executor: (value: void | boolean) => void;

const createCaptcha = (event: FreeformEvent): HTMLDivElement | null => {
  const container = getContainer(event.form);
  if (!container) {
    return null;
  }

  let element = container.querySelector<HTMLDivElement>('[data-hcaptcha]');
  if (!element) {
    element = document.createElement('div');
    element.dataset.hcaptcha = '';
    container.appendChild(element);
  }

  return element;
};

let captchaId: string;

const initHCaptchaInvisible = (event: FreeformEvent): void => {
  loadHCaptcha(event.form).then(() => {
    const container = getContainer(event.form);
    if (!container) {
      return;
    }

    const element = createCaptcha(event);
    if (!element) {
      return;
    }

    const { sitekey } = readConfig(container);

    captchaId = hcaptcha.render(element, {
      sitekey,
      size: 'invisible',
      callback: (token: string) => {
        element.querySelector<HTMLInputElement>('*[name="h-captcha-response"]').value = token;

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
