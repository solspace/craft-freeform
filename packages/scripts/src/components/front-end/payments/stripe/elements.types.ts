import type { Stripe, StripeElements } from '@stripe/stripe-js';

export type Config = {
  formId: string;
  apiKey: string;
  fieldMapping: Array<{ source: string; target: string }>;
  csrf: {
    name: string;
    value: string;
  };
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
  stripe: Stripe;
  form: HTMLFormElement;
};

export type StripeTheme = 'stripe' | 'night' | 'flat';
export type StripeLayout = 'tabs' | 'accordion' | 'accordion-radios';

export type ElementConfig = {
  theme: StripeTheme;
  layout: StripeLayout;
  floatingLabels: boolean;
};
