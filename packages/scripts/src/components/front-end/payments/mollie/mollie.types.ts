export interface MollieElement {
  empty?: boolean;
  paymentId?: string;
  checkoutUrl?: string;
  components?: unknown;
  mollie?: unknown;
}

export interface MollieFunctionConstructorProps {
  elementMap: WeakMap<HTMLDivElement, MollieElement>;
  form: HTMLFormElement;
}

export interface MollieConfig {
  apiKey: string;
  site: string;
  required: boolean;
  integration: string;
  currency: string;
  description: string;
  redirectUrl: string;
  webhookUrl: string;
  testMode: boolean;
}

export interface MolliePaymentData {
  amount: {
    currency: string;
    value: string;
  };
  description: string;
  redirectUrl: string;
  webhookUrl: string;
  metadata?: Record<string, unknown>;
}
