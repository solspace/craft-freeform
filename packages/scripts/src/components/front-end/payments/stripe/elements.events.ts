import type { Appearance } from '@stripe/stripe-js';

const prefix: string = 'freeform-stripe';

export type StripeAppearanceEvent = {
  appearance?: Appearance;
};

const events = {
  render: {
    appearance: `${prefix}-appearance`,
  },
} as const;

export default events;
