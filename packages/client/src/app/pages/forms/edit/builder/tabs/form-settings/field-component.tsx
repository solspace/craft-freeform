import React from 'react';
import { useSelector } from 'react-redux';
import { FormComponent } from '@components/form-controls';
import { formSelectors } from '@editor/store/slices/form/form.selectors';
import type { Property } from '@ff-client/types/properties';

import { useFormSettingUpdateGenerator } from './use-form-setting-update-generator';

type Props = {
  namespace: string;
  property: Property;
};

export const FieldComponent: React.FC<Props> = ({ namespace, property }) => {
  const formErrors = useSelector(formSelectors.errors);
  const value = useSelector(
    formSelectors.settings.one(namespace, property.handle)
  );

  const generateUpdateHandler = useFormSettingUpdateGenerator(namespace);

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
