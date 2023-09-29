import { useCallback } from 'react';
import type { MiddlewareInjectCallback } from '@components/middleware/middleware';
import { applyMiddleware } from '@components/middleware/middleware';
import { useAppDispatch } from '@editor/store';
import { formActions } from '@editor/store/slices/form';
import { useQueryFormSettings } from '@ff-client/queries/forms';
import type { Property } from '@ff-client/types/properties';

export type ValueUpdateHandler = <T>(value: T) => void;

type ValueUpdateHandlerGenerator = (property: Property) => ValueUpdateHandler;

export const useFormSettingUpdateGenerator = (
  namespace: string
): ValueUpdateHandlerGenerator => {
  const dispatch = useAppDispatch();

  const { data } = useQueryFormSettings();

  return useCallback(
    (property) => {
      return (value) => {
        dispatch((dispatch, getState) => {
          const injectCallback: MiddlewareInjectCallback = (key, value) => {
            const targetProperty = data
              .find((setting) => setting.handle === namespace)
              .properties.find((prop) => prop.handle === key);

            dispatch(
              formActions.modifySettings({
                namespace,
                key,
                value: applyMiddleware(
                  value,
                  targetProperty.middleware,
                  getState().form.settings[namespace]
                ),
              })
            );
          };

          dispatch(
            formActions.modifySettings({
              namespace,
              key: property.handle,
              value: applyMiddleware(
                value,
                property.middleware,
                getState().form.settings[namespace],
                injectCallback
              ),
            })
          );
        });
      };
    },
    [namespace, dispatch]
  );
};
