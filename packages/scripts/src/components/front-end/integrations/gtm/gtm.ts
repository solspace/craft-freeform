import type { FreeformResponseEvent } from 'types/events';

import { GTMManager } from './manager';

(() => {
  const manager = GTMManager.getInstance();

  document.querySelectorAll<HTMLFormElement>('form[data-gtm-id]').forEach((form) => {
    const gtmId = form.dataset.gtmId;
    if (gtmId) {
      manager.loadContainer(gtmId);
    }
  });

  document.addEventListener('freeform-ajax-success', function (event: FreeformResponseEvent) {
    const form = event.form;
    if (!form.dataset.gtmEvent) {
      return;
    }

    const eventName = form.dataset.gtmEvent;

    const response = event.response;
    const pushEvent = form.freeform._dispatchEvent('freeform-gtm-data-layer-push', { payload: {}, response });

    const { finished, multipage, success, submissionId, submissionToken } = response;

    let payload = {
      event: eventName,
      form: {
        handle: form.dataset.handle,
        finished,
        multipage,
        success,
      },
      submission: {
        id: submissionId,
        token: submissionToken,
      },
    };

    payload = Object.assign(payload, pushEvent.payload);

    window.dataLayer.push(payload);
  });

  manager.observeNewForms();
})();
