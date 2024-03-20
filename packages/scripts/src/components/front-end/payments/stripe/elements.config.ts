import type { Stripe } from '@stripe/stripe-js';
import { loadStripe } from '@stripe/stripe-js';

import type { Config } from './elements.types';

const stripeInstances = new Map<string, Stripe>();

const config = (container: HTMLDivElement): Config | undefined => {
  const configElement = container.querySelector<HTMLScriptElement>('script[data-stripe-config]');
  if (!configElement) {
    return undefined;
  }

  const config = JSON.parse(configElement.innerText) as Config;

  return {
    ...config,
    getStripe: async (): Promise<Stripe> => {
      if (!stripeInstances.has(config.apiKey)) {
        const stripeInstance = await loadStripe(config.apiKey);
        stripeInstances.set(config.apiKey, stripeInstance);
      }

      return stripeInstances.get(config.apiKey);
    },
  };
};

export default config;
