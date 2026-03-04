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
    if (event.isBackButtonPressed) {
      return;
    }

    const { elementMap, form } = props;

    const containers = selectVisibleContainers(form);
    for (const container of containers) {
      const { required, integration, site } = config(container);
      const field = container.querySelector<HTMLDivElement>('[data-freeform-stripe-card]');
      const {
        empty,
        stripe,
        elements,
        paymentIntent: { id, secret },
      } = elementMap.get(field);

      if (empty && !required) {
        continue;
      }

      const token = await event.freeform.quickSave(secret, id);
      // If token is false, we proceed, because stripe is not meant to execute
      if (token === false) {
        return true;
      }

      // If token is undefined, we halt submit, because it could not save
      if (token === undefined) {
        return false;
      }

      const returnUrl = new URL('/freeform/payments/stripe/callback', window.location.origin);
      returnUrl.searchParams.append('integration', integration);
      returnUrl.searchParams.append('stripe_token', token);
      returnUrl.searchParams.append('site', site);

      const { error: submitError } = await elements.submit();
      if (submitError) {
        event.freeform._renderFormErrors([submitError.message]);
        event.freeform._scrollToForm();
        return false;
      }

      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: returnUrl.toString(),
        },
      });

      if (error) {
        event.freeform._renderFormErrors([error.message]);
        event.freeform._scrollToForm();
      }

      return false;
    }
  }, 100);
};
