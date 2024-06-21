import type Freeform from '@components/front-end/plugin/freeform';
import events from '@lib/plugin/constants/event-types';
import { addDnDClass } from '@lib/plugin/helpers/classes';

type RenderErrorContainerEvent = Event & {
  container: HTMLElement;
};

export const createErrorContainer = (freeform: Freeform): HTMLElement => {
  const container = document.createElement('div');
  container.innerText = '!';
  container.setAttribute('data-errors', '');
  container.setAttribute('data-microtip-position', 'top');
  container.setAttribute('role', 'tooltip');
  addDnDClass(container, 'preview-zone', 'file-preview', 'thumbnail', 'errors');

  const event = freeform._dispatchEvent(
    events.dragAndDrop.renderErrorContainer,
    { container },
    container
  ) as RenderErrorContainerEvent;

  return event.container;
};

export const clearErrors = (container: HTMLElement, errorContainer: HTMLElement, freeform: Freeform): void => {
  const event = freeform._dispatchEvent(events.dragAndDrop.appendErrors, {}, container);
  if (event.defaultPrevented) {
    return;
  }

  errorContainer.removeAttribute('aria-label');
};

export const addFieldErrors = (
  container: HTMLElement,
  previewContainer: HTMLElement,
  errors: string[],
  freeform: Freeform
): void => {
  const event = freeform._dispatchEvent(events.dragAndDrop.clearErrors, {}, container);
  if (event.defaultPrevented) {
    return;
  }

  const errorContainer = previewContainer.querySelector<HTMLElement>('[data-errors]');

  previewContainer.setAttribute('data-has-errors', '');
  errorContainer.setAttribute('aria-label', errors.join('; '));
};
