import events from '../../constants/event-types';

/* eslint-disable no-undef */
class HoneypotHandler {
  constructor(freeform) {
    this.freeform = freeform;
    this.form = freeform.form;

    this.form.addEventListener(events.form.onSubmit, (event) => {
      const { honeypot, honeypotName, honeypotValue } = event.form.dataset;

      if (honeypot === undefined) {
        return;
      }

      const element = event.form.querySelector(`[name="${honeypotName}"]`);
      if (!element) {
        return;
      }

      element.value = honeypotValue;
    });
  }

  reload = () => {};
}

export default HoneypotHandler;
