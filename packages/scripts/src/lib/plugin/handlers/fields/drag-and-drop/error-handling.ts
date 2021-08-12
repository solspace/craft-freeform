import type Freeform from '@components/front-end/plugin/freeform';
import {
  EVENT_DND_APPEND_ERRORS,
  EVENT_DND_CLEAR_ERRORS,
  EVENT_DND_RENDER_ERROR_CONTAINER,
} from '@lib/plugin/constants/event-types';
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
    EVENT_DND_RENDER_ERROR_CONTAINER,
    { container },
    container
  ) as RenderErrorContainerEvent;

  return event.container;
};

export const clearErrors = (container: HTMLElement, errorContainer: HTMLElement, freeform: Freeform): void => {
  const event = freeform._dispatchEvent(EVENT_DND_APPEND_ERRORS, {}, container);
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
  const event = freeform._dispatchEvent(EVENT_DND_CLEAR_ERRORS, {}, container);
  if (event.defaultPrevented) {
    return;
  }

  const errorContainer = previewContainer.querySelector<HTMLElement>('[data-errors]');

  previewContainer.setAttribute('data-has-errors', '');
  errorContainer.setAttribute('aria-label', errors.join('; '));
};
