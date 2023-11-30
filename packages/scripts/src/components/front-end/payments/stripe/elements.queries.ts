import axios from 'axios';

import config from './elements.config';

type ClientSecretResponse = {
  id: string;
  secret: string;
};

type UpdateAmountResponse = {
  id?: string;
  client_secret?: string;
  amount: number;
};

const paymentIntents = {
  create: async (integration: string, form: HTMLFormElement): Promise<ClientSecretResponse> => {
    const formData = new FormData(form);
    formData.set('method', 'post');
    formData.delete('action');

    const { data } = await axios.post<ClientSecretResponse>('/freeform/payments/stripe/payment-intents', formData, {
      headers: { 'FF-STRIPE-INTEGRATION': integration },
    });

    return data;
  },
  updateAmount: async (integration: string, form: HTMLFormElement, id: string): Promise<UpdateAmountResponse> => {
    const formData = new FormData(form);
    formData.set('method', 'post');
    formData.set(config.csrf.name, config.csrf.value);
    formData.delete('action');

    const { data } = await axios.post<UpdateAmountResponse>(
      `/freeform/payments/stripe/payment-intents/${id}/amount`,
      formData,
      { headers: { 'FF-STRIPE-INTEGRATION': integration } }
    );

    return data;
  },
};

type UpdateProps = {
  integration: string;
  form: HTMLFormElement;
  paymentIntentId: string;
  key: string;
  value: string;
};

const customers = {
  update: async ({ integration, form, paymentIntentId }: UpdateProps) => {
    const formData = new FormData(form);
    formData.set('method', 'post');
    formData.delete('action');

    const { status } = await axios.post(
      `/freeform/payments/stripe/payment-intents/${paymentIntentId}/customers`,
      formData,
      {
        headers: { 'FF-STRIPE-INTEGRATION': integration },
      }
    );

    return status;
  },
};

export default {
  paymentIntents,
  customers,
};
