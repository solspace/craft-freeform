import type { StripePaymentElementOptions } from '@stripe/stripe-js';

import config from './elements.config';
import queries from './elements.queries';
import type { StripeFunctionConstructorProps } from './elements.types';

console.log(config);
const { fieldMapping } = config;

export const initStripe = (props: StripeFunctionConstructorProps) => async (container: HTMLDivElement) => {
  if (container.dataset.hidden === '') {
    return;
  }

  const { elementMap, form, stripe } = props;

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

      queries.paymentIntents.updateAmount(field.dataset.integration, form, id).then(({ id, client_secret }) => {
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

  const hasCustomMapping = fieldMapping.some(({ target }) => target === undefined);
  const listener = (source: string) => (event: Event) => {
    const value = (event.target as HTMLInputElement).value;
    console.log('setting', source, value);

    queries.customers.update({
      integration: field.dataset.integration,
      form,
      paymentIntentId: id,
      key: source,
      value,
    });
  };

  if (hasCustomMapping) {
    const allFields = form.querySelectorAll<HTMLInputElement>('input:not([type="hidden"]), select, textarea');

    allFields.forEach((field) => {
      field.addEventListener('change', listener(field.name));
    });
  } else {
    fieldMapping.forEach(({ source, target }) => {
      (form[target] as HTMLInputElement)?.addEventListener('change', listener(source));
    });
  }

  elementMap.set(field, {
    elements,
    paymentIntent: {
      id,
      secret,
    },
  });
};
