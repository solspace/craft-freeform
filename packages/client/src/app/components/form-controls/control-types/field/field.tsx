import React from 'react';
import { useSelector } from 'react-redux';
import type { ControlType } from '@components/form-controls/types';
import { fieldSelectors } from '@editor/store/slices/fields/fields.selectors';
import type { SelectProperty } from '@ff-client/types/properties';

import Select from '../select/select';

const Field: React.FC<ControlType<string>> = ({
  value,
  property,
  errors,
  updateValue,
}) => {
  const fields = useSelector(fieldSelectors.all);

  property.options = fields.map((field) => ({
    value: field.uid,
    label: field.properties.label,
  }));

  return (
    <Select
      property={property as SelectProperty}
      updateValue={updateValue}
      value={value}
      errors={errors}
    />
  );
};

export default Field;
