import React from 'react';
import type * as ControlTypes from '@components/form-controls';
import { FormComponent } from '@components/form-controls';
import { useAppDispatch } from '@editor/store';
import type { Field } from '@editor/store/slices/fields';
import { fieldActions } from '@editor/store/slices/fields';
import type { GenericValue, Property } from '@ff-client/types/properties';

type Props = {
  property: Property;
  field: Field;
};

export const FieldComponent: React.FC<Props> = ({ property, field }) => {
  const dispatch = useAppDispatch();

  const updateValue: ControlTypes.UpdateValue<GenericValue> = (value) => {
    dispatch(
      fieldActions.edit({ uid: field.uid, handle: property.handle, value })
    );
  };

  const value = field.properties?.[property.handle];

  return (
    <FormComponent
      value={value}
      property={property}
      updateValue={updateValue}
      errors={field.errors?.[property.handle]}
      context={field}
    />
  );
};
