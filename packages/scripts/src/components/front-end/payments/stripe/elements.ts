import events from '@lib/plugin/constants/event-types';
import { loadStripe } from '@stripe/stripe-js';

import extractConfig from './elements.config';
import { loadStripeContainers, submitStripe } from './elements.submit';
import type { StripeElement, StripeFunctionConstructorProps } from './elements.types';

const initializedForms = new WeakMap<HTMLFormElement, boolean>();

const attachStripeToForm = async (form: HTMLFormElement) => {
  const config = extractConfig(form);
  if (!config) {
    return;
  }

  const { apiKey } = config;

  const stripe = await loadStripe(apiKey);

  if (initializedForms.has(form)) {
    return;
  }

  initializedForms.set(form, true);

  const elementMap = new WeakMap<HTMLDivElement, StripeElement>();
  const props: StripeFunctionConstructorProps = {
    elementMap,
    form,
    stripe,
  };

  const loadContainers = loadStripeContainers(props);

  form.addEventListener(events.form.ready, loadContainers);
  form.addEventListener(events.form.reset, loadContainers);
  form.addEventListener(events.form.ajaxAfterSubmit, loadContainers);
  form.addEventListener(events.form.submit, submitStripe(props));
};

window.onload = () => {
  // Attach to all forms
  const forms = document.querySelectorAll<HTMLFormElement>('form[data-freeform]');
  forms.forEach((form) => {
    attachStripeToForm(form);
  });

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
};
