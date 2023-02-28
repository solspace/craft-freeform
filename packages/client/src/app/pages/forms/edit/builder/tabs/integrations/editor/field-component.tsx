import React from 'react';
import type * as ControlTypes from '@components/form-controls';
import { FormComponent } from '@components/form-controls';
import { useAppDispatch } from '@editor/store';
import { modifyIntegrationProperty } from '@editor/store/slices/integrations';
import type { Integration } from '@ff-client/types/integrations';
import type { Property } from '@ff-client/types/properties';

type Props = {
  integration: Integration;
  property: Property;
};

type ValueType = string | number | boolean;

export const FieldComponent: React.FC<Props> = ({ integration, property }) => {
  const dispatch = useAppDispatch();

  const { id } = integration;
  const { handle: key } = property;

  const updateValue: ControlTypes.UpdateValue<ValueType> = (value) => {
    dispatch(modifyIntegrationProperty({ id, key, value }));
  };

  const value = integration.properties.find(
    (prop) => prop.handle === property.handle
  ).value;

  return (
    <FormComponent
      value={value}
      property={property}
      updateValue={updateValue}
      context={integration}
    />
  );
};
