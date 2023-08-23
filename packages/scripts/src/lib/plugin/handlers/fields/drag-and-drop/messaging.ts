import events from '@lib/plugin/constants/event-types';
import { addDnDClass } from '@lib/plugin/helpers/classes';
import { dispatchCustomEvent } from '@lib/plugin/helpers/event-handling';

const DEFAULT_TTL = 4000;
const ANIMATION_DELAY = 300;

export const showError = (container: HTMLElement, message: string, ttl: number = DEFAULT_TTL): void => {
  const messageItem = document.createElement('li');
  messageItem.setAttribute('data-error', '');
  messageItem.innerText = message;
  addDnDClass(messageItem, 'messages', 'message');
  addDnDClass(messageItem, 'messages', 'message', 'error');

  const event = dispatchCustomEvent(events.dragAndDrop.showGlobalMessage, { messageItem }, container);
  appendToErrorList(container, event.messageItem, ttl);
};

const appendToErrorList = (container: HTMLElement, message: HTMLLIElement, ttl: number): void => {
  const messageList = container.querySelector<HTMLUListElement>('[data-messages]');
  if (!messageList) {
    return;
  }

  messageList.appendChild(message);

  setTimeout(() => {
    message.setAttribute('data-animate-fade-out', '');
  }, ttl);

  setTimeout(() => {
    messageList.removeChild(message);
  }, ttl + ANIMATION_DELAY);
};
