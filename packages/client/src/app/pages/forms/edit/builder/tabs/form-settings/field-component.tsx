import React from 'react';
import { useSelector } from 'react-redux';
import { FormComponent } from '@components/form-controls';
import { selectFormErrors, selectFormSetting } from '@editor/store/slices/form';
import type { Property } from '@ff-client/types/properties';

import { useValueUpdateGenerator } from './use-value-update-generator';

type Props = {
  namespace: string;
  property: Property;
};

export const FieldComponent: React.FC<Props> = ({ namespace, property }) => {
  const formErrors = useSelector(selectFormErrors);
  const value = useSelector(selectFormSetting(namespace, property.handle));

  const generateUpdateHandler = useValueUpdateGenerator(namespace);

  const errors: string[] | undefined =
    formErrors?.[namespace]?.[property.handle];

  return (
    <FormComponent
      value={value}
      property={property}
      updateValue={generateUpdateHandler(property)}
      errors={errors}
      context={namespace}
    />
  );
};
