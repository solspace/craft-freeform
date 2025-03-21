import type Freeform from '@components/front-end/plugin/freeform';
import events from '@lib/plugin/constants/event-types';
import { addClass, removeClass } from '@lib/plugin/helpers/elements';
import type { FreeformEvent } from 'types/events';

export const attachValidatorRequired = (instance: Freeform) => {
  instance.form.addEventListener(events.form.renderFieldErrors, addErrors);
};

const addErrors = (event: FreeformEvent) => {
  const form = event.form;
  const tables = form.querySelectorAll('[data-freeform-table]');

  const errorClass = event.freeform.options.errorClassField;

  tables.forEach((table) => {
    const headings = table.querySelectorAll<HTMLTableCellElement>('thead th[data-column-required]');
    const requiredColumnIndexes = Array.from(headings).map((th) => th.cellIndex);

    const rows = table.querySelectorAll<HTMLTableRowElement>('tbody tr');
    rows.forEach((row) => {
      const cells = row.querySelectorAll<HTMLTableCellElement>('td');
      requiredColumnIndexes.forEach((index) => {
        const cell = cells[index];
        const input = cell.querySelector<HTMLInputElement>('input, textarea, select');

        let isFilled = Boolean(input.value);
        if (['radio', 'checkbox'].includes(input?.type || '')) {
          isFilled = input.checked;
        }

        if (!input || !isFilled) {
          if (input?.type === 'radio') {
            input.parentElement.parentElement.querySelectorAll('input').forEach((sibling) => {
              addClass(sibling, errorClass);
            });
          } else {
            addClass(input, errorClass);
          }
        } else {
          removeClass(input, errorClass);
        }
      });
    });
  });
};
