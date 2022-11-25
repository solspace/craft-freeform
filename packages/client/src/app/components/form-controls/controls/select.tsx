import React from 'react';

import type { ControlProps, OptionProps } from '../control';
import { Control } from '../control';

export const SelectBox: React.FC<ControlProps<string | number>> = ({
  id,
  value,
  label,
  options,
  onChange,
  instructions,
}) => (
  <Control id={id} label={label} instructions={instructions}>
    <select
      id={id}
      defaultValue={(value as string | number) || ''}
      className="text fullwidth"
      onChange={(event) => onChange && onChange(event.target.value)}
    >
      {options.map(({ value, label }: OptionProps, key: number) => (
        <option key={key} value={value} label={label} />
      ))}
    </select>
  </Control>
);
