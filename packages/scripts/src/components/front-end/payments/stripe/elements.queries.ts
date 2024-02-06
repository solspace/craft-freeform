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

const getFormData = (form: HTMLFormElement): FormData => {
  const { csrf } = config(form);

  const formData = new FormData(form);
  formData.set('method', 'post');
  formData.set(csrf.name, csrf.value);
  formData.delete('action');

  return formData;
};

const paymentIntents = {
  create: async (integration: string, form: HTMLFormElement) => {
    const formData = getFormData(form);

    return axios.post<ClientSecretResponse>('/freeform/payments/stripe/payment-intents', formData, {
      headers: { 'FF-STRIPE-INTEGRATION': integration },
    });
  },
  updateAmount: async (integration: string, form: HTMLFormElement, id: string): Promise<UpdateAmountResponse> => {
    const formData = getFormData(form);

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
    const formData = getFormData(form);

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
