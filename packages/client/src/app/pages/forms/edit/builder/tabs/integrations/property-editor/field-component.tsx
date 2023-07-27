import React from 'react';
import type * as ControlTypes from '@components/form-controls';
import { FormComponent } from '@components/form-controls';
import { useAppDispatch } from '@editor/store';
import type { IntegrationEntry } from '@editor/store/slices/integrations';
import { integrationActions } from '@editor/store/slices/integrations';
import type { GenericValue, Property } from '@ff-client/types/properties';

type Props = {
  integration: IntegrationEntry;
  property: Property;
};

export const FieldComponent: React.FC<Props> = ({ integration, property }) => {
  const dispatch = useAppDispatch();

  const { id } = integration;
  const { handle: key } = property;

  const updateValue: ControlTypes.UpdateValue<GenericValue> = (value) => {
    dispatch(integrationActions.modify({ id, key, value }));
  };

  const value = integration.values[property.handle];

  return (
    <FormComponent
      value={value}
      property={property}
      updateValue={updateValue}
      context={integration}
      animateVisibility={true}
    />
  );
};
