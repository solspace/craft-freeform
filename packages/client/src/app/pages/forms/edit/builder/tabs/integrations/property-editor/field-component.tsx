import React from 'react';
import { FormComponent } from '@components/form-controls';
import { useAppDispatch } from '@editor/store';
import { useValueUpdateGenerator } from '@editor/store/hooks/value-update-generator';
import {
  integrationActions,
  type IntegrationEntry,
} from '@editor/store/slices/integrations';
import { type Property, PropertyType } from '@ff-client/types/properties';

type Props = {
  integration: IntegrationEntry;
  property: Property;
};

export const FieldComponent: React.FC<Props> = ({ integration, property }) => {
  const dispatch = useAppDispatch();
  const generateUpdateHandler = useValueUpdateGenerator(
    integration.properties,
    integration.values,
    (key, value) => {
      dispatch(
        integrationActions.modify({
          id: integration.id,
          key,
          value,
        })
      );
    }
  );
  const value = integration.values[property.handle];

  if (property.type === PropertyType.Hidden) {
    return null;
  }

  return (
    <FormComponent
      value={value}
      property={property}
      updateValue={generateUpdateHandler(property)}
      context={integration}
    />
  );
};
