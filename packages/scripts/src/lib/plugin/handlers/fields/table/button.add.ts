import type Freeform from '@components/front-end/plugin/freeform';
import events from '@lib/plugin/constants/event-types';

const PATTERN = /([^[]+)\[(\d+)\](\[\d+\])$/g;
const ID_PATTERN = /^(labeled-.*)-(\d+)-(\d+)-(\d+)$/g;

export const registerAddButton = (instance: Freeform) => {
  let button: HTMLButtonElement;

  const tables = instance.form.querySelectorAll('[data-freeform-table]');
  tables.forEach((table) => {
    button = table.parentNode.querySelector<HTMLButtonElement>('[data-freeform-table-add-row]');
    toggleAddButton(table, button);

    if (button) {
      instance.form.addEventListener(events.table.afterRemoveRow, () => {
        toggleAddButton(table, button);
      });

      const getNextMaxIndex = () => {
        const inputs = table.querySelectorAll<HTMLInputElement>('textarea, input, select');
        let maxIndex = 0;
        for (let i = 0; i < inputs.length; i++) {
          const input = inputs[i];
          const matches = PATTERN.exec(input.name);
          PATTERN.lastIndex = 0;
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
            const defaultValue = item.dataset.defaultValue || '';
            item.name = item.name.replace(PATTERN, `$1[${maxIndex}]$3`);

            if (item.id && ID_PATTERN.test(item.id)) {
              item.id = item.id.replace(ID_PATTERN, `$1-${maxIndex}-$3-$4`);
              const label = item.nextSibling as HTMLLabelElement;
              label.htmlFor = item.id;
            }

            if (item.tagName === 'INPUT' && item.type === 'radio') {
              item.checked = item.value === defaultValue;
            } else if (item.tagName === 'INPUT' && item.type === 'checkbox') {
              item.checked = defaultValue === '1';
            } else {
              item.value = defaultValue;
            }
          }

          const minRows = table.getAttribute('data-min-rows');
          if (minRows) {
            const lastCell = cloneRow.querySelector('td:last-child');
            if (lastCell && !lastCell.querySelector('[data-freeform-table-remove-row]')) {
              const removeLabel = table.getAttribute('data-remove-button-label') || 'Remove';
              const removeBtn = document.createElement('button');
              removeBtn.type = 'button';
              removeBtn.setAttribute('data-freeform-table-remove-row', '');
              removeBtn.textContent = removeLabel;
              lastCell.innerHTML = '';
              lastCell.appendChild(removeBtn);
            }
          }

          instance._dispatchEvent(events.table.onAddRow, {
            table,
            row: cloneRow,
          });

          table.querySelector('tbody').appendChild(cloneRow);

          instance._dispatchEvent(events.table.afterRowAdded, {
            table,
            row: cloneRow,
          });

          toggleAddButton(table, button);
        }
      });
    }
  });
};

const toggleAddButton = (table: Element, button: HTMLButtonElement | null) => {
  if (!button) {
    return;
  }

  const totalRows = table.querySelectorAll<HTMLTableRowElement>('tbody > tr').length;
  const exactRows = table.getAttribute('data-exact-rows');
  const maxRows = table.getAttribute('data-max-rows');

  if (exactRows) {
    const exact = parseInt(exactRows, 10);
    button.style.display = totalRows >= exact ? 'none' : 'block';
    return;
  }

  if (maxRows) {
    const max = parseInt(maxRows, 10);
    button.style.display = totalRows >= max ? 'none' : 'block';
  }
};
