class Table {
  PATTERN = /([^[]+)\[(\d+)\](\[\d+\])$/g;

  freeform;

  constructor(freeform) {
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
          const inputs = table.querySelectorAll('textarea, input, select');
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
          const referenceRow = table.querySelector('tbody > tr:first-child');

          if (referenceRow) {
            const cloneRow = referenceRow.cloneNode(true);
            const inputs = cloneRow.querySelectorAll('textarea, input, select');
            const maxIndex = getNextMaxIndex();
            for (let i = 0; i < inputs.length; i++) {
              const item = inputs[i];
              let defaultValue = item.dataset.defaultValue || '';
              item.name = item.name.replace(this.PATTERN, `$1[${maxIndex}]$3`);
              if (item.tagName === 'SELECT') {
                const firstOption = item.querySelector('option:first-child');
                if (firstOption) {
                  defaultValue = firstOption.value;
                }
              } else {
                item.checked = false;
              }

              item.value = defaultValue;
            }

            const removeRowButton = cloneRow.querySelector('[data-freeform-table-remove-row]');
            if (removeRowButton) {
              removeRowButton.addEventListener('click', this.removeRow);
            }

            table.querySelector('tbody').appendChild(cloneRow);
          }
        });
      }
    });
  };

  removeRow = (event) => {
    if (event.target.closest('tbody').querySelectorAll('tr').length === 1) {
      return;
    }

    event.target.closest('tr').remove();
  };
}

export default Table;

if (!Element.prototype.matches) {
  Element.prototype.matches = Element.prototype.msMatchesSelector || Element.prototype.webkitMatchesSelector;
}

if (!Element.prototype.closest) {
  Element.prototype.closest = function (s) {
    var el = this;

    do {
      if (el.matches(s)) {
        return el;
      }
      el = el.parentElement || el.parentNode;
    } while (el !== null && el.nodeType === 1);
    return null;
  };
}
