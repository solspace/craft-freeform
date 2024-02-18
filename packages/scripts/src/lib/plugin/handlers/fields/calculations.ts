import type Freeform from '@components/front-end/plugin/freeform';
// @ts-ignore
import ExpressionLanguage from 'expression-language';
import type { FreeformHandler } from 'types/form';

class Calculation implements FreeformHandler {
  freeform: Freeform;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  expressionLanguage: any;

  constructor(freeform: Freeform) {
    this.freeform = freeform;
    this.expressionLanguage = new ExpressionLanguage();

    this.reload();
  }

  valueOrdination = (value: string): string | number | boolean => {
    const lowercasedValue = value.toLowerCase();

    if (lowercasedValue === 'true') {
      return true;
    } else if (lowercasedValue === 'false') {
      return false;
    }

    return isNaN(Number(value)) ? value : Number(value);
  };

  reload = () => {
    const pickers = this.freeform.form.querySelectorAll('input[data-calculations]');

    pickers.forEach((picker) => {
      const calculations = picker.getAttribute('data-calculations');

      const getVariablesPattern = /field:([a-zA-Z0-9_]+)/g;

      // Get calculation logic
      const calculationsLogic = calculations
        .replace(getVariablesPattern, (_, variable) => variable)
        .replace(/&ZeroWidthSpace;|\s|\u200B/g, ' ');

      // Get variables
      const variables: Record<string, string | number | boolean> = {};
      let match;
      while ((match = getVariablesPattern.exec(calculations)) !== null) {
        variables[match[1]] = '';
      }

      const doCalculations = () => {
        const allVariablesHaveValues = Object.values(variables).every((value) => value !== '');

        if (!allVariablesHaveValues) {
          return;
        }

        const result = this.expressionLanguage.evaluate(calculationsLogic, variables);

        if (!(picker instanceof HTMLInputElement)) {
          return;
        }

        if (picker.type !== 'hidden') {
          picker.value = result;
          return;
        }

        const wrapper = picker.parentElement;
        const pTag = wrapper.querySelector('#freeform-calculation-plain-field');

        if (!pTag) {
          return;
        }

        picker.value = result;
        pTag.textContent = result;
      };

      Object.keys(variables).forEach((variable) => {
        const elements = this.freeform.form.querySelectorAll(`input[name="${variable}"], select[name="${variable}"]`);

        if (elements.length === 0) return;

        const element = elements[0] as HTMLInputElement | HTMLSelectElement;

        const updateVariablesAndCalculate = () => {
          variables[variable] =
            element instanceof HTMLInputElement
              ? element.type === 'number'
                ? Number(element.value)
                : this.valueOrdination(element.value)
              : this.valueOrdination(element.value);

          doCalculations();
        };

        updateVariablesAndCalculate();

        if (element instanceof HTMLInputElement) {
          element.addEventListener('input', updateVariablesAndCalculate);
        } else if (element instanceof HTMLSelectElement) {
          element.addEventListener('change', updateVariablesAndCalculate);
        }

        if (elements.length === 1) return;

        elements.forEach((element) => {
          if (element instanceof HTMLInputElement) {
            element.addEventListener('click', () => {
              variables[variable] = this.valueOrdination(element.value);
              doCalculations();
            });
          }
        });
      });
    });
  };
}

export default Calculation;
