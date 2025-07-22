import React from 'react';
import { FormComponent } from '@components/form-controls';
import { useValueUpdateGenerator } from '@editor/store/hooks/value-update-generator';
import type { GenericValue, Property } from '@ff-client/types/properties';

import type { Integration } from '../integration.types';

type Props = {
  property: Property;
  integration: Integration;
  autoFocus?: boolean;
  values?: Record<string, GenericValue>;
  errors?: Record<string, string[]>;
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
  const value = values[handle] ?? property.value;

  const context = {
    ...integration,
    values,
  };

  return (
    <FormComponent
      autoFocus={autoFocus}
      value={value}
      property={property}
      updateValue={generateUpdateHandler(property)}
      errors={errors?.[handle]}
      context={context}
    />
  );
};
