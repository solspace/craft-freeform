import type { StripeElementsOptionsClientSecret, StripePaymentElementOptions } from '@stripe/stripe-js';

import type { ElementConfig } from './elements.types';

type AppearanceReturnType = {
  elementOptions: StripeElementsOptionsClientSecret;
  paymentOptions: StripePaymentElementOptions;
};

export const generateElementOptions = (config: ElementConfig): AppearanceReturnType => {
  const { theme = 'stripe', layout = 'tabs', floatingLabels = false } = config;

  return {
    elementOptions: {
      appearance: {
        theme,
        labels: floatingLabels ? 'floating' : 'above',
        variables: {},
      },
    },
    paymentOptions: {
      layout: {
        type: layout === 'tabs' ? 'tabs' : 'accordion',
        defaultCollapsed: false,
        radios: layout === 'accordion-radios',
        spacedAccordionItems: layout !== 'accordion-radios',
      },
    },
  };
};
