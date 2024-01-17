import type { RootState } from '@editor/store';
import { createSelector } from '@reduxjs/toolkit';

import type { IntegrationEntry } from '.';

interface NestedObject {
  type: string;
  value: string;
}

interface FieldMappingObject {
  [key: string]: NestedObject;
}

export const integrationSelectors = {
  one:
    (id: number) =>
    (state: RootState): IntegrationEntry | undefined =>
      state.integrations.find((item) => item.id === id),
  isFieldInIntegrations: (uid: string) =>
    createSelector(
      (state: RootState) => state.integrations,
      (integrations) => {
        return Boolean(
          integrations
            .filter((integration) => integration.enabled)
            .find((obj) =>
              obj.properties.some((property) => {
                if (property.type === 'field') {
                  return obj.values[property.handle] === uid;
                }

                if (property.type === 'fieldMapping') {
                  const nestedObject = obj.values[
                    property.handle
                  ] as FieldMappingObject;

                  return Object.values(nestedObject).some(
                    (nestedValue) => nestedValue.value === uid
                  );
                }

                return false;
              })
            )
        );
      }
    ),
} as const;
