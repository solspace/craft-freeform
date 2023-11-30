import type Freeform from '@components/front-end/plugin/freeform';
import events from '@lib/plugin/constants/event-types';
import { removeElement } from '@lib/plugin/helpers/elements';
import type { FreeformHandler } from 'types/form';

class Table implements FreeformHandler {
  PATTERN = /([^[]+)\[(\d+)\](\[\d+\])$/g;

  freeform;

  constructor(freeform: Freeform) {
    this.freeform = freeform;
    this.reload();
  }

  reload = () => {
    const tables = this.freeform.form.querySelectorAll('[data-freeform-table]');
    tables.forEach((table) => {
      const button = table.parentNode.querySelector('[data-freeform-table-add-row]');

      const removeRowButtons = table.querySelectorAll('[data-freeform-table-remove-row]');
      for (let j = 0; j < removeRowButtons.length; j++) {
        const removeButton = removeRowButtons[j];
        removeButton.addEventListener('click', this.removeRow);
      }

      if (button) {
        const getNextMaxIndex = () => {
          const inputs = table.querySelectorAll<HTMLInputElement>('textarea, input, select');
          let maxIndex = 0;
          for (let i = 0; i < inputs.length; i++) {
            const input = inputs[i];
            const matches = this.PATTERN.exec(input.name);
            this.PATTERN.lastIndex = 0;
            if (!matches) {
              continue;
            }

            const index = parseInt(matches[2]);
            maxIndex = Math.max(maxIndex, index);
          }

          return ++maxIndex;
        };

        button.addEventListener('click', () => {
          const referenceRow = table.querySelector<HTMLTableRowElement>('tbody > tr:last-child');

          if (referenceRow) {
            const cloneRow = referenceRow.cloneNode(true) as HTMLTableRowElement;
            const inputs = cloneRow.querySelectorAll<HTMLInputElement>('textarea, input, select');
            const maxIndex = getNextMaxIndex();
            for (let i = 0; i < inputs.length; i++) {
              const item = inputs[i];
              let defaultValue = item.dataset.defaultValue || '';
              item.name = item.name.replace(this.PATTERN, `$1[${maxIndex}]$3`);
              if (item.tagName === 'SELECT') {
                const firstOption = item.querySelector<HTMLOptionElement>('option:first-child');
                if (firstOption) {
                  defaultValue = firstOption.value;
                }
              } else {
                item.checked = false;
              }

              item.value = defaultValue;
            }

            const removeRowButton = cloneRow.querySelector<HTMLButtonElement>('[data-freeform-table-remove-row]');
            if (removeRowButton) {
              removeRowButton.addEventListener('click', this.removeRow);
            }

            this.freeform._dispatchEvent(events.table.onAddRow, {
              table,
              row: cloneRow,
            });

            table.querySelector('tbody').appendChild(cloneRow);

            this.freeform._dispatchEvent(events.table.afterRowAdded, {
              table,
              row: cloneRow,
            });
          }
        });
      }
    });
  };

  removeRow = (event: Event) => {
    const target = event.target as HTMLTableRowElement;

    if (target.closest('tbody').querySelectorAll('tr').length === 1) {
      return;
    }

    const table = target.closest('table');
    const row = target.closest('tr');

    this.freeform._dispatchEvent(events.table.onRemoveRow, { table, row });
    removeElement(row);
    this.freeform._dispatchEvent(events.table.afterRemoveRow, { table });
  };
}

export default Table;
