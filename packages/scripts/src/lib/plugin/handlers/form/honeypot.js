import { EVENT_ON_SUBMIT } from '../../constants/event-types';

/* eslint-disable no-undef */
class HoneypotHandler {
  constructor(freeform) {
    this.freeform = freeform;
    this.form = freeform.form;

    this.form.addEventListener(EVENT_ON_SUBMIT, (event) => {
      const { honeypot, honeypotName, honeypotValue } = event.form.dataset;

      if (honeypot === undefined) {
        return;
      }

      event.form.querySelector(`[name="${honeypotName}"]`).value = honeypotValue;
    });
  }

  reload = () => {};
}

export default HoneypotHandler;
