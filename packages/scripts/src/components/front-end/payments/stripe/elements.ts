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

type StripeElement = {
  elements: StripeElements;
  paymentIntent: {
    id: string;
    secret: string;
  };
};

(async () => {
  let paymentsProcessed = false;

  const { formId, apiKey } = config;

  const elementMap = new WeakMap<HTMLDivElement, StripeElement>();
  const stripe = await loadStripe(apiKey);

  const form = document.querySelector<HTMLFormElement>(`form[data-id="${formId}"]`);
  if (!form) {
    return;
  }

  const initStripe = async (container: HTMLDivElement) => {
    if (container.dataset.hidden === '') {
      return;
    }

    console.log(JSON.stringify(container.dataset));

    const field = container.querySelector<HTMLDivElement>('.freeform-stripe-card');
    if (elementMap.has(field)) {
      return;
    }

    field.innerHTML = 'Loading...';

    const { id, secret } = await queries.paymentIntents.create(field.dataset.integration);

    (field.previousSibling as HTMLInputElement).value = id;

    const elements = stripe.elements({
      clientSecret: secret,
    });

    const paymentElementOptions: StripePaymentElementOptions = {
      layout: 'tabs',
    };

    const paymentElement = elements.create('payment', paymentElementOptions);
    paymentElement.mount(field);
    paymentElement.on('change', (event) => {
      console.log('payment change', event);
    });

    elementMap.set(field, {
      elements,
      paymentIntent: {
        id,
        secret,
      },
    });
  };

  const loadContainers = async () => {
    paymentsProcessed = false;
    let containers = form.querySelectorAll<HTMLDivElement>('.freeform-fieldtype-stripe:not([data-hidden])');
    console.log(containers);
    containers.forEach(initStripe);

    containers = form.querySelectorAll<HTMLDivElement>('.freeform-fieldtype-stripe[data-hidden]');
    containers.forEach((container) => {
      container.addEventListener(events.rules.applied, () => {
        initStripe(container);
      });
    });
  };

  form.addEventListener(events.form.ready, loadContainers);
  form.addEventListener(events.form.reset, loadContainers);
  form.addEventListener(events.form.submit, async (event: FreeformEvent) => {
    if (paymentsProcessed) {
      return;
    }

    const containers = form.querySelectorAll<HTMLDivElement>('.freeform-fieldtype-stripe:not([data-hidden])');
    if (containers.length > 0) {
      event.preventDefault();
      event.freeform.lockSubmit();
    }

    containers.forEach(async (container) => {
      const field = container.querySelector<HTMLDivElement>('.freeform-stripe-card');
      const {
        elements,
        paymentIntent: { id },
      } = elementMap.get(field);

      const token = await event.freeform.quickSave(id);
      if (!token) {
        event.freeform.unlockSubmit();
        return;
      }

      const returnUrl = new URL('/freeform/payments/stripe/callback', window.location.origin);
      returnUrl.searchParams.append('integration', field.dataset.integration);
      returnUrl.searchParams.append('token', token);

      console.log('confirming payment');

      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: returnUrl.toString(),
        },
      });

      if (error) {
        event.freeform._renderFormErrors([error.message]);
        event.freeform.unlockSubmit();
      }
    });
  });
})();
