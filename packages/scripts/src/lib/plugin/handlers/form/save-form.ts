import type Freeform from '@components/front-end/plugin/freeform';
import { dispatchCustomEvent } from '@lib/plugin/helpers/event-handling';
import type { FreeformActionsEvent } from 'types/events';
import type { FreeformHandler } from 'types/form';

import events from '../../constants/event-types';

class SaveForm implements FreeformHandler {
  freeform;
  form;

  constructor(freeform: Freeform) {
    this.freeform = freeform;
    this.form = freeform.form;

    this.form.addEventListener(events.form.handleActions, (event: FreeformActionsEvent) => {
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
