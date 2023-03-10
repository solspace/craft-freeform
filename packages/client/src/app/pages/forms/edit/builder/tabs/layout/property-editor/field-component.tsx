import React from 'react';
import type * as ControlTypes from '@components/form-controls';
import { FormComponent } from '@components/form-controls';
import { useAppDispatch } from '@editor/store';
import type { Field } from '@editor/store/slices/fields';
import { edit } from '@editor/store/slices/fields';
import type { Property } from '@ff-client/types/properties';

type Props = {
  property: Property;
  field: Field;
};

export const FieldComponent: React.FC<Props> = ({ property, field }) => {
  const dispatch = useAppDispatch();

  const updateValue: ControlTypes.UpdateValue<ControlTypes.ValueType> = (
    value
  ) => {
    dispatch(edit({ uid: field.uid, handle: property.handle, value }));
  };

  const value = field.properties?.[property.handle];

  return (
    <FormComponent
      value={value}
      property={property}
      updateValue={updateValue}
      context={field}
    />
  );
};
