import React from 'react';
import { useSelector } from 'react-redux';
import { FormComponent } from '@components/form-controls';
import { selectFormSetting } from '@editor/store/slices/form';
import type { Property } from '@ff-client/types/properties';

import { useValueUpdateGenerator } from './use-value-update-generator';

type Props = {
  namespace: string;
  property: Property;
};

export const FieldComponent: React.FC<Props> = ({ namespace, property }) => {
  const value = useSelector(selectFormSetting(namespace, property.handle));

  const generateUpdateHandler = useValueUpdateGenerator(namespace);

  return (
    <FormComponent
      value={value}
      property={property}
      updateValue={generateUpdateHandler(property)}
      context={namespace}
    />
  );
};
