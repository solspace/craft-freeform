import { useCallback } from 'react';
import { applyMiddleware } from '@components/middleware/middleware';
import { useAppDispatch } from '@editor/store';
import { formActions } from '@editor/store/slices/form';
import type { Property } from '@ff-client/types/properties';

export type ValueUpdateHandler = <T>(value: T) => void;

type ValueUpdateHandlerGenerator = (property: Property) => ValueUpdateHandler;

export const useValueUpdateGenerator = (
  namespace: string
): ValueUpdateHandlerGenerator => {
  const dispatch = useAppDispatch();

  const updateValueHandlerGenerator: ValueUpdateHandlerGenerator = useCallback(
    (property) => {
      return (value) => {
        dispatch((dispatch, getState) => {
          dispatch(
            formActions.modifySettings({
              namespace,
              key: property.handle,
              value: applyMiddleware(value, property.middleware, getState),
            })
          );
        });
      };
    },
    [namespace, dispatch]
  );

  return updateValueHandlerGenerator;
};
