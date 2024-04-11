import events from '@lib/plugin/constants/event-types';
import { addListeners } from '@lib/plugin/helpers/event-handling';
import type { FreeformEvent } from 'types/events';

import { getRecaptchaContainer, loadReCaptcha, readConfig } from './utils/script-loader';

let executor: (value: void) => void;

const createCaptcha = (event: FreeformEvent): HTMLDivElement | null => {
  const captchaContainer = getRecaptchaContainer(event.form);
  if (!captchaContainer) {
    return null;
  }

  let recaptchaElement = captchaContainer.querySelector<HTMLDivElement>('[data-recaptcha]');
  if (!recaptchaElement) {
    recaptchaElement = document.createElement('div');
    recaptchaElement.dataset.recaptcha = '';
    captchaContainer.appendChild(recaptchaElement);
  }

  return recaptchaElement;
};

const initRecaptchaInvisible = (event: FreeformEvent): void => {
  loadReCaptcha(event.form).then(() => {
    const captchaContainer = getRecaptchaContainer(event.form);
    if (!captchaContainer) {
      return;
    }

    const { sitekey } = readConfig(captchaContainer);

    const recaptchaElement = createCaptcha(event);
    if (!recaptchaElement) {
      return;
    }

    if (!recaptchaElement.innerHTML) {
      grecaptcha.ready(() => {
        const id = grecaptcha.render(recaptchaElement, {
          sitekey,
          size: 'invisible',
          callback: (token) => {
            recaptchaElement.querySelector<HTMLInputElement>('*[name="g-recaptcha-response"]').value = token;

            executor();
          },
        });

        recaptchaElement.dataset.captchaId = String(id);
      });
    } else {
      grecaptcha.ready(grecaptcha.reset);
    }
  });
};

document.addEventListener(events.form.submit, async (event: FreeformEvent) => {
  event.addCallback(async () => {
    const promise = new Promise<void>((resolve) => {
      executor = resolve;
    });

    const captchaElement = createCaptcha(event);
    if (!captchaElement || event.isBackButtonPressed) {
      return;
    }

    await loadReCaptcha(event.form, true);

    grecaptcha.ready(() => {
      const id = captchaElement.dataset.captchaId;
      grecaptcha.execute(id && Number(id));
    });

    return promise;
  });
});

addListeners(
  document,
  [events.form.ready, events.form.afterFailedSubmit, events.form.ajaxAfterSubmit],
  initRecaptchaInvisible
);
