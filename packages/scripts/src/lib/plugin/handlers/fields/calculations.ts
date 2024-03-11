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
      const calculationsLogic = calculations.replace(getVariablesPattern, (_, variable) => variable);

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
          picker.dispatchEvent(new Event('change'));
          return;
        }

        const wrapper = picker.parentElement;
        const pTag = wrapper.querySelector('.freeform-calculation-plain-field');

        if (!pTag) {
          return;
        }

        picker.value = result;
        pTag.textContent = result;

        picker.dispatchEvent(new Event('change'));
      };

      Object.keys(variables).forEach((variable) => {
        const inputElements = this.freeform.form.querySelectorAll(
          `input[name="${variable}"], select[name="${variable}"]`
        );

        if (inputElements.length === 0) return;

        const element = inputElements[0] as HTMLInputElement | HTMLSelectElement;

        const updateVariables = () => {
          variables[variable] =
            element instanceof HTMLInputElement
              ? element.type === 'number'
                ? Number(element.value)
                : this.valueOrdination(element.value)
              : this.valueOrdination(element.value);
        };

        const updateVariablesAndCalculate = () => {
          updateVariables();
          doCalculations();
        };

        updateVariables(); // Initial update

        if (element instanceof HTMLInputElement) {
          element.addEventListener('input', updateVariablesAndCalculate);
        } else if (element instanceof HTMLSelectElement) {
          element.addEventListener('change', updateVariablesAndCalculate);
        }

        // Handling other input elements (if any)
        if (inputElements.length > 1) {
          inputElements.forEach((inputElement) => {
            if (inputElement !== element && inputElement instanceof HTMLInputElement) {
              inputElement.addEventListener('click', () => {
                variables[variable] = this.valueOrdination(inputElement.value);
                doCalculations();
              });
            }
          });
        }
      });
    });
  };
}

export default Calculation;
