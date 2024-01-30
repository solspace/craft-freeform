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

  reload = () => {
    const pickers = this.freeform.form.querySelectorAll('input[type="calculation"]');

    pickers.forEach((picker) => {
      const calculations = picker.getAttribute('data-calculations');

      const getVariablesPattern = /field:([a-zA-Z0-9_]+)/g;

      // Get calculation logic
      const calculationsLogic = calculations
        .replace(getVariablesPattern, (_, variable) => variable)
        .replace(/&ZeroWidthSpace;|\s|\u200B/g, ' ');

      // Get variables
      const variables: Record<string, string | number> = {};
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
          const element = elements[0];

          // Check if the element has a value
          if (element instanceof HTMLInputElement || element instanceof HTMLSelectElement) {
            if (element.value) {
              if (element instanceof HTMLInputElement) {
                if (element.type == 'number') {
                  variables[variable] = Number(element.value);
                } else {
                  variables[variable] = element.value;
                }
              }

              if (element instanceof HTMLSelectElement) {
                const valueAsNumber = Number(element.value);

                if (!isNaN(valueAsNumber)) {
                  variables[variable] = valueAsNumber;
                } else {
                  variables[variable] = element.value;
                }
              }
            }
          }

          // Handle calculation if it's input element
          if (element instanceof HTMLInputElement) {
            element.addEventListener('input', () => {
              if (element.type == 'number') {
                variables[variable] = Number(element.value);
              } else {
                variables[variable] = element.value;
              }

              // Get result when varables updated
              doCalculations();
            });
          }

          // Handle calculation if it's select element
          if (element instanceof HTMLSelectElement) {
            element.addEventListener('change', () => {
              const valueAsNumber = Number(element.value);

              if (!isNaN(valueAsNumber)) {
                variables[variable] = valueAsNumber;
              } else {
                variables[variable] = element.value;
              }

              // Get result when varables updated
              doCalculations();
            });
          }
        } else {
          elements.forEach((element) => {
            // Handle Calculation for radius elements:
            if (element instanceof HTMLInputElement) {
              element.addEventListener('click', () => {
                const valueAsNumber = Number(element.value);

                if (!isNaN(valueAsNumber)) {
                  variables[variable] = valueAsNumber;
                } else {
                  variables[variable] = element.value;
                }

                // Get result when varables updated
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
