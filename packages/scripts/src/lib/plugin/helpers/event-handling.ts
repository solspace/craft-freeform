import type { FreeformEventParameters } from 'types/form';

export const dispatchCustomEvent = <T extends object = Record<string, never>>(
  name: string,
  parameters?: FreeformEventParameters<T>,
  element?: HTMLElement
): Event & T => {
  const { bubbles = false, cancelable = true, ...eventParameters } = parameters || {};

  const event = createNewEvent(name, bubbles, cancelable);
  Object.assign(event, eventParameters);

  if (element) {
    element.dispatchEvent(event);
  }

  return event as Event & T;
};

export const createNewEvent = (eventName: string, bubbles = true, cancelable = true): Event => {
  return new Event(eventName, { bubbles, cancelable });
};
