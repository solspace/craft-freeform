import type { Stripe } from "@stripe/stripe-js";
import { loadStripe } from "@stripe/stripe-js/pure";
import type { Config } from "./elements.types";

const selector = "[data-freeform-stripe-card][data-config]";
const stripeInstances = new Map<string, Stripe>();

const config = (container: HTMLDivElement): Config => {
  const configElement = container.querySelector<HTMLScriptElement>(selector);
  if (!configElement) {
    throw new Error("Stripe config element not found");
  }

  const config = JSON.parse(configElement.dataset.config || "{}") as Config;

  return {
    ...config,
    loadStripe: async (): Promise<Stripe> => {
      if (!stripeInstances.has(config.apiKey)) {
        const stripeInstance = await loadStripe(config.apiKey);
        stripeInstances.set(config.apiKey, stripeInstance!);
      }

      return stripeInstances.get(config.apiKey)!;
    },
  };
};

export default config;
