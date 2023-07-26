import { EVENT_AJAX_SUCCESS } from '../../constants/event-types';

const EVENT_GTM_DATA_LAYER_PUSH = 'freeform-gtm-data-layer-push';

/* eslint-disable no-undef */
class GoogleTagManager {
  freeform;
  form;

  constructor(freeform) {
    window.dataLayer = window.dataLayer || [];

    this.freeform = freeform;
    this.form = freeform.form;

    if (!this.freeform.has('data-gtm')) {
      return;
    }

    const eventName = this.form.dataset.gtmEventName || 'form-submission';
    const handle = this.form.dataset.handle;

    this.form.addEventListener(EVENT_AJAX_SUCCESS, (event) => {
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
