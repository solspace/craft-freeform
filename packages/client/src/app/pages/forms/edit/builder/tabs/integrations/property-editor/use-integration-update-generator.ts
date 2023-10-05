import { useCallback } from 'react';
import type { MiddlewareInjectCallback } from '@components/middleware/middleware';
import { applyMiddleware } from '@components/middleware/middleware';
import { useAppDispatch } from '@editor/store';
import { integrationActions } from '@editor/store/slices/integrations';
import type { Integration } from '@ff-client/types/integrations';
import type { Property } from '@ff-client/types/properties';

export type ValueUpdateHandler = <T>(value: T) => void;

type ValueUpdateHandlerGenerator = (property: Property) => ValueUpdateHandler;

export const useIntegrationUpdateGenerator = (
  integration: Integration
): ValueUpdateHandlerGenerator => {
  const dispatch = useAppDispatch();

  return useCallback(
    (property) => {
      if (property.disabled) {
        return;
      }

      return (value) => {
        dispatch((dispatch, getState) => {
          const injectCallback: MiddlewareInjectCallback = (key, value) => {
            const targetProperty = integration.properties.find(
              (prop) => prop.handle === key
            );

            if (!targetProperty || targetProperty.disabled) {
              return;
            }

            dispatch(
              integrationActions.modify({
                id: integration.id,
                key,
                value: applyMiddleware(
                  value,
                  targetProperty.middleware,
                  getState().integrations.find((i) => i.id === integration.id)
                ),
              })
            );
          };

          dispatch(
            integrationActions.modify({
              id: integration.id,
              key: property.handle,
              value: applyMiddleware(
                value,
                property.middleware,
                getState().integrations.find((i) => i.id === integration.id),
                injectCallback
              ),
            })
          );
        });
      };
    },
    [integration, dispatch]
  );
};
