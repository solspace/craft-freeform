import events from '@lib/plugin/constants/event-types';
import type { StripeElements, StripePaymentElementOptions } from '@stripe/stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import type { FreeformEvent } from 'types/events';

import queries from './elements.queries';

export const config = {
  formId: '{{ formId }}',
  apiKey: '{{ apiKey }}',
  csrf: {
    name: '{{ csrf.name }}',
    value: '{{ csrf.value }}',
  },
};

const elementMap = new WeakMap();

const { formId, apiKey } = config;

(async () => {
  const stripe = await loadStripe(apiKey);

  const form = document.querySelector<HTMLFormElement>(`form[data-id="${formId}"]`);
  if (!form) {
    return;
  }

  form.addEventListener(events.form.ready, async () => {
    const containers = form.querySelectorAll<HTMLDivElement>('.freeform-fieldtype-stripe');
    containers.forEach(async (container) => {
      const field = container.querySelector<HTMLDivElement>('.freeform-stripe-card');
      const { paymentIntentId, clientSecret } = await queries.paymentIntents.clientSecret(field.dataset.integration);

      (field.previousSibling as HTMLInputElement).value = paymentIntentId;

      const elements = stripe.elements({
        clientSecret,
      });

      const paymentElementOptions: StripePaymentElementOptions = {
        layout: 'tabs',
      };

      const paymentElement = elements.create('payment', paymentElementOptions);
      paymentElement.mount(field);
      paymentElement.on('change', (event) => {
        console.log('payment change', event);
      });

      elementMap.set(field, elements);
    });
  });

  form.addEventListener(events.form.onSubmit, async (event: FreeformEvent) => {
    const containers = form.querySelectorAll<HTMLDivElement>('.freeform-fieldtype-stripe:not([data-hidden])');
    if (containers.length > 0) {
      event.preventDefault();
      event.freeform.lockSubmit();
    }

    containers.forEach(async (container) => {
      const field = container.querySelector<HTMLDivElement>('.freeform-stripe-card');
      const elements = elementMap.get(field) as StripeElements;

      const returnUrl = new URL(window.location.href);
      //returnUrl.searchParams.append('submissionId', submissionId.toString());

      const isValid = await event.freeform.validate();
      console.log('Form is %s', isValid ? 'valid' : 'invalid');

      if (!isValid) {
        event.freeform.unlockSubmit();
        return;
      }

      console.log('confirming payment', returnUrl, returnUrl.toString());

      const { error } = await stripe.confirmPayment({
        elements,
        redirect: 'if_required',
        confirmParams: {
          return_url: returnUrl.toString(),
        },
      });

      if (error) {
        console.log(error);
        alert('There was an error');
        event.freeform.unlockSubmit();
      }
    });
  });
})();
