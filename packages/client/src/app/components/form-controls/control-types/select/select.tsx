import React from 'react';
import { Dropdown } from '@components/elements/custom-dropdown/dropdown';
import { Control } from '@components/form-controls/control';
import type { ControlType } from '@components/form-controls/types';
import type { SelectProperty } from '@ff-client/types/properties';

const Select: React.FC<ControlType<SelectProperty>> = ({
  value,
  property,
  errors,
  updateValue,
}) => {
  const { options, emptyOption } = property;

  return (
    <Control property={property} errors={errors}>
      <Dropdown
        value={value ?? ''}
        emptyOption={emptyOption}
        options={options}
        onChange={updateValue}
      />
    </Control>
  );
};

export default Select;
