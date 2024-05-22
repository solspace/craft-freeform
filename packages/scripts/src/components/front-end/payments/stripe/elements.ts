import events from '@lib/plugin/constants/event-types';
import { addListeners } from '@lib/plugin/helpers/event-handling';

import ffStripeEvents from './elements.events';
import { loadStripeContainers, submitStripe } from './elements.submit';
import type { StripeElement, StripeFunctionConstructorProps } from './elements.types';

const initializedForms = new WeakMap<HTMLFormElement, boolean>();

const attachStripeToForm = async (form: HTMLFormElement) => {
  if (initializedForms.has(form)) {
    return;
  }

  initializedForms.set(form, true);

  const elementMap = new WeakMap<HTMLDivElement, StripeElement>();
  const props: StripeFunctionConstructorProps = {
    elementMap,
    form,
  };

  const loadContainers = loadStripeContainers(props);

  addListeners(form, [events.form.ready, events.form.reset, events.form.ajaxAfterSubmit], loadContainers);
  addListeners(form, [events.form.submit], submitStripe(props));
};

document.addEventListener(ffStripeEvents.load, () => {
  // Attach to all forms
  const forms = document.querySelectorAll<HTMLFormElement>('form[data-freeform]');
  forms.forEach((form) => {
    attachStripeToForm(form);
  });
});

window.onload = () => {
  document.dispatchEvent(new CustomEvent(ffStripeEvents.load));
};

const recursiveFreeformAttachment = (node: HTMLFormElement) => {
  if (node.nodeName === 'FORM' || node.dataset?.freeform !== undefined) {
    attachStripeToForm(node);
  }

  node?.childNodes.forEach(recursiveFreeformAttachment);
};

// Add an observer which listens for new forms
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.type !== 'childList') {
      return;
    }

    mutation.addedNodes.forEach((node) => {
      recursiveFreeformAttachment(node as HTMLFormElement);
    });
  });
});

// Start the observer
observer.observe(document.body, { childList: true, subtree: true });
