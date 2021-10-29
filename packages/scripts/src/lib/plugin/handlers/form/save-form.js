import { dispatchCustomEvent } from '@lib/plugin/helpers/event-handling';
import { EVENT_HANDLE_ACTIONS, EVENT_SAVE_FORM_HANDLE_TOKEN } from '../../constants/event-types';

/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
class SaveForm {
  freeform;
  form;

  constructor(freeform) {
    this.freeform = freeform;
    this.form = freeform.form;

    this.form.addEventListener(EVENT_HANDLE_ACTIONS, (event) => {
      const { actions } = event;

      const saveAndContinue = actions.find((action) => action.name === 'save-form');
      if (!saveAndContinue) {
        return;
      }

      const { key, token, url } = saveAndContinue.metadata;

      const tokenEvent = dispatchCustomEvent(EVENT_SAVE_FORM_HANDLE_TOKEN, { key, token, url }, this.form);
      if (tokenEvent.defaultPrevented) {
        return;
      }

      window.location.href = tokenEvent.url;
    });
  }

  reload = () => {};
}

export default SaveForm;
