type ObjectLiteral = { [key: string]: unknown } & {
  bubbles?: boolean;
  cancelable?: boolean;
};

export const dispatchCustomEvent = <T extends ObjectLiteral>(
  eventName: string,
  parameters: T = {} as T,
  element: HTMLElement
): T & Event => {
  const bubbles = parameters.bubbles ?? false;
  const cancelable = parameters.cancelable ?? true;

  delete parameters.bubbles;
  delete parameters.cancelable;

  const event = createNewEvent(eventName, bubbles, cancelable);
  Object.assign(event, parameters);

  element.dispatchEvent(event);

  return event as Event & T;
};

export const createNewEvent = (eventName: string, bubbles = true, cancelable = true): Event => {
  if (typeof Event === 'function') {
    return new Event(eventName, { bubbles, cancelable });
  }

  const event = document.createEvent('Event');
  event.initEvent(eventName, bubbles, cancelable);

  return event;
};
