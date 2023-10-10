import { useCallback } from 'react';
import type { MiddlewareInjectCallback } from '@components/middleware/middleware';
import { applyMiddleware } from '@components/middleware/middleware';
import type { PropertyValueCollection } from '@ff-client/types/fields';
import type { GenericValue, Property } from '@ff-client/types/properties';

export type ValueUpdateHandler = <T>(value: T) => void;

type ValueUpdateHandlerGenerator = (property: Property) => ValueUpdateHandler;

export const useValueUpdateGenerator = (
  siblingProperties: Property[],
  state: PropertyValueCollection,
  updateValueCallback: (key: string, value: GenericValue) => void
): ValueUpdateHandlerGenerator => {
  return useCallback(
    (property) => {
      if (property.disabled) {
        return;
      }

      return (value) => {
        const injectCallback: MiddlewareInjectCallback = (key, value) => {
          const prop = siblingProperties.find((prop) => prop.handle === key);
          if (!prop || prop.disabled) {
            return;
          }

          updateValueCallback(
            prop.handle,
            applyMiddleware(value, prop.middleware, state)
          );
        };

        updateValueCallback(
          property.handle,
          applyMiddleware(value, property.middleware, state, injectCallback)
        );
      };
    },
    [siblingProperties, state, updateValueCallback]
  );
};
