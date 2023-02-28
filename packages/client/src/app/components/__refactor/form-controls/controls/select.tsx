import React from 'react';
import type { SelectProperty } from '@ff-client/types/properties';

import type { FormControlType } from '../types';

import { BaseControl } from './base-control';

const Select: React.FC<FormControlType<string, SelectProperty>> = ({
  value,
  property,
  onUpdateValue,
}) => {
  const { options } = property;

  return (
    <BaseControl property={property}>
      <select
        id={property.handle}
        value={value || ''}
        className="text fullwidth"
        onChange={(event) => onUpdateValue(event.target.value)}
      >
        {options.map(({ value, label }, index) => (
          <option key={index} value={value} label={label} />
        ))}
      </select>
    </BaseControl>
  );
};

export default Select;
