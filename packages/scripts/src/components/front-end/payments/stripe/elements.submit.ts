import events from '@lib/plugin/constants/event-types';
import type { FreeformEvent } from 'types/events';

import config from './elements.config';
import { initStripe } from './elements.init';
import { selectHiddenContainers, selectVisibleContainers } from './elements.selectors';
import type { StripeFunctionConstructorProps } from './elements.types';

export const loadStripeContainers = (props: StripeFunctionConstructorProps) => async () => {
  const { form } = props;

  selectVisibleContainers(form).forEach(initStripe(props));
  selectHiddenContainers(form).forEach((container) => {
    container.addEventListener(events.rules.applied, () => {
      initStripe(props)(container);
    });
  });
};

export const submitStripe = (props: StripeFunctionConstructorProps) => async (event: FreeformEvent) => {
  event.addCallback(async () => {
    const { elementMap, form } = props;

    const containers = selectVisibleContainers(form);
    for (const container of containers) {
      const { getStripeInstance, required, integration } = config(container);
      const field = container.querySelector<HTMLDivElement>('[data-freeform-stripe-card]');
      const {
        empty,
        elements,
        paymentIntent: { id, secret },
      } = elementMap.get(field);

      if (empty && !required) {
        return;
      }

      window.freeform = {
        disableCaptcha: true,
      };

      const token = await event.freeform.quickSave(secret, id);
      if (!token) {
        return false;
      }

      const returnUrl = new URL('/freeform/payments/stripe/callback', window.location.origin);
      returnUrl.searchParams.append('integration', integration);
      returnUrl.searchParams.append('token', token);

      const stripe = getStripeInstance();
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: returnUrl.toString(),
        },
      });

      if (error) {
        event.freeform._renderFormErrors([error.message]);
      }

      return false;
    }
  }, 100);
};
