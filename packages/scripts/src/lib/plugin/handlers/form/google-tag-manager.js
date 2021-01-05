import { EVENT_AJAX_SUCCESS } from '../../constants/event-types';

/* eslint-disable no-undef */
class GoogleTagManager {
  freeform;
  form;

  constructor(freeform) {
    window.dataLayer = window.dataLayer || [];

    this.freeform = freeform;
    this.form = freeform.form;

    const gtmEnabled = this.form.dataset.gtm !== undefined;
    if (!gtmEnabled) {
      return;
    }

    const eventName = this.form.dataset.gtmEventName || 'form-submission';
    const handle = this.form.dataset.handle;

    this.form.addEventListener(EVENT_AJAX_SUCCESS, (event) => {
      const response = event.response;

      const payload = {
        event: eventName,
        form: handle,
        submission: {
          id: response.submissionId,
          token: response.submissionToken,
        },
      };

      window.dataLayer.push(payload);
    });
  }

  reload = () => {};
}

export default GoogleTagManager;
