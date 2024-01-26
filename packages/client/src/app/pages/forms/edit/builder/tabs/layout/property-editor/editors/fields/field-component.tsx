import React from 'react';
import { useSelector } from 'react-redux';
import { FormComponent } from '@components/form-controls';
import { useAppDispatch } from '@editor/store';
import { useValueUpdateGenerator } from '@editor/store/hooks/value-update-generator';
import { type Field, fieldActions } from '@editor/store/slices/layout/fields';
import { fieldSelectors } from '@editor/store/slices/layout/fields/fields.selectors';
import { useFieldType } from '@ff-client/queries/field-types';
import type { Property } from '@ff-client/types/properties';

type Props = {
  property: Property;
  field: Field;
  autoFocus?: boolean;
};

export const FieldComponent: React.FC<Props> = ({
  property,
  field,
  autoFocus,
}) => {
  const dispatch = useAppDispatch();
  const type = useFieldType(field.typeClass);

  const fieldState = useSelector(fieldSelectors.one(field.uid));
  const context = {
    id: fieldState.id,
    ...(fieldState?.properties || {}),
  };

  const generateUpdateHandler = useValueUpdateGenerator(
    type.properties,
    context,
    (handle, value) => {
      dispatch(
        fieldActions.edit({
          uid: field.uid,
          handle,
          value,
        })
      );
    }
  );

  const value = field.properties?.[property.handle];

  return (
    <FormComponent
      autoFocus={autoFocus}
      value={value}
      property={property}
      updateValue={generateUpdateHandler(property)}
      errors={field.errors?.[property.handle]}
      context={field}
    />
  );
};
