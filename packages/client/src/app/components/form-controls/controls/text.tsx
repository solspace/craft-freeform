import React from 'react';

import type { ControlProps } from '../control';
import { Control } from '../control';

export const Text: React.FC<ControlProps<string>> = ({
  id,
  value,
  label,
  onChange,
  placeholder,
  instructions,
}) => (
  <Control id={id} label={label} instructions={instructions}>
    <input
      id={id}
      type="text"
      placeholder={placeholder}
      className="text fullwidth"
      defaultValue={(value as string) || ''}
      onChange={(event) => onChange && onChange(event.target.value)}
    />
  </Control>
);
