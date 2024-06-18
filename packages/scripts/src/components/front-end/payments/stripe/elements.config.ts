import type { Stripe } from '@stripe/stripe-js';
import { loadStripe } from '@stripe/stripe-js';

import type { Config } from './elements.types';

const stripeInstances = new Map<string, Stripe>();

const config = (container: HTMLDivElement): Config | undefined => {
  const configElement = container.querySelector<HTMLScriptElement>('[data-freeform-stripe-card][data-config]');
  if (!configElement) {
    return undefined;
  }

  const config = JSON.parse(configElement.dataset.config) as Config;

  return {
    ...config,
    getStripeInstance: (): Stripe => stripeInstances.get(config.apiKey),
    loadStripe: async (): Promise<Stripe> => {
      if (!stripeInstances.has(config.apiKey)) {
        const stripeInstance = await loadStripe(config.apiKey);
        stripeInstances.set(config.apiKey, stripeInstance);
      }

      return stripeInstances.get(config.apiKey);
    },
  };
};

export default config;
