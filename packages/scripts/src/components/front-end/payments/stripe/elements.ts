import events from '@lib/plugin/constants/event-types';
import { loadStripe } from '@stripe/stripe-js';

import config from './elements.config';
import { loadStripeContainers, submitStripe } from './elements.submit';
import type { StripeElement, StripeFunctionConstructorProps } from './elements.types';

(async () => {
  const { formId, apiKey } = config;

  const elementMap = new WeakMap<HTMLDivElement, StripeElement>();
  const stripe = await loadStripe(apiKey);

  const form = document.querySelector<HTMLFormElement>(`form[data-id="${formId}"]`);
  if (!form) {
    return;
  }

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
})();
