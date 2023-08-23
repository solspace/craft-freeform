import React from 'react';
import { FormComponent } from '@components/form-controls';
import type { IntegrationEntry } from '@editor/store/slices/integrations';
import { type Property, PropertyType } from '@ff-client/types/properties';

import { useIntegrationUpdateGenerator } from './use-integration-update-generator';

type Props = {
  integration: IntegrationEntry;
  property: Property;
};

export const FieldComponent: React.FC<Props> = ({ integration, property }) => {
  const generateUpdateHandler = useIntegrationUpdateGenerator(integration);
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
