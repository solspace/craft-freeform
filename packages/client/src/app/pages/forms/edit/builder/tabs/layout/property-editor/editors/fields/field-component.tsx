import React from 'react';
import { FormComponent } from '@components/form-controls';
import type { Field } from '@editor/store/slices/fields';
import type { Property } from '@ff-client/types/properties';

import { useFieldPropertyUpdateGenerator } from './use-field-property-update-generator';

type Props = {
  property: Property;
  field: Field;
};

export const FieldComponent: React.FC<Props> = ({ property, field }) => {
  const generateUpdateHandler = useFieldPropertyUpdateGenerator(field);
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
