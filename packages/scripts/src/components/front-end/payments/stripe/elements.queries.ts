import type { AxiosResponse } from 'axios';
import axios from 'axios';

import { config } from './elements';

type ClientSecretProps = {
  integration: string;
};

type ClientScretResponse = {
  paymentIntentId: string;
  clientSecret: string;
};

const clientSecret = async (integration: string) => {
  const { data } = await axios.post<ClientSecretProps, AxiosResponse<ClientScretResponse>>(
    '/freeform/payments/stripe/payment-intents',
    {
      integration,
      [config.csrf.name]: config.csrf.value,
    }
  );

  return data;
};

export default {
  paymentIntents: {
    clientSecret,
  },
};
