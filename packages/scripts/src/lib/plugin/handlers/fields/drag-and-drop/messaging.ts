import type Freeform from "@components/front-end/plugin/freeform";
import events from "@lib/plugin/constants/event-types";
import { addDnDClass } from "@lib/plugin/helpers/classes";

const DEFAULT_TTL = 4000;
const ANIMATION_DELAY = 300;

type RenderShowGlobalMessageEvent = Event & {
  name: string;
  messageItem: HTMLLIElement;
  container: HTMLElement;
};

export const showError = (
  container: HTMLElement,
  message: string,
  freeform: Freeform,
  ttl: number = DEFAULT_TTL,
): void => {
  const messageItem = document.createElement("li");
  messageItem.setAttribute("data-error", "");
  messageItem.innerText = message;
  addDnDClass(messageItem, "messages", "message");
  addDnDClass(messageItem, "messages", "message", "error");

  const event = freeform._dispatchEvent(
    events.dragAndDrop.showGlobalMessage,
    { messageItem },
    container,
  ) as RenderShowGlobalMessageEvent;
  appendToErrorList(container, event.messageItem, ttl);
};

const appendToErrorList = (
  container: HTMLElement,
  message: HTMLLIElement,
  ttl: number,
): void => {
  const messageList =
    container.querySelector<HTMLUListElement>("[data-messages]");
  if (!messageList) {
    return;
  }

  messageList.appendChild(message);

  setTimeout(() => {
    message.setAttribute("data-animate-fade-out", "");
  }, ttl);

  setTimeout(() => {
    messageList.removeChild(message);
  }, ttl + ANIMATION_DELAY);
};
