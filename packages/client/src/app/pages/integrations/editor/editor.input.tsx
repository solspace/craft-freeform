import React from 'react';
import { FormComponent } from '@components/form-controls';
import { useValueUpdateGenerator } from '@editor/store/hooks/value-update-generator';
import type { ErrorCollection } from '@ff-client/types/api';
import type { GenericValue, Property } from '@ff-client/types/properties';

import type { Integration } from '../integration.types';

import type { IntegrationState } from './editor.types';

type Props = {
  property: Property;
  integration: Integration;
  autoFocus?: boolean;
  values?: IntegrationState;
  errors?: ErrorCollection;
  onUpdate?: (key: string, value: GenericValue) => void;
};

export const EditorInput: React.FC<Props> = ({
  property,
  integration,
  autoFocus,
  values,
  errors,
  onUpdate,
}) => {
  const generateUpdateHandler = useValueUpdateGenerator(
    integration.properties,
    {},
    (key, value) => {
      onUpdate?.(key, value);
    }
  );

  const handle = property.handle;
  const value = values.metadata[handle] ?? property.value;

  const context = {
    ...integration,
    values: {
      name: values.name,
      handle: values.handle,
      enabled: values.enabled,
      ...values.metadata,
    },
  };

  return (
    <FormComponent
      autoFocus={autoFocus}
      value={value}
      property={property}
      updateValue={generateUpdateHandler(property)}
      errors={errors?.metadata?.[handle]}
      context={context}
    />
  );
};
