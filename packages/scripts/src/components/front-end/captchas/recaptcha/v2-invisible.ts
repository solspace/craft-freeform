import events from '@lib/plugin/constants/event-types';
import { addListeners } from '@lib/plugin/helpers/event-handling';
import type { FreeformEvent } from 'types/events';

import { getContainer, loadReCaptcha, readConfig } from './utils/script-loader';

let executor: (value: void) => void;

const createCaptcha = (event: FreeformEvent): HTMLDivElement | null => {
  const container = getContainer(event.form);
  if (!container) {
    return null;
  }

  let element = container.querySelector<HTMLDivElement>('[data-recaptcha]');
  if (!element) {
    element = document.createElement('div');
    element.dataset.recaptcha = '';
    container.appendChild(element);
  }

  return element;
};

const initRecaptchaInvisible = (event: FreeformEvent): void => {
  loadReCaptcha(event.form).then(() => {
    const container = getContainer(event.form);
    if (!container) {
      return;
    }

    const { sitekey } = readConfig(container);

    const element = createCaptcha(event);
    if (!element) {
      return;
    }

    if (!element.innerHTML) {
      grecaptcha.ready(() => {
        const id = grecaptcha.render(element, {
          sitekey,
          size: 'invisible',
          callback: (token) => {
            element.querySelector<HTMLInputElement>('*[name="g-recaptcha-response"]').value = token;

            executor();
          },
        });

        element.dataset.captchaId = String(id);
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

    const element = createCaptcha(event);
    if (!element || event.isBackButtonPressed) {
      return;
    }

    await loadReCaptcha(event.form, true);

    grecaptcha.ready(() => {
      const id = element.dataset.captchaId;
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
