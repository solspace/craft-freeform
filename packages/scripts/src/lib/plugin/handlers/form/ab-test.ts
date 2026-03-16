import type Freeform from '@components/front-end/plugin/freeform';
import { ajax } from '@lib/plugin/helpers/ajax';
import type { FreeformHandler } from 'types/form';

class AbTestHandler implements FreeformHandler {
  freeform;
  form;

  constructor(freeform: Freeform) {
    this.freeform = freeform;
    this.form = freeform.form;

    this.reload();
  }

  reload = () => {
    const sessionId = this.getSessionId();
    if (!sessionId) {
      return;
    }

    this.form.querySelectorAll<HTMLInputElement>('input, select, textarea').forEach((input) => {
      input.addEventListener('blur', () => {
        ajax.post('/freeform/ab-test/tracker', {
          sessionId,
          fieldName: input.name,
        });
      });
    });
  };

  getSessionId = (): string | false => {
    const form = this.form;
    if (!form.hasAttribute('data-ab-test')) {
      return false;
    }

    return form.getAttribute('data-ab-test');
  };
}

export default AbTestHandler;
