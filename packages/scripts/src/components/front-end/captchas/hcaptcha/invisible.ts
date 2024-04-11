import events from '@lib/plugin/constants/event-types';
import type { FreeformEvent } from 'types/events';

import { getContainer, loadHCaptcha, readConfig } from './utils/script-loader';

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

document.addEventListener(events.form.submit, async (event: FreeformEvent) => {
  event.addCallback(async () => {
    const element = createCaptcha(event);
    if (!element || event.isBackButtonPressed) {
      return;
    }

    await loadHCaptcha(event.form, true);

    let id: number;

    const promise = new Promise<void | boolean>((resolve) => {
      const container = getContainer(event.form);
      if (!container) {
        return;
      }

      const { sitekey } = readConfig(container);

      id = hcaptcha.render(element, {
        sitekey,
        size: 'invisible',
        callback: (token: string) => {
          element.querySelector<HTMLInputElement>('*[name="h-captcha-response"]').value = token;

          resolve();
        },
      });
    });

    hcaptcha.execute(id);

    return promise;
  });
});
