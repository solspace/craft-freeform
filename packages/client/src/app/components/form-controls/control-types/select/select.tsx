import React from 'react';
import { Control } from '@components/form-controls/control';
import type { ControlType } from '@components/form-controls/types';
import type { SelectProperty } from '@ff-client/types/properties';

const Select: React.FC<ControlType<SelectProperty>> = ({
  value,
  property,
  errors,
  updateValue,
}) => {
  const { handle, options, emptyOption } = property;

  return (
    <Control property={property} errors={errors}>
      <select
        id={handle}
        value={value ?? ''}
        className="text fullwidth"
        onChange={(event) => updateValue(event.target.value)}
      >
        {!!emptyOption && <option value="" label={emptyOption} />}
        {options?.map(({ value, label }, index) => (
          <option key={index} value={value} label={label} />
        ))}
      </select>
    </Control>
  );
};

export default Select;
