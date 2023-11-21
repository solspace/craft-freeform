import events from '@lib/plugin/constants/event-types';
import type { StripeElements, StripePaymentElementOptions } from '@stripe/stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import type { FreeformEvent } from 'types/events';

import queries from './elements.queries';
import elementsQueries from './elements.queries';

const formId = '{{ formId }}';

type Config = {
  formId: string;
  apiKey: string;
  fieldMapping: Array<{ source: string; target: string }>;
  csrf: {
    name: string;
    value: string;
  };
};

export const config: Config = JSON.parse(document.getElementById(`ff-conf-${formId}`).innerText);
console.log(config);

type StripeElement = {
  elements: StripeElements;
  paymentIntent: {
    id: string;
    secret: string;
  };
};

(async () => {
  let paymentsProcessed = false;

  const { formId, apiKey, fieldMapping } = config;

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

    const { id, secret } = await queries.paymentIntents.create(field.dataset.integration, form);

    (field.previousSibling as HTMLInputElement).value = id;

    let elements = stripe.elements({
      clientSecret: secret,
    });

    const paymentElementOptions: StripePaymentElementOptions = {
      layout: 'auto',
    };

    let paymentElement = elements.create('payment', paymentElementOptions);
    paymentElement.mount(field);
    paymentElement.on('change', (event) => {
      console.log('payment change', event);
    });

    const amountFieldHandle = field.dataset.amountField;
    if (amountFieldHandle) {
      (form[amountFieldHandle] as HTMLInputElement)?.addEventListener('change', (event) => {
        const value = (event.target as HTMLInputElement).value;
        console.log('setting amount', value);

        elementsQueries.paymentIntents
          .updateAmount(field.dataset.integration, form, id)
          .then(({ id, client_secret }) => {
            if (client_secret) {
              paymentElement.unmount();
              elements = stripe.elements({ clientSecret: client_secret });

              paymentElement = elements.create('payment', paymentElementOptions);
              paymentElement.mount(field);

              elementMap.set(field, {
                elements,
                paymentIntent: {
                  id,
                  secret: client_secret,
                },
              });
            } else {
              elements.fetchUpdates();
            }
          });
      });
    }

    fieldMapping.forEach(({ source, target }) => {
      console.log(form[target]);
      (form[target] as HTMLInputElement)?.addEventListener('change', (event) => {
        const value = (event.target as HTMLInputElement).value;
        console.log('setting', source, value);

        elementsQueries.customers.update({
          integration: field.dataset.integration,
          form,
          paymentIntentId: id,
          key: source,
          value,
        });
      });
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
  form.addEventListener(events.form.ajaxAfterSubmit, loadContainers);
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
