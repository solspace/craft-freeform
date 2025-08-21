import type Freeform from '@components/front-end/plugin/freeform';
import type { FreeformHandler } from 'types/form';

class CardsHandler implements FreeformHandler {
  freeform: Freeform;

  constructor(freeform: Freeform) {
    this.freeform = freeform;

    this.reload();
  }

  reload = () => {
    const cardContainers = this.freeform.form.querySelectorAll<HTMLElement>('*[data-field-type="cards"]');
    cardContainers.forEach((container) => {
      const maxValuesData = container.dataset.maxValues;
      if (maxValuesData === undefined) {
        return;
      }

      const checkboxes = Array.from(container.querySelectorAll<HTMLInputElement>('input[type="checkbox"]'));
      const maxValues = parseInt(maxValuesData);

      if (maxValues === 1) {
        this.handleSingleValue(checkboxes);
      } else if (maxValues > 1) {
        this.handleMultipleValues(checkboxes, maxValues);
      }
    });
  };

  private handleMultipleValues = (checkboxes: HTMLInputElement[], maxValues: number) => {
    checkboxes.forEach((checkbox) => {
      checkbox.addEventListener('change', () => {
        const checkedCount = checkboxes.filter((cb) => cb.checked).length;
        if (checkedCount > maxValues && checkbox.checked) {
          checkbox.checked = false;
        }
      });
    });
  };

  private handleSingleValue = (checkboxes: HTMLInputElement[]) => {
    checkboxes.forEach((checkbox) => {
      checkbox.addEventListener('change', () => {
        const isChecked = checkbox.checked;
        const siblings = checkboxes.filter((cb) => cb !== checkbox);
        const checkedSiblings = siblings.filter((cb) => cb.checked);

        if (isChecked && checkedSiblings.length > 0) {
          checkedSiblings.forEach((sibling) => {
            sibling.checked = false;
          });
        }
      });
    });
  };
}

export default CardsHandler;
