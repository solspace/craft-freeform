import events from '@lib/plugin/constants/event-types';
import type { FreeformEvent } from 'types/events';

import { initStripe } from './elements.init';
import type { StripeFunctionConstructorProps } from './elements.types';

let paymentsProcessed = false;

export const loadStripeContainers = (props: StripeFunctionConstructorProps) => async () => {
  const { form } = props;

  paymentsProcessed = false;

  let containers = form.querySelectorAll<HTMLDivElement>('.freeform-fieldtype-stripe:not([data-hidden])');
  containers.forEach(initStripe(props));

  containers = form.querySelectorAll<HTMLDivElement>('.freeform-fieldtype-stripe[data-hidden]');
  containers.forEach((container) => {
    container.addEventListener(events.rules.applied, () => {
      initStripe(props)(container);
    });
  });
};

export const submitStripe = (props: StripeFunctionConstructorProps) => async (event: FreeformEvent) => {
  if (paymentsProcessed) {
    return;
  }

  const { elementMap, stripe, form } = props;

  const containers = form.querySelectorAll<HTMLDivElement>('.freeform-fieldtype-stripe:not([data-hidden])');
  containers.forEach(async (container) => {
    const field = container.querySelector<HTMLDivElement>('.freeform-stripe-card');
    const {
      empty,
      elements,
      paymentIntent: { id, secret },
    } = elementMap.get(field);

    const isRequired = field.dataset.required !== undefined;
    if (empty && !isRequired) {
      return;
    }

    event.preventDefault();
    event.freeform.lockSubmit();

    const token = await event.freeform.quickSave(secret, id);
    if (!token) {
      event.freeform.unlockSubmit();
      return;
    }

    const returnUrl = new URL('/freeform/payments/stripe/callback', window.location.origin);
    returnUrl.searchParams.append('integration', field.dataset.integration);
    returnUrl.searchParams.append('token', token);

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
};
