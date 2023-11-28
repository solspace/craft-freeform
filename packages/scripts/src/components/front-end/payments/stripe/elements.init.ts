import { dispatchCustomEvent } from '@lib/plugin/helpers/event-handling';
import type { StripePaymentElementOptions } from '@stripe/stripe-js';

import config from './elements.config';
import type { StripeAppearanceEvent } from './elements.events';
import events from './elements.events';
import queries from './elements.queries';
import type { StripeFunctionConstructorProps } from './elements.types';

const { fieldMapping } = config;

export const initStripe = (props: StripeFunctionConstructorProps) => async (container: HTMLDivElement) => {
  if (container.dataset.hidden === '') {
    return;
  }

  const { elementMap, form, stripe } = props;

  const field = container.querySelector<HTMLDivElement>('.freeform-stripe-card');
  if (elementMap.has(field)) {
    return;
  }

  field.innerHTML = 'Loading...';

  const { id, secret } = await queries.paymentIntents.create(field.dataset.integration, form);

  (field.previousSibling as HTMLInputElement).value = id;

  const event = dispatchCustomEvent<StripeAppearanceEvent>(events.render.appearance, { bubbles: true }, [field]);

  let elements = stripe.elements({
    clientSecret: secret,
    appearance: event.appearance,
  });

  const paymentElementOptions: StripePaymentElementOptions = {
    layout: 'auto',
  };

  let paymentElement = elements.create('payment', paymentElementOptions);
  paymentElement.mount(field);
  paymentElement.on('change', () => {
    // console.log('payment change', event);
  });

  const amountFieldHandles = field.dataset.amountFields?.split(';') ?? [];
  if (amountFieldHandles.length > 0) {
    amountFieldHandles.forEach((amountFieldHandle) => {
      (form[amountFieldHandle] as HTMLInputElement)?.addEventListener('change', () => {
        const paymentIntentId = elementMap.get(field).paymentIntent.id;

        queries.paymentIntents
          .updateAmount(field.dataset.integration, form, paymentIntentId)
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
    });
  }

  const hasCustomMapping = fieldMapping.some(({ target }) => target === undefined);
  const listener = (source: string) => (event: Event) => {
    const value = (event.target as HTMLInputElement).value;

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
