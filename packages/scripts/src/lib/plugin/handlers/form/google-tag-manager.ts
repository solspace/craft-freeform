import type Freeform from '@components/front-end/plugin/freeform';
import type { FreeformResponseEvent } from 'types/events';

import events from '../../constants/event-types';

const EVENT_GTM_DATA_LAYER_PUSH = 'freeform-gtm-data-layer-push';

declare global {
  interface Window {
    dataLayer: Record<string, string | object>[];
  }
}

class GoogleTagManager {
  freeform: Freeform;
  form;

  constructor(freeform: Freeform) {
    window.dataLayer = window.dataLayer || [];

    this.freeform = freeform;
    this.form = freeform.form;

    if (!this.freeform.has('data-gtm')) {
      return;
    }

    const eventName = this.form.dataset.gtmEventName || 'form-submission';
    const handle = this.form.dataset.handle;

    this.form.addEventListener(events.form.ajaxSuccess, (event: FreeformResponseEvent) => {
      const response = event.response;

      const pushEvent = freeform._dispatchEvent(EVENT_GTM_DATA_LAYER_PUSH, { payload: {}, response });
      const payload = {
        event: eventName,
        form: handle,
        submission: {
          id: response.submissionId,
          token: response.submissionToken,
        },
        ...pushEvent.payload,
      };

      window.dataLayer.push(payload);
    });
  }

  reload = () => {};
}

export default GoogleTagManager;
