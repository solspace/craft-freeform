import { ajax } from '@lib/plugin/helpers/ajax';

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
  const formData = new FormData(form);
  formData.set('method', 'post');
  formData.delete('action');

  return formData;
};

const paymentIntents = {
  create: async (integration: string, form: HTMLFormElement, site: string) => {
    const formData = getFormData(form);

    return ajax.post<ClientSecretResponse>('/freeform/payments/stripe/payment-intents', formData, {
      headers: { 'FF-STRIPE-INTEGRATION': integration },
      queryParams: new URLSearchParams({ site }),
    });
  },
  updateAmount: async (
    integration: string,
    form: HTMLFormElement,
    id: string,
    site: string
  ): Promise<UpdateAmountResponse> => {
    const formData = getFormData(form);

    const { data } = await ajax.post<UpdateAmountResponse>(
      `/freeform/payments/stripe/payment-intents/${id}/amount`,
      formData,
      {
        headers: { 'FF-STRIPE-INTEGRATION': integration },
        queryParams: new URLSearchParams({ site }),
      }
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
  site: string;
};

const customers = {
  update: async ({ integration, form, paymentIntentId, site }: UpdateProps) => {
    const formData = getFormData(form);

    const { status } = await ajax.post(
      `/freeform/payments/stripe/payment-intents/${paymentIntentId}/customers`,
      formData,
      {
        headers: { 'FF-STRIPE-INTEGRATION': integration },
        queryParams: new URLSearchParams({ site }),
      }
    );

    return status;
  },
};

export default {
  paymentIntents,
  customers,
};
