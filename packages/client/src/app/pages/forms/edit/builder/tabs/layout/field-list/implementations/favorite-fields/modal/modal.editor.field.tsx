import React from 'react';
import { FormComponent } from '@components/form-controls';
import { useValueUpdateGenerator } from '@editor/store/hooks/value-update-generator';
import type { PropertyValueCollection } from '@ff-client/types/fields';
import type { GenericValue, Property } from '@ff-client/types/properties';

type Props = {
  property: Property;
  siblingProperties: Property[];
  state: PropertyValueCollection;
  errors?: string[];
  updateValueCallback: (key: string, value: GenericValue) => void;
};

export const FavoriteFieldComponent: React.FC<Props> = ({
  property,
  siblingProperties,
  state,
  errors,
  updateValueCallback,
}) => {
  const generateUpdateHandler = useValueUpdateGenerator(
    siblingProperties,
    state,
    updateValueCallback
  );

  return (
    <FormComponent
      value={state?.[property.handle] || ''}
      property={property}
      updateValue={generateUpdateHandler(property)}
      errors={errors}
      context={{ properties: state }}
    />
  );
};
