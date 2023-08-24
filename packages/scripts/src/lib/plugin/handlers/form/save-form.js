import { dispatchCustomEvent } from '@lib/plugin/helpers/event-handling';
import events from '../../constants/event-types';

/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
class SaveForm {
  freeform;
  form;

  constructor(freeform) {
    this.freeform = freeform;
    this.form = freeform.form;

    this.form.addEventListener(events.form.handleActions, (event) => {
      const { actions } = event;

      const saveAndContinue = actions.find((action) => action.name === 'save-form');
      if (!saveAndContinue) {
        return;
      }

      const { key, token, url } = saveAndContinue.metadata;

      const tokenEvent = dispatchCustomEvent(
        events.saveAndContinue.saveFormhandleToken,
        { key, token, url },
        this.form
      );
      if (tokenEvent.defaultPrevented) {
        return;
      }

      window.location.href = tokenEvent.url;
    });
  }

  reload = () => {};
}

export default SaveForm;
