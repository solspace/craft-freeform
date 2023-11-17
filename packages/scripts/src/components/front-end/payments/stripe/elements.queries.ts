import axios from 'axios';

import { config } from './elements';

type ClientSecretResponse = {
  id: string;
  secret: string;
};

const create = async (integration: string): Promise<ClientSecretResponse> => {
  const { data } = await axios.post<ClientSecretResponse>(
    '/freeform/payments/stripe/payment-intents',
    {
      [config.csrf.name]: config.csrf.value,
    },
    { headers: { 'FF-STRIPE-INTEGRATION': integration } }
  );

  return data;
};

type UpdateAmountResponse = {
  amount: number;
};

const update = async (integration: string, id: string, amount: number): Promise<UpdateAmountResponse> => {
  const { data } = await axios.patch<UpdateAmountResponse>(
    `/freeform/payments/stripe/payment-intents/${id}`,
    {
      amount,
      [config.csrf.name]: config.csrf.value,
    },
    { headers: { 'FF-STRIPE-INTEGRATION': integration } }
  );

  return data;
};

export default {
  paymentIntents: {
    create,
    update,
  },
};
