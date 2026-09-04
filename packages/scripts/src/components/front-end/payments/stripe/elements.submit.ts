import events from "@lib/plugin/constants/event-types";
import type { FreeformEvent } from "types/events";

import config from "./elements.config";
import { initStripe } from "./elements.init";
import {
  selectHiddenContainers,
  selectVisibleContainers,
} from "./elements.selectors";
import type { StripeFunctionConstructorProps } from "./elements.types";

const cardSelector = "[data-freeform-stripe-card]";

export const loadStripeContainers =
  (props: StripeFunctionConstructorProps) => async () => {
    const { form } = props;

    selectVisibleContainers(form).forEach(initStripe(props));
    selectHiddenContainers(form).forEach((container) => {
      container.addEventListener(events.rules.applied, () => {
        initStripe(props)(container);
      });
    });
  };

export const submitStripe =
  (props: StripeFunctionConstructorProps) => (event: FreeformEvent) => {
    if (event.isBackButtonPressed || event.defaultPrevented) {
      return;
    }

    const { elementMap, form } = props;
    const containers = selectVisibleContainers(form);

    for (const container of containers) {
      const { required, integration, site } = config(container);
      const field = container.querySelector<HTMLDivElement>(cardSelector)!;

      const element = elementMap.get(field);
      if (!element) {
        throw new Error("Stripe element not found for container");
      }

      const {
        empty,
        stripe,
        elements,
        paymentIntent: { id, secret },
      } = element;

      if (empty && !required) {
        continue;
      }

      // Must be initiated synchronously while user activation is still active.
      const submitPromise = elements.submit();

      event.addCallback(async () => {
        const { error: submitError } = await submitPromise;
        if (submitError) {
          event.freeform._renderFormErrors([
            submitError.message ||
              "An error occurred while submitting the payment.",
          ]);
          event.freeform._scrollToForm();

          return false;
        }

        const token = await event.freeform.quickSave(secret, id);

        if (token === false) {
          return true;
        }

        if (token === undefined) {
          return false;
        }

        const returnUrl = new URL(
          "/freeform/payments/stripe/callback",
          window.location.origin,
        );
        returnUrl.searchParams.append("integration", integration);
        returnUrl.searchParams.append("stripe_token", token);
        returnUrl.searchParams.append("site", site);

        const { error } = await stripe.confirmPayment({
          elements,
          confirmParams: {
            return_url: returnUrl.toString(),
          },
        });

        if (error) {
          event.freeform._renderFormErrors([
            error.message || "An error occurred while confirming the payment.",
          ]);
          event.freeform._scrollToForm();
        }

        return false;
      }, 100);

      // Preserve the current behavior of processing the first applicable
      // visible Stripe field.
      return;
    }
  };
