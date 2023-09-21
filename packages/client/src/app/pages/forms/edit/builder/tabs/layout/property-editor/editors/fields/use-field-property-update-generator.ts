import { useCallback } from 'react';
import type { MiddlewareInjectCallback } from '@components/middleware/middleware';
import { applyMiddleware } from '@components/middleware/middleware';
import { useAppDispatch } from '@editor/store';
import type { Field } from '@editor/store/slices/layout/fields';
import { fieldActions } from '@editor/store/slices/layout/fields';
import { useFetchFieldTypes } from '@ff-client/queries/field-types';
import type { Property } from '@ff-client/types/properties';

export type ValueUpdateHandler = <T>(value: T) => void;

type ValueUpdateHandlerGenerator = (property: Property) => ValueUpdateHandler;

export const useFieldPropertyUpdateGenerator = (
  field: Field
): ValueUpdateHandlerGenerator => {
  const dispatch = useAppDispatch();

  const { data: fieldTypes } = useFetchFieldTypes();

  return useCallback(
    (property) => {
      return (value) => {
        dispatch((dispatch, getState) => {
          const injectCallback: MiddlewareInjectCallback = (key, value) => {
            const targetProperty = fieldTypes
              .find((type) => type.typeClass === field.typeClass)
              ?.properties.find((prop) => prop.handle === key);

            if (!targetProperty) {
              return;
            }

            dispatch(
              fieldActions.edit({
                uid: field.uid,
                handle: key,
                value: applyMiddleware(
                  value,
                  targetProperty.middleware,
                  getState().layout.fields.find((f) => f.uid === field.uid)
                    .properties
                ),
              })
            );
          };

          dispatch(
            fieldActions.edit({
              uid: field.uid,
              handle: property.handle,
              value: applyMiddleware(
                value,
                property.middleware,
                getState().layout.fields.find((f) => f.uid === field.uid)
                  .properties,
                injectCallback
              ),
            })
          );
        });
      };
    },
    [field, dispatch]
  );
};
