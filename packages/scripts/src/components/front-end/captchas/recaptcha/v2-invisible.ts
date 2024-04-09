import events from '@lib/plugin/constants/event-types';
import { addListeners } from '@lib/plugin/helpers/event-handling';
import type { FreeformEvent } from 'types/events';

import { getRecaptchaContainer, loadReCaptcha, readConfig } from './utils/script-loader';

let executor: (value: void) => void;

const createCaptcha = (event: FreeformEvent): HTMLDivElement | null => {
  const id = `${event.freeform.id}-recaptcha-v2-invisible`;
  const captchaContainer = getRecaptchaContainer(event.form);
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
        grecaptcha.render(recaptchaElement, {
          sitekey,
          size: 'invisible',
          callback: (token) => {
            recaptchaElement.querySelector<HTMLInputElement>('*[name="g-recaptcha-response"]').value = token;

            executor();
          },
        });
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

    if (!createCaptcha(event) || event.isBackButtonPressed) {
      return;
    }

    await loadReCaptcha(event.form, true);

    grecaptcha.ready(() => {
      grecaptcha.execute();
    });

    return promise;
  });
});

addListeners(
  document,
  [events.form.ready, events.form.afterFailedSubmit, events.form.ajaxAfterSubmit],
  initRecaptchaInvisible
);
