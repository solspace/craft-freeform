import React from 'react';
import { Control } from '@components/form-controls/control';
import type { ControlType } from '@components/form-controls/types';
import type { SelectProperty } from '@ff-client/types/properties';

const Select: React.FC<ControlType<string, SelectProperty>> = ({
  value,
  property,
  updateValue,
}) => {
  const { handle, options } = property;

  return (
    <Control property={property}>
      <select
        id={handle}
        value={value ?? ''}
        className="text fullwidth"
        onChange={(event) => updateValue(event.target.value)}
      >
        {options.map(({ value, label }, index) => (
          <option key={index} value={value} label={label} />
        ))}
      </select>
    </Control>
  );
};

export default Select;
