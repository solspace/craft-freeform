import type { Stripe, StripeElements } from '@stripe/stripe-js';

export type Config = {
  apiKey: string;
  required: boolean;
  integration: string;
  amountFields: string[];
  layout: StripeLayout;
  theme: StripeTheme;
  floatingLabels: boolean;
  fieldMapping: Array<{ source: string; target: string }>;
  getStripeInstance: () => Stripe;
  loadStripe: () => Promise<Stripe>;
};

export type StripeElement = {
  empty: boolean;
  elements: StripeElements;
  paymentIntent: {
    id: string;
    secret: string;
  };
};

export type StripeFunctionConstructorProps = {
  elementMap: WeakMap<HTMLDivElement, StripeElement>;
  form: HTMLFormElement;
};

export type StripeTheme = 'stripe' | 'night' | 'flat';
export type StripeLayout = 'tabs' | 'accordion' | 'accordion-radios';

export type ElementConfig = {
  theme: StripeTheme;
  layout: StripeLayout;
  floatingLabels: boolean;
};
