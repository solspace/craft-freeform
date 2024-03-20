import events from '@lib/plugin/constants/event-types';
import type { FreeformEvent } from 'types/events';

import config from './elements.config';
import { initStripe } from './elements.init';
import { selectHiddenContainers, selectVisibleContainers } from './elements.selectors';
import type { StripeFunctionConstructorProps } from './elements.types';

let paymentsProcessed = false;

export const loadStripeContainers = (props: StripeFunctionConstructorProps) => async () => {
  const { form } = props;

  paymentsProcessed = false;

  selectVisibleContainers(form).forEach(initStripe(props));
  selectHiddenContainers(form).forEach((container) => {
    container.addEventListener(events.rules.applied, () => {
      initStripe(props)(container);
    });
  });
};

export const submitStripe = (props: StripeFunctionConstructorProps) => async (event: FreeformEvent) => {
  if (paymentsProcessed) {
    return;
  }

  const { elementMap, form } = props;

  const containers = selectVisibleContainers(form);
  for (const container of containers) {
    const { getStripe, required, integration } = config(container);
    const field = container.querySelector<HTMLDivElement>('[data-freeform-stripe-card]');
    const {
      empty,
      elements,
      paymentIntent: { id, secret },
    } = elementMap.get(field);

    if (empty && !required) {
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
    returnUrl.searchParams.append('integration', integration);
    returnUrl.searchParams.append('token', token);

    const stripe = await getStripe();
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
  }
};
