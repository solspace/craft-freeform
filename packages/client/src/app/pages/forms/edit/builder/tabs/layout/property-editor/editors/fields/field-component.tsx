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
};

export const FieldComponent: React.FC<Props> = ({ property, field }) => {
  const dispatch = useAppDispatch();
  const type = useFieldType(field.typeClass);
  const state = useSelector(fieldSelectors.one(field.uid))?.properties || {};

  const generateUpdateHandler = useValueUpdateGenerator(
    type.properties,
    state,
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
      value={value}
      property={property}
      updateValue={generateUpdateHandler(property)}
      errors={field.errors?.[property.handle]}
      context={field}
    />
  );
};
