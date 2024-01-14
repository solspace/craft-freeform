import type { RootState } from '@editor/store';

import type { IntegrationEntry } from '.';

type IntegrationValues = {
  emailField?: string;
  optInField?: string;
  attributeMapping?: Record<string, { value: string }>;
  customerMapping?: Record<string, { value: string }>;
  addressMapping?: Record<string, { value: string }>;
};

const allowedTypes = ['email-marketing', 'elements', 'payment-gateways'];

export const integrationSelectors = {
  one:
    (id: number) =>
    (state: RootState): IntegrationEntry | undefined =>
      state.integrations.find((item) => item.id === id),
  isFieldInIntegrations:
    (uid: string) =>
    (state: RootState): boolean =>
      state.integrations.some((obj) => {
        const { type, values } = obj as {
          type: string;
          values: IntegrationValues;
        };

        if (!allowedTypes.includes(type) || !values) {
          return false;
        }

        switch (type) {
          case 'email-marketing':
            return values.emailField === uid || values.optInField === uid;

          case 'elements':
            return Object.values(values.attributeMapping || {}).some(
              (attr) => attr.value === uid
            );

          case 'payment-gateways': {
            const { customerMapping = {}, addressMapping = {} } = values || {};
            return (
              Object.values(customerMapping).some(
                (customerAttr) => customerAttr.value === uid
              ) ||
              Object.values(addressMapping).some(
                (addressAttr) => addressAttr.value === uid
              )
            );
          }

          default:
            return false;
        }
      }),
} as const;
