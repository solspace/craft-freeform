import type { StripeElementsOptionsClientSecret, StripePaymentElementOptions } from '@stripe/stripe-js';

const prefix: string = 'freeform-stripe';

export type StripeAppearanceEvent = {
  elementOptions: StripeElementsOptionsClientSecret;
  paymentOptions: StripePaymentElementOptions;
};

const events = {
  load: `${prefix}-load`,
  render: {
    appearance: `${prefix}-appearance`,
  },
} as const;

export default events;
