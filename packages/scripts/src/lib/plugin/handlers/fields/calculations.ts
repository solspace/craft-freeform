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

        if (allVariablesHaveValues) {
          const result = this.expressionLanguage.evaluate(calculationsLogic, variables);

          if (picker instanceof HTMLInputElement) {
            picker.value = result;
          }
        }
      };

      Object.keys(variables).forEach((variable) => {
        const elements = this.freeform.form.querySelectorAll(`input[name="${variable}"] , select[name="${variable}"]`);

        if (elements.length === 1) {
          const element = elements[0] as HTMLInputElement | HTMLSelectElement;

          if (element instanceof HTMLInputElement || element instanceof HTMLSelectElement) {
            if (element.value) {
              if (element instanceof HTMLInputElement) {
                variables[variable] =
                  element.type === 'number' ? Number(element.value) : this.valueOrdination(element.value);
              }

              if (element instanceof HTMLSelectElement) {
                variables[variable] = this.valueOrdination(element.value);
              }

              doCalculations();
            }
          }

          if (element instanceof HTMLInputElement) {
            element.addEventListener('input', () => {
              variables[variable] =
                element.type === 'number' ? Number(element.value) : this.valueOrdination(element.value);
              doCalculations();
            });
          }

          if (element instanceof HTMLSelectElement) {
            element.addEventListener('change', () => {
              variables[variable] = this.valueOrdination(element.value);
              doCalculations();
            });
          }
        } else {
          elements.forEach((element) => {
            if (element instanceof HTMLInputElement) {
              element.addEventListener('click', () => {
                variables[variable] = this.valueOrdination(element.value);
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
