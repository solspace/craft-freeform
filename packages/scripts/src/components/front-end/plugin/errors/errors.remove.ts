import type Freeform from '../freeform';
import { restoreAttributes } from './errors.attributes';
import { callbackOnInputs } from './errors.operations';

/**
 * Remove all error states and messages from the form.
 */
export function removeMessages(): void {
  const { form } = this as Freeform;

  form.querySelectorAll<HTMLElement>('[data-ff-form-banner]').forEach((banner) => {
    banner.remove();
  });

  const containers = form.querySelectorAll<HTMLDivElement>('[data-field-container][data-ff-has-errors]');
  containers.forEach((container) => {
    removeFieldMessages(container);
  });
}

/**
 * Remove error messages from the given field container.
 *
 * @param container - The field container to remove messages from.
 */
export const removeFieldMessages = (container: HTMLElement): void => {
  const label = container?.querySelector<HTMLLabelElement>('[data-field-label]');
  const instructions = container?.querySelector<HTMLElement>('[data-field-instructions]');

  restoreAttributes(container);
  restoreAttributes(label);
  restoreAttributes(instructions);

  callbackOnInputs(container, restoreAttributes);

  // Remove any field errors
  container.querySelector<HTMLElement>('[data-field-errors]')?.remove();
};
